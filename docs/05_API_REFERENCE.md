# 5. API Reference

## 5.1 Endpoint: Generate Headshot

**POST** `/api/generate-headshot`

Generates an AI-styled image based on uploaded photo and selected filter.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "style": "Executive"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Base64-encoded image data URL (JPEG/PNG) |
| `style` | string | Yes | Filter name (must match FILTERS array) |

### Response

**Success (200):**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "style": "Executive"
}
```

**Error (400) - Missing Parameters:**
```json
{
  "error": "Missing image or style parameter"
}
```

**Error (500) - Generation Failure:**
```json
{
  "error": "Failed to generate headshot",
  "message": "Detailed error message from Gemini API"
}
```

### Example Usage

```javascript
const response = await fetch('/api/generate-headshot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: capturedImageDataUrl,
    style: 'Executive'
  })
})

const data = await response.json()

if (response.ok) {
  console.log('Generated image:', data.image)
  console.log('Applied style:', data.style)
} else {
  console.error('Error:', data.error)
}
```

### Implementation Details

**File:** `src/app/api/generate-headshot/route.js`

```javascript
import { GoogleGenAI } from '@google/genai'
import { STYLE_PROMPTS } from '@/constants/stylePrompts'

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY)

export async function POST(request) {
  try {
    const { image, style } = await request.json()

    // Validation
    if (!image || !style) {
      return Response.json(
        { error: 'Missing image or style parameter' },
        { status: 400 }
      )
    }

    // Get style prompt
    const prompt = STYLE_PROMPTS[style]
    if (!prompt) {
      return Response.json(
        { error: 'Invalid style parameter' },
        { status: 400 }
      )
    }

    // Strip data URL prefix
    const base64Image = image.split(',')[1]

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      },
      { text: prompt }
    ])

    const generatedImage = result.response.candidates[0].content.parts[0].inlineData.data
    const generatedDataUrl = `data:image/png;base64,${generatedImage}`

    return Response.json({
      success: true,
      image: generatedDataUrl,
      style: style
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json(
      {
        error: 'Failed to generate headshot',
        message: error.message
      },
      { status: 500 }
    )
  }
}
```

## 5.2 Endpoint: Health Check

**GET** `/api/health`

Health check endpoint for monitoring API status.

### Request

No parameters required.

### Response

**Success (200):**
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

**Missing API Key:**
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "No"
}
```

### Example Usage

```bash
curl http://localhost:3000/api/health
```

```javascript
const response = await fetch('/api/health')
const data = await response.json()
console.log('API Status:', data.status)
console.log('API Key:', data.apiKeyConfigured)
```

## 5.3 Error Codes

| HTTP Code | Meaning | Typical Cause |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing or invalid parameters |
| 500 | Internal Server Error | Gemini API failure, server error |

## 5.4 Rate Limiting

**Current Status:** Not implemented (planned feature)

**Reference:** See `RATE_LIMIT_REFERENCE.md` for Upstash Redis implementation guide.

**Planned Limits:**
- 10 requests per minute per IP
- 100 requests per day per IP
