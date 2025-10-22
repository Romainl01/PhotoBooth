import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Style prompts
const STYLE_PROMPTS = {
  'Executive': 'Transform this photo into a dramatic black and white portrait in editorial style. Preserve subject\'s exact body proportions, facial structure, and physique. Apply these specifications: monochromatic treatment with rich grayscale tones, deep charcoal or black background with subtle gradation, dramatic side lighting creating strong shadows and highlights on face (Rembrandt or split lighting), preserve all natural skin texture and detail - no smoothing, sharp focus capturing fine details in eyes and facial features, relaxed and contemplative expression - not smiling, well-fitted casual professional attire (tailored dark textured jacket, no tie), hand gesture near chest or face for dynamic composition, high contrast with deep blacks and bright highlights, cinematic film grain for texture. Camera angle at eye level or slightly above for flattering perspective. Maintain editorial photography aesthetic - artistic but professional. Preserve subject\'s authentic body shape and features accurately.',
  'Wes Anderson': 'Preserve facial features and face shape of the person. Transform into Wes Anderson character from 1960s-70s era: men in tailored corduroy or tweed suits, knit sweaters or vests, bow ties, leather suspenders, round vintage eyeglasses, meticulously groomed mustaches, oxford shoes; women in modest vintage dresses, cardigans, pearl necklaces, classic period hairstyles, mary jane shoes. Add iconic Wes Anderson environment: perfectly centered symmetrical composition, vintage hotel interiors, ornate patterned wallpapers, antique wooden furniture arranged symmetrically, stacked vintage leather suitcases, grandfather clocks, gilt-framed paintings, library bookshelves, art deco details, retro cameras, old typewriters, candlestick holders. Apply signature pastel color palette with warm beige, dusty rose pink, mint green, mustard yellow, burnt orange tones. Use soft diffused natural lighting, precisely centered framing with strong bilateral symmetry, and create whimsical nostalgic cinematic atmosphere with meticulous attention to production design detail and vintage aesthetic.',
  'Urban': 'Maintain exact facial features, face shape, skin tone, and complete physical identity of the person. Do not alter facial structure. Create natural documentary-style portrait of subject standing still on busy city street during blue hour evening, looking at camera with natural neutral expression. Subject wearing stylish dark urban outerwear: men in wool overcoat, blazer, bomber jacket, or leather jacket with dark shirt or sweater; women in trench coat, wool coat, peacoat, or structured jacket with dark top or sweater. Preserve subject\'s authentic body proportions and physique exactly. Moderate motion blur on pedestrians walking past - blurred enough to show movement but not ghostly, maintaining natural street photography aesthetic. City lights and neon signs in background create soft natural bokeh, not exaggerated. Apply realistic blue hour lighting with natural balance of cool and warm tones from street lights, subtle cinematic color grading without oversaturation, natural 35mm film look with minimal grain, shallow depth of field keeping subject in sharp focus while background softly blurred. Camera at exact eye level, natural documentary photography perspective. Authentic street photography style - professional but realistic, not overly stylized. Critical: preserve person\'s original facial identity, expressions, and body shape with maximum accuracy.',
  'Runway': 'Preserve exact facial features, face shape, skin tone, and complete physical identity of the person. Maintain authentic body proportions and physique exactly as in original photo. Create high-fashion runway portrait capturing editorial fashion show aesthetic. Subject wearing bold contemporary fashion: men in statement pieces like textured blazers, luxury knitwear with dramatic details, designer shirts with striking accessories, leather jackets with chains or jewelry; women in editorial runway pieces like embellished blazers, designer dresses with bold details, luxury tops with statement jewelry, haute couture with dramatic accessories. Include eye-catching styling details: pearl necklaces, metallic brooches, chunky chains, designer eyewear, collar embellishments. Colors flexible: rich navy, camel brown, black, earth tones, or bold runway colors. Impeccably fitted high-fashion pieces that showcase natural physique. Subject positioned with runway model demeanor: strong confident posture, intense direct gaze with serious neutral expression - no smile, chin slightly lifted, powerful presence as if walking fashion show. Apply runway photography lighting: bright even frontal lighting creating minimal shadows, professional fashion show illumination with clean uniform exposure across face and clothing. Preserve natural skin texture with editorial finish - authentic but polished. Professional runway styling with contemporary grooming and makeup appropriate to high-fashion aesthetic. Background: soft out-of-focus runway environment with warm abstract tones (amber, caramel, golden brown) or cool neutral tones (soft gray, blue-gray) creating dreamy bokeh effect suggesting fashion show setting. Frame from mid-chest upward capturing runway moment, editorial composition with subject centrally positioned. Shot with 85mm lens at f/2.0 for shallow depth of field keeping subject tack-sharp while background beautifully blurred, capturing sense of motion and energy. Camera positioned at eye level or slightly below for commanding runway perspective. Apply contemporary fashion week photography aesthetic inspired by runway shows, backstage moments, and editorial fashion photography - Vogue Runway, WWD style with bold confident energy. Professional color grading with rich saturated tones, luminous skin, and editorial contrast. High-fashion runway portfolio quality capturing model in their element. PRIORITY: keep original person\'s complete facial identity, natural features, exact body shape, and authentic appearance intact while achieving premium fashion runway standard.',
  'LinkedIn': 'CRITICAL PRIORITY: Preserve the EXACT face, facial structure, features, and identity from the input photo. Do not alter facial appearance. Keep face identical to original. Create professional LinkedIn headshot portrait. Subject wearing business blazer with dress shirt. Face camera directly with natural smile and eye contact. Soft diffused lighting with no shadows. Clean light gray background. Standard headshot framing from chest to above head. 85mm lens at f/2.8, camera at eye level. ESSENTIAL: Maintain complete facial identity and likeness from original photo.'
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
