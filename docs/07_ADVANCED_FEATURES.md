# 7. Advanced Features

## 7.1 Camera Management

### Initialization

**Request Camera Access:**
```javascript
const initializeCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode, // 'user' or 'environment'
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    streamRef.current = stream

    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  } catch (error) {
    handleCameraError(error)
  }
}
```

### Camera Switching (Mobile)

```javascript
const switchCamera = async () => {
  // Stop current stream
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop())
  }

  // Toggle facing mode
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
  setCurrentFacingMode(newFacingMode)

  // Reinitialize with new facing mode
  await initializeCamera()
}
```

### Cleanup

```javascript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }
}, [])
```

### Error Handling

```javascript
const handleCameraError = (error) => {
  let errorMessage = 'Camera access denied'

  if (error.name === 'NotAllowedError') {
    errorMessage = 'Please allow camera access in your browser settings'
  } else if (error.name === 'NotFoundError') {
    errorMessage = 'No camera found on this device'
  } else if (error.name === 'NotReadableError') {
    errorMessage = 'Camera is already in use by another application'
  }

  setErrorMessage(errorMessage)
  setCurrentScreen(SCREENS.CAMERA_ERROR)
}
```

## 7.2 Image Capture & Processing

### Canvas Capture

```javascript
const captureImageFromVideo = (video, canvas) => {
  const context = canvas.getContext('2d')

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Apply horizontal flip (mirror effect)
  context.save()
  context.translate(canvas.width, 0)
  context.scale(-1, 1)

  // Draw video frame
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Restore context
  context.restore()

  // Convert to data URL
  return canvas.toDataURL('image/jpeg', 0.95)
}
```

### File Upload Processing

```javascript
const handleUpload = () => {
  const fileInput = fileInputRef.current

  if (!fileInput) return

  fileInput.onchange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const imageDataUrl = event.target.result
      setCapturedImage(imageDataUrl)
      setCurrentScreen(SCREENS.LOADING)
      generateImage(imageDataUrl)
    }

    reader.onerror = () => {
      alert('Failed to read file')
    }

    reader.readAsDataURL(file)
  }

  fileInput.click()
}
```

### Image Validation

```javascript
const validateImage = (imageDataUrl) => {
  // Check if image is empty
  if (imageDataUrl === 'data:,') {
    throw new Error('Captured image is empty')
  }

  // Check if data URL is valid
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Invalid image format')
  }

  // Check file size (max 10MB)
  const sizeInBytes = (imageDataUrl.length * 3) / 4
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (sizeInBytes > maxSize) {
    throw new Error('Image size exceeds 10MB limit')
  }

  return true
}
```

## 7.3 AI Image Generation

### Gemini API Integration

**Model Configuration:**
```javascript
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-image'
})
```

**Generation Request:**
```javascript
const generateWithGemini = async (base64Image, stylePrompt) => {
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image  // without data URL prefix
        }
      },
      {
        text: stylePrompt
      }
    ])

    // Extract generated image
    const generatedImageData = result.response.candidates[0]
      .content.parts[0].inlineData.data

    return `data:image/png;base64,${generatedImageData}`

  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate image: ' + error.message)
  }
}
```

### Prompt Engineering

**Key Principles:**
1. **Identity Preservation:** Emphasize maintaining exact facial features
2. **Specificity:** Detailed descriptions of style, lighting, clothing
3. **Constraints:** Realistic proportions, natural hair, authentic styling
4. **Context:** Background, mood, artistic references

**Example Prompt Structure:**
```javascript
const promptTemplate = `
Create a [STYLE TYPE] portrait featuring the person in [SETTING/CONTEXT].

Visual Style:
- [Specific artistic style references]
- [Lighting details]
- [Color palette]

Clothing & Appearance:
- [Detailed clothing description]
- [Accessories]
- [Styling details]

Critical Constraints:
- Maintain EXACT facial features and identity
- Preserve natural hair color and style
- Keep realistic human body proportions
- Authentic [STYLE] aesthetic

Background & Mood:
- [Background description]
- [Atmospheric details]
- [Mood and tone]
`
```

## 7.4 Watermarking System

### Implementation

**File:** `src/lib/watermark.js`

```javascript
export const addWatermark = (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Create canvas with device pixel ratio
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1

      canvas.width = img.width * dpr
      canvas.height = img.height * dpr

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Configure watermark text
      const text = 'created with Morpheo - morpheo-phi.vercel.app/'
      const baseFontSize = Math.max(canvas.width, canvas.height) / 60
      const fontSize = Math.min(baseFontSize, 4096) // Mobile safety cap

      ctx.font = `900 ${fontSize}px "IBM Plex Mono", monospace`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'

      // Draw watermark (bottom-right)
      const padding = fontSize * 0.5
      ctx.fillText(
        text,
        canvas.width - padding,
        canvas.height - padding
      )

      // Convert to data URL
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.95)
      resolve(watermarkedDataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'))
    }

    img.src = imageDataUrl
  })
}
```

### Usage in Components

```javascript
const handleDownload = async () => {
  try {
    const watermarkedImage = await addWatermark(generatedImage)

    // Create download link
    const link = document.createElement('a')
    link.href = watermarkedImage
    link.download = `morpheo-${Date.now()}.jpg`
    link.click()

  } catch (error) {
    console.error('Download failed:', error)
    alert('Failed to download image')
  }
}
```

### Mobile Share Integration

```javascript
const handleShare = async () => {
  try {
    const watermarkedImage = await addWatermark(generatedImage)

    // Convert to blob
    const response = await fetch(watermarkedImage)
    const blob = await response.blob()
    const file = new File([blob], 'morpheo-photo.jpg', { type: 'image/jpeg' })

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Morpheo Photo',
        text: 'Generate your AI picture on https://morpheo-phi.vercel.app'
      })
    } else {
      // Fallback to download
      handleDownload()
    }

    // Cleanup blob URL
    URL.revokeObjectURL(watermarkedImage)

  } catch (error) {
    console.error('Share failed:', error)
  }
}
```

### Performance Considerations

1. **Device Pixel Ratio:** Accounts for high-DPI displays
2. **Font Size Capping:** Max 4096px for mobile stability
3. **Blob URL Cleanup:** Revoke URLs to prevent memory leaks
4. **Dynamic Sizing:** Scales with image dimensions

## 7.5 Filter System

### Adding a New Filter

**Step 1:** Add filter name to `src/constants/filters.js`

```javascript
export const FILTERS = [
  'Executive',
  'Lord',
  // ... existing filters
  'New Filter Name'  // Add new filter
]
```

**Step 2:** Add prompt to `src/constants/stylePrompts.js`

```javascript
export const STYLE_PROMPTS = {
  // ... existing prompts

  'New Filter Name': `
    Create a [detailed style description] portrait featuring the person...

    Visual Style:
    - [Specific details]
    - [Lighting and color]

    Clothing & Appearance:
    - [Detailed description]

    Critical Constraints:
    - Maintain EXACT facial features
    - Preserve natural hair
    - Keep realistic proportions

    Background & Mood:
    - [Background details]
    - [Atmospheric elements]
  `
}
```

**Step 3:** Test the filter

```bash
npm run dev
# Navigate to app and select new filter
```

**Step 4:** Update documentation (this file)

Add filter to Section 1.3 "Available Filters" and Section 10.1 "Adding a New Filter".
