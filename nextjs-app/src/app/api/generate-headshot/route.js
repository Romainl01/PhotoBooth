import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { STYLE_PROMPTS } from '@/constants/stylePrompts';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

export async function POST(request) {
  try {
    // ==================== PHASE 2A: AUTH & CREDIT CHECKS ====================

    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Auth Check - Unauthorized', { error: authError?.message });
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to generate images.' },
        { status: 401 }
      );
    }

    logger.debug('Auth Check - User authenticated', { userId: user.id });

    // 2. Check credits BEFORE generation (saves Gemini API costs)
    // Note: Credit system provides natural rate limiting - users can't spam beyond their credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Credit Check - Profile not found', { error: profileError?.message });
      return NextResponse.json(
        { error: 'User profile not found. Please contact support.' },
        { status: 404 }
      );
    }

    logger.debug('Credit Check - User credits', { credits: profile.credits });

    // 3. Block if insufficient credits (402 = Payment Required)
    if (profile.credits < 1) {
      logger.info('Credit Check - Insufficient credits, blocking generation');
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          needsCredits: true,
          message: 'You need credits to generate images. Please purchase more credits to continue.'
        },
        { status: 402 } // 402 Payment Required - signals client to show paywall
      );
    }

    // ==================== EXISTING GENERATION LOGIC ====================

    const { image, style } = await request.json();

    if (!image || !style) {
      return NextResponse.json(
        { error: 'Missing image or style parameter' },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Get prompt for the selected style
    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.Executive;

    logger.debug('Generating headshot', { style });

    // Prepare the request with text prompt first, then image
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ];

    // Call Google GenAI API with quota error handling
    let response
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
      });
    } catch (apiError) {
      logger.error('Gemini API error', { error: apiError.message })

      // Check for quota/rate limit errors
      if (
        apiError.status === 429 ||
        apiError.message?.includes('quota') ||
        apiError.message?.includes('rate limit') ||
        apiError.code === 'RESOURCE_EXHAUSTED'
      ) {
        logger.error('QUOTA EXCEEDED - Gemini API quota exhausted', {
          userId: user.id,
          timestamp: new Date().toISOString(),
          error: apiError.message
        })

        return NextResponse.json(
          {
            error: 'Service temporarily at capacity',
            message: 'Our AI service is experiencing high demand. Please try again in a few minutes. Your credit was NOT used.',
            retryAfter: 60
          },
          { status: 503 }
        )
      }

      // Re-throw other errors
      throw apiError
    }

    // Validate response structure
    if (!response || !response.candidates || response.candidates.length === 0) {
      logger.error('Invalid API response - no candidates', { hasResponse: !!response });
      throw new Error('No candidates in API response');
    }

    const candidate = response.candidates[0];

    // Check for API rejection with specific finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      logger.error('API rejected generation', { finishReason: candidate.finishReason });

      // Provide user-friendly error messages based on finish reason
      const errorMessages = {
        'SAFETY': 'Image cannot be processed due to safety guidelines',
        'IMAGE_OTHER': 'Unable to process this image. Please try a different photo with clear facial features',
        'MAX_TOKENS': 'We couldn\'t create your image. Please try a different photo',
        'RECITATION': 'Image too similar to existing content'
      };

      const userMessage = errorMessages[candidate.finishReason] || 'Image could not be processed';
      throw new Error(userMessage);
    }

    if (!candidate.content || !candidate.content.parts) {
      logger.error('Invalid candidate structure', { hasContent: !!candidate.content });
      throw new Error('Invalid response structure from API');
    }

    // Extract generated image from response
    let generatedImageData = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        generatedImageData = part.inlineData.data;
        break;
      }
    }

    if (!generatedImageData) {
      throw new Error('No image data in response');
    }

    // ==================== PHASE 2A: DEDUCT CREDIT ====================

    // Deduct credit AFTER successful generation (atomic operation)
    logger.debug('Credit Deduction - Attempting to deduct credit', { userId: user.id, style });

    const { error: deductError } = await supabase.rpc('deduct_credit', {
      p_user_id: user.id,
      p_filter_name: style
    });

    if (deductError) {
      // CRITICAL: Fail-closed approach - don't give image if we can't charge
      logger.error('CRITICAL - Credit deduction failed but image was generated', {
        userId: user.id,
        style: style,
        error: deductError.message,
        timestamp: new Date().toISOString(),
        alert: 'MANUAL_REVIEW_REQUIRED'
      });

      return NextResponse.json(
        {
          error: 'Failed to process your request',
          message: 'Unable to complete generation. Your credit was NOT deducted. Please try again.',
          technical: deductError.message
        },
        { status: 500 }
      );
    }

    logger.info('Credit Deduction - Success', { userId: user.id, style });

    // Return the generated image as base64 (only if credit was deducted)
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${generatedImageData}`,
      style: style
    });

  } catch (error) {
    logger.error('Error generating headshot', { error: error.message });
    return NextResponse.json(
      {
        error: 'Failed to generate headshot',
        message: error.message
      },
      { status: 500 }
    );
  }
}
