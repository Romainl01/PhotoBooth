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
