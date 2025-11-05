import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { STYLE_PROMPTS } from '@/constants/stylePrompts';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

export async function POST(request) {
  try {
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

    console.log(`Generating headshot with style: ${style}`);

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

    // Call Google GenAI API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

    // Validate response structure
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('Invalid API response:', JSON.stringify(response, null, 2));
      throw new Error('No candidates in API response');
    }

    const candidate = response.candidates[0];

    // Check for API rejection with specific finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('API rejected generation:', JSON.stringify(candidate, null, 2));

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
      console.error('Invalid candidate structure:', JSON.stringify(candidate, null, 2));
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

    // Return the generated image as base64
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${generatedImageData}`,
      style: style
    });

  } catch (error) {
    console.error('Error generating headshot:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate headshot',
        message: error.message
      },
      { status: 500 }
    );
  }
}
