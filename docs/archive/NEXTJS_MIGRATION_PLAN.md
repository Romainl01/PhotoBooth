# Next.js Migration Plan: AI Professional Headshot Generator

## Overview
Functional migration plan where each step produces a **testable, working feature**. Each milestone can be validated in the browser.

**Total Time:** ~2-3 hours
**Validation:** Test in browser after each step

---

## Migration Steps

### Step 1: Create Next.js Project with Tailwind
**Time:** 10 minutes
**Goal:** Working Next.js app with Tailwind CSS configured

**Actions:**
```bash
cd /Users/romainlagrange/Desktop/VibeCoding/NanoBananaTutorial
npx create-next-app@latest nextjs-app --no-typescript --eslint --tailwind --src-dir --app --import-alias="@/*"
cd nextjs-app
npm install @google/genai dotenv
```

**Configure Tailwind** (`tailwind.config.js`):
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update global styles** (`src/app/globals.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**✅ Validation:**
```bash
npm run dev
```
- Open http://localhost:3000
- Should see default Next.js page with Tailwind working
- Check that page loads without errors

---

### Step 2: Setup Environment Variables & API Route (Backend)
**Time:** 10 minutes
**Goal:** Working API endpoint that returns health check

**Actions:**

1. **Copy environment variables:**
```bash
cp ../server/.env .env.local
```

2. **Create API route structure:**
```bash
mkdir -p src/app/api/health
mkdir -p src/app/api/generate-headshot
```

3. **Create health check** (`src/app/api/health/route.js`):
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Headshot Studio API is running',
    apiKeyConfigured: process.env.GOOGLE_API_KEY ? 'Yes' : 'No'
  });
}
```

**✅ Validation:**
- Server should still be running (npm run dev)
- Open http://localhost:3000/api/health
- Should see JSON response:
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

---

### Step 3: Implement Full Image Generation API
**Time:** 10 minutes
**Goal:** Working API endpoint for headshot generation (testable via curl/Postman)

**Actions:**

Create `src/app/api/generate-headshot/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const STYLE_PROMPTS = {
  'Corporate Classic': 'Transform this photo into a polished profile shot maintaining the exact facial features and identity. Subject framed chest-up with headroom, eyes looking directly at camera while body angles slightly away. White t-shirt with black leather jacket, open smile. Neutral studio background. High-angle perspective with soft, diffused lighting creating gentle catchlights. 85mm lens aesthetic with shallow depth of field - sharp focus on eyes, soft bokeh background. Natural skin texture with visible hair detail. Bright, airy feel. Make subject look great and accurate to their original appearance.',

  'Creative Professional': 'Transform this photo into a close-up portrait with shallow depth of field creating soft bokeh background. Warm, natural lighting highlighting subject\'s features. Casual attire and genuine, engaging smile. Subject fills more of the frame. Background hints at creative workspace or outdoor setting with beautiful blur. Preserve natural skin texture and authentic features. Modern, approachable creative professional aesthetic. Make subject look great and accurate to their original appearance.',

  'Executive Portrait': 'Transform this photo into a dramatic black and white portrait in editorial style. Preserve subject\'s authentic features and character. Apply these specifications: monochromatic treatment with rich grayscale tones, deep charcoal or black background with subtle gradation, dramatic side lighting creating strong shadows and highlights on face (Rembrandt or split lighting), preserve all natural skin texture and detail - no smoothing, sharp focus capturing fine details in eyes and facial features, relaxed and contemplative expression - not smiling, casual professional attire (dark textured jacket, no tie), hand gesture near chest or face for dynamic composition, high contrast with deep blacks and bright highlights, cinematic film grain for texture. Maintain editorial photography aesthetic - artistic but professional. Make subject look great and accurate to their original appearance.'
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

    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['Creative Professional'];

    console.log(`Generating headshot with style: ${style}`);

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

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
```

**✅ Validation:**
- API endpoint exists at http://localhost:3000/api/generate-headshot
- Test with curl (use base64 image from your existing app's localStorage):
```bash
curl -X POST http://localhost:3000/api/generate-headshot \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQ...", "style":"Creative Professional"}'
```
- Should return JSON with `success: true` and base64 image
- Check terminal logs for "Generating headshot with style: ..."

---

### Step 4: Migrate CameraCapture Component
**Time:** 10 minutes
**Goal:** Camera component working in isolation

**Actions:**

1. **Create components directory:**
```bash
mkdir -p src/components
```

2. **Create `src/components/CameraCapture.jsx`** (copy from `client/src/components/CameraCapture.jsx` and add `'use client'` at top):

```javascript
'use client'

import { useRef, useState, useEffect } from 'react'

export default function CameraCapture({ onCapture, selectedStyle, onStyleChange }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [facingMode, setFacingMode] = useState('user')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
      setIsLoading(false)
    } catch (err) {
      console.error('Camera error:', err)
      setError('Could not access camera. Please check permissions.')
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      context.scale(-1, 1)
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      stopCamera()
      onCapture(imageData)
    }
  }

  const retryCamera = () => {
    startCamera()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-zinc-900 rounded-2xl p-8">
        <div className="text-6xl mb-6">📷</div>
        <h2 className="text-2xl font-bold mb-2">Camera Error</h2>
        <p className="text-gray-400 mb-6 text-center">{error}</p>
        <button
          onClick={retryCamera}
          className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Starting camera...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-105 transition-transform border-4 border-white"
            aria-label="Capture photo"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-3 justify-center px-4">
          <button
            onClick={() => onStyleChange('Corporate Classic')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Corporate Classic'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Corporate
          </button>
          <button
            onClick={() => onStyleChange('Creative Professional')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Creative Professional'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Creative
          </button>
          <button
            onClick={() => onStyleChange('Executive Portrait')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Executive Portrait'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Executive
          </button>
        </div>
      </div>
    </div>
  )
}
```

**✅ Validation:**
- Component file created
- No syntax errors
- Ready to be used in main page (next step will test it)

---

### Step 5: Create Main Page with Camera (No API Yet)
**Time:** 10 minutes
**Goal:** See camera working in the browser, can capture photos

**Actions:**

Replace `src/app/page.js` with:

```javascript
'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'

export default function Home() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('Creative Professional')
  const [showCamera, setShowCamera] = useState(true)

  const handleCapture = (imageData) => {
    setCapturedImage(imageData)
    setShowCamera(false)
    localStorage.setItem('capturedImage', imageData)
    console.log('Image captured!', imageData.substring(0, 50) + '...')
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setShowCamera(true)
    localStorage.removeItem('capturedImage')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-screen overflow-hidden">
        {showCamera ? (
          <CameraCapture
            onCapture={handleCapture}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
        ) : (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute bottom-8 left-0 right-0 px-4">
              <div className="flex gap-4 max-w-2xl mx-auto">
                <button
                  onClick={handleRetake}
                  className="flex-1 px-6 py-4 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                >
                  Retake Photo
                </button>
                <button
                  className="flex-1 px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold transition-colors"
                >
                  Generate Headshot (Coming Next)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

Update `src/app/layout.js`:

```javascript
import './globals.css'

export const metadata = {
  title: 'AI Professional Headshot Generator',
  description: 'Transform casual photos into professional headshots using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

**✅ Validation:**
- Open http://localhost:3000
- Camera should start automatically
- Grant camera permissions
- See live video preview (mirrored)
- Style buttons work (Corporate, Creative, Executive - see yellow highlight)
- Click camera button to capture
- Should see captured image displayed
- "Retake Photo" button returns to camera
- Check browser console for "Image captured!" log
- Check localStorage in DevTools (capturedImage key should exist)

---

### Step 6: Integrate API with Full Generation Flow
**Time:** 15 minutes
**Goal:** Complete end-to-end flow: capture → generate → display

**Actions:**

Update `src/app/page.js` to add generation logic:

```javascript
'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'

export default function Home() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('Creative Professional')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCamera, setShowCamera] = useState(true)

  const handleCapture = (imageData) => {
    setCapturedImage(imageData)
    setShowCamera(false)
    localStorage.setItem('capturedImage', imageData)
  }

  const handleGenerate = async () => {
    if (!capturedImage) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage,
          style: selectedStyle
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImage(data.image)
        localStorage.setItem('generatedImage', data.image)
      } else {
        console.error('Generation failed:', data.error)
        alert('Failed to generate headshot. Please try again.')
      }
    } catch (error) {
      console.error('Error generating headshot:', error)
      alert('Error connecting to server. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setGeneratedImage(null)
    setShowCamera(true)
    localStorage.removeItem('capturedImage')
    localStorage.removeItem('generatedImage')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-screen overflow-hidden">
        {showCamera ? (
          <CameraCapture
            onCapture={handleCapture}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
        ) : (
          <>
            <img
              src={generatedImage || capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {isGenerating && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mb-4"></div>
                  <p className="text-xl font-semibold text-white">Generating your headshot...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-8 left-0 right-0 px-4">
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => setSelectedStyle('Corporate Classic')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Corporate Classic'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Corporate
                </button>
                <button
                  onClick={() => setSelectedStyle('Creative Professional')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Creative Professional'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Creative
                </button>
                <button
                  onClick={() => setSelectedStyle('Executive Portrait')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Executive Portrait'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Executive
                </button>
              </div>

              <div className="flex gap-4 max-w-2xl mx-auto">
                <button
                  onClick={handleRetake}
                  className="flex-1 px-6 py-4 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : generatedImage ? 'Generate Again' : 'Generate Headshot'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

**✅ Validation:**
- Capture a photo
- Click "Generate Headshot" button
- See loading spinner with "Generating your headshot..." message
- Wait 5-15 seconds
- Generated image should replace captured image
- Change style and click "Generate Again" - should generate different style
- Try all 3 styles:
  - Corporate Classic: Polished professional look
  - Creative Professional: Warm, approachable style
  - Executive Portrait: Black & white dramatic portrait
- "Retake Photo" returns to camera
- localStorage stores both capturedImage and generatedImage

---

### Step 7: Test Production Build
**Time:** 10 minutes
**Goal:** Verify app builds and runs in production mode

**Actions:**

```bash
npm run build
npm run start
```

**✅ Validation:**
- Build completes without errors
- Production server starts on http://localhost:3000
- Test complete flow:
  - Camera capture works
  - Image generation works
  - All 3 styles work
  - UI looks identical
- Check terminal for any errors
- Verify no console warnings in browser

**If build fails:**
- Check for missing `'use client'` directives
- Verify all imports are correct
- Check for syntax errors

---

### Step 8: Deploy to Vercel
**Time:** 15 minutes
**Goal:** Live production app on Vercel

**Actions:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

Follow prompts:
- Set up and deploy? → Yes
- Which scope? → [Your account]
- Link to existing project? → No
- Project name? → ai-headshot-studio
- Directory? → ./
- Modify settings? → No

3. **Add Environment Variable in Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add: `GOOGLE_API_KEY` = [Your API key]
   - Select: Production, Preview, Development

4. **Redeploy with env vars:**
```bash
vercel --prod
```

**✅ Validation:**
- Open production URL (e.g., https://ai-headshot-studio.vercel.app)
- Camera works (HTTPS ensures camera permissions)
- Capture photo
- Generate headshot with all 3 styles
- Test on mobile device (camera should work)
- Check responsive design
- Verify API calls succeed in production
- Monitor Vercel dashboard → Functions tab for any errors

---

### Step 9: Final Validation & Comparison
**Time:** 10 minutes
**Goal:** Confirm 100% feature parity with original app

**Actions:**

**Side-by-side comparison:**

Open both apps:
- Original: Stop Next.js, start `cd server && npm run dev` + `cd client && npm run dev`
- New: http://localhost:3000 (or Vercel URL)

**Test checklist:**
- [ ] Camera starts automatically
- [ ] Video preview is mirrored
- [ ] Style buttons work identically
- [ ] Capture button styling matches
- [ ] Captured image display matches
- [ ] Loading spinner looks the same
- [ ] Generated images have same quality
- [ ] All 3 styles produce same results
- [ ] Retake functionality identical
- [ ] localStorage behavior same
- [ ] Mobile responsive (test on phone)
- [ ] No console errors
- [ ] Performance feels similar

**✅ Validation:**
- All features work identically
- UI/UX is pixel-perfect match
- No regressions

---

## Quick Reference

### Development Commands
```bash
cd nextjs-app
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run production build
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

### Project Structure
```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-headshot/route.js  (Backend API)
│   │   │   └── health/route.js
│   │   ├── layout.js
│   │   ├── page.js                          (Main app)
│   │   └── globals.css
│   └── components/
│       └── CameraCapture.jsx
├── .env.local                                (Environment vars)
├── next.config.js
├── tailwind.config.js
└── package.json
```

### Rollback to Original
```bash
# Stop Next.js (Ctrl+C)
cd ../server && npm run dev &
cd ../client && npm run dev
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera doesn't work | Ensure HTTPS (Vercel provides this automatically) |
| API fails | Check `.env.local` has `GOOGLE_API_KEY` |
| Build errors | Verify `'use client'` on all components using hooks |
| Styles not applying | Check Tailwind config content paths |
| 500 errors | Check Vercel Functions logs in dashboard |

---

## Success Criteria

✅ Migration complete when:
1. Camera capture works identically
2. All 3 styles generate correctly
3. UI/UX matches exactly
4. Production build succeeds
5. Deployed to Vercel successfully
6. Works on mobile devices
7. No console errors
8. localStorage functions the same

---

**Total Steps:** 9 functional milestones
**Total Time:** ~2-3 hours
**Each step validated:** Test in browser ✅
