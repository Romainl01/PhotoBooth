import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Style prompts
const STYLE_PROMPTS = {
  'Creative Professional': 'Transform this photo into a close-up portrait with shallow depth of field creating soft bokeh background. Warm, natural lighting highlighting subject\'s features. Casual attire and genuine, engaging smile. Subject fills more of the frame. Background hints at creative workspace or outdoor setting with beautiful blur. Preserve natural skin texture and authentic features. Modern, approachable creative professional aesthetic. Make subject look great and accurate to their original appearance.',

  'Corporate Professional': 'Transform this photo into a polished profile shot maintaining the exact facial features and identity. Subject framed chest-up with headroom, eyes looking directly at camera while body angles slightly away. White t-shirt with black leather jacket, open smile. Neutral studio background. High-angle perspective with soft, diffused lighting creating gentle catchlights. 85mm lens aesthetic with shallow depth of field - sharp focus on eyes, soft bokeh background. Natural skin texture with visible hair detail. Bright, airy feel. Make subject look great and accurate to their original appearance.',

  'Executive Professional': 'Transform this photo into a dramatic black and white portrait in editorial style. Preserve subject\'s authentic features and character. Apply these specifications: monochromatic treatment with rich grayscale tones, deep charcoal or black background with subtle gradation, dramatic side lighting creating strong shadows and highlights on face (Rembrandt or split lighting), preserve all natural skin texture and detail - no smoothing, sharp focus capturing fine details in eyes and facial features, relaxed and contemplative expression - not smiling, casual professional attire (dark textured jacket, no tie), hand gesture near chest or face for dynamic composition, high contrast with deep blacks and bright highlights, cinematic film grain for texture. Maintain editorial photography aesthetic - artistic but professional. Make subject look great and accurate to their original appearance.'
};

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
    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['Creative Professional'];

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

    // Extract generated image from response
    let generatedImageData = null;

    for (const part of response.candidates[0].content.parts) {
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
