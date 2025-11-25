# 4. Components & Modules

## 4.1 Main Entry Point

**File:** `src/app/page.js`

### Purpose
Main client-side React component managing the entire application lifecycle.

### Key Responsibilities
- Screen state management (5 states)
- Camera initialization and control
- Image capture and upload handling
- API communication
- Error handling

### State Management

```javascript
// Screen States
const SCREENS = {
  CAMERA: 'camera',
  LOADING: 'loading',
  RESULT: 'result',
  CAMERA_ERROR: 'camera_error',
  API_ERROR: 'api_error',
}

// State Variables
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
const [currentFilterIndex, setCurrentFilterIndex] = useState(0)
const [capturedImage, setCapturedImage] = useState(null)
const [generatedImage, setGeneratedImage] = useState(null)
const [errorMessage, setErrorMessage] = useState('')
const [isMobile, setIsMobile] = useState(false)
const [currentFacingMode, setCurrentFacingMode] = useState('user')

// Refs
const videoRef = useRef(null)
const canvasRef = useRef(null)
const fileInputRef = useRef(null)
const streamRef = useRef(null)
```

### Core Methods

#### `initializeCamera()`
Requests camera access and initializes video stream.

```javascript
const initializeCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode,
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
    console.error('Camera error:', error)
    setErrorMessage(error.message)
    setCurrentScreen(SCREENS.CAMERA_ERROR)
  }
}
```

#### `handleCapture()`
Captures current video frame to canvas and converts to base64.

```javascript
const handleCapture = async () => {
  const video = videoRef.current
  const canvas = canvasRef.current

  if (!video || !canvas) return

  const context = canvas.getContext('2d')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Mirror the image horizontally
  context.translate(canvas.width, 0)
  context.scale(-1, 1)
  context.drawImage(video, 0, 0)
  context.setTransform(1, 0, 0, 1, 0, 0)

  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95)

  if (imageDataUrl === 'data:,') {
    console.error('Captured image is empty')
    return
  }

  setCapturedImage(imageDataUrl)
  setCurrentScreen(SCREENS.LOADING)

  await generateImage(imageDataUrl)
}
```

#### `generateImage(imageDataUrl)`
Calls backend API to generate styled image.

```javascript
const generateImage = async (imageDataUrl) => {
  try {
    const response = await fetch('/api/generate-headshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        style: FILTERS[currentFilterIndex]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Generation failed')
    }

    setGeneratedImage(data.image)
    setCurrentScreen(SCREENS.RESULT)
  } catch (error) {
    console.error('Generation error:', error)
    setErrorMessage(error.message)
    setCurrentScreen(SCREENS.API_ERROR)
  }
}
```

#### `handleFilterChange(direction)`
Cycles through filters with wrap-around.

```javascript
const handleFilterChange = (direction) => {
  setCurrentFilterIndex((prevIndex) => {
    if (direction === 'next') {
      return (prevIndex + 1) % FILTERS.length
    } else {
      return (prevIndex - 1 + FILTERS.length) % FILTERS.length
    }
  })
}
```

## 4.2 Screen Components

### CameraScreen.jsx

**Purpose:** Main camera interface with live preview and controls.

**Key Features:**
- Live video feed display
- Filter selector with navigation
- Three action buttons: Upload, Capture, Switch Camera
- Info modal (desktop only)

**Props:**
```javascript
{
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  fileInputRef: RefObject<HTMLInputElement>,
  currentFilter: string,
  onCapture: () => void,
  onUpload: () => void,
  onFilterPrev: () => void,
  onFilterNext: () => void,
  onSwitchCamera: () => void,  // mobile only
  isMobile: boolean
}
```

**Layout Structure:**
```
┌─────────────────────────────┐
│   [i] Info (desktop only)   │
├─────────────────────────────┤
│                             │
│      Live Video Feed        │
│      (mirrored preview)     │
│                             │
├─────────────────────────────┤
│   Filter Badge Display      │
│   [<] [FILTER NAME] [>]     │
├─────────────────────────────┤
│  [Upload] [Capture] [Switch]│
└─────────────────────────────┘
```

### ResultScreen.jsx

**Purpose:** Display generated image with action buttons.

**Props:**
```javascript
{
  generatedImage: string,  // base64 data URL
  onNewPhoto: () => void,
  onShare: () => void,
  onDownload: () => void,
  isMobile: boolean
}
```

**Layout:**
```
┌─────────────────────────────┐
│                             │
│    Generated Image          │
│    (with watermark)         │
│                             │
├─────────────────────────────┤
│ [Share] [New Photo] [Download]│
└─────────────────────────────┘
```

### CameraAccessError.jsx

**Purpose:** Error screen for camera permission failures.

**Props:**
```javascript
{
  message: string,
  onRetry: () => void
}
```

**Features:**
- Clear error message display
- Retry button
- Instructions for granting camera access

### GenericError.jsx

**Purpose:** Error screen for API and generation failures.

**Props:**
```javascript
{
  message: string,
  onRetry: () => void,
  onBack: () => void
}
```

### PaywallModal.jsx

**Purpose:** Credit pack purchase interface with horizontal scrollable cards.

**Design (Updated Nov 21, 2025):**
- Horizontal scrollable pack selection with scroll-snap behavior
- 240px wide cards with ~80px peek effect (33% of adjacent cards visible)
- Three packs: Start (10 credits), Creator (30 credits), Pro (100 credits)
- "Most popular plan" badge on Creator pack
- Two-step selection: click card to select → click CTA button to checkout

**Props:**
```javascript
{
  onClose: () => void  // Close modal callback
}
```

**Layout:**
```
┌─────────────────────────────────┐
│     🎥 Camera Icon    [✕ Close] │
├─────────────────────────────────┤
│      Choose your pack           │
│  Your best picture might be...  │
│  Already 1 567 photos generated │
├─────────────────────────────────┤
│                                 │
│ [Start] 👉 [Creator] 👈 [Pro]  │ ← horizontal scroll
│  10img     30img      100img    │   with peek effect
│                                 │
├─────────────────────────────────┤
│ ✨ No subscription required     │
│ 🔓 Secure payment with Stripe  │
│ ⚡️ Instant delivery            │
├─────────────────────────────────┤
│   [Get Creator pack - $8.99]   │
└─────────────────────────────────┘
```

**Key Features:**
- **Peek effect**: Adjacent cards show ~80px (33%) to signal horizontal scrollability
- **Auto-centering**: Creator pack auto-scrolls to center on mount as default/recommended option
- **Optimistic UI**: Zero loading state - initializes with `DEFAULT_CREDIT_PACKAGES` constants
- **Background sync**: Silently fetches latest prices from database after initial render
- **Selection state**: Yellow (#fab617) border on selected card with circular checkbox
- **Responsive design**: Cards use `min-w-[240px]` with `gap-3` (12px) between them

**Technical Implementation:**
```javascript
// Horizontal scroll container structure
<div className="-mx-4">  {/* Bleeds to screen edges */}
  <div className="px-12 snap-x snap-mandatory">  {/* 48px padding creates peek zones */}
    <div className="snap-center">  {/* Each card snaps to center */}
      <button className="min-w-[240px]">  {/* 240px card width */}
```

**Peek Calculation:**
- Viewport: 425px (typical mobile)
- Card width: 240px
- Natural space: (425 - 240) / 2 = 92.5px per side
- Visible peek: 92.5px - 12px gap = **~80px of adjacent card** (33% visibility)

**Performance:**
- Zero loading state (instant UI with constants)
- Background database sync for price updates
- Smooth scroll-snap transitions
- Responsive card sizing across device widths

## 4.3 UI Components

### Button.jsx

**Skeumorphic text button** with double-border effect.

```javascript
// Usage Example
<Button onClick={handleClick}>
  New Photo
</Button>
```

**Styling:**
- Background: `#232323`
- Border: Double-layer (outer black, inner gradient)
- Text: IBM Plex Mono, 900 weight
- Hover: Subtle brightness increase

### IconButton.jsx

**Circular button wrapper** for icon components.

```javascript
// Usage Example
<IconButton onClick={handleCapture} size="main">
  <CaptureIcon />
</IconButton>
```

**Sizes:**
- `main`: 88px (capture button)
- `secondary`: 64px (upload, switch camera)
- `nav`: 48px (filter arrows)

**Critical Pattern:**
- Button resets: `bg-transparent border-0 outline-none p-0 m-0`
- Icons own their visual design (circles, borders)
- IconButton only handles sizing and interaction

### FilterSelector.jsx

**Filter navigation** with left/right arrows and current filter display.

```javascript
<FilterSelector
  currentFilter="Executive"
  onPrev={handlePrev}
  onNext={handleNext}
/>
```

### FilterDisplay.jsx

**SVG filter badge** showing current filter name.

```javascript
<FilterDisplay filterName="Executive" />
```

**Styling:**
- Yellow badge (`#FAB617`)
- DM Mono font
- Centered text in rounded rectangle

### InfoModal.jsx

**Creator information modal** (desktop only).

**Features:**
- Overlay background with backdrop blur
- Close button (X icon)
- Creator name and link
- Click outside to close

## 4.4 Icon Components

All icon components follow the **complete visual design pattern**:
- Icons include their own circles, borders, and gradients
- No external styling wrappers
- Self-contained SVG with all visual elements

**Available Icons:**
- `CaptureIcon.jsx` - Main capture button (large circle with camera symbol)
- `UploadIcon.jsx` - File upload button
- `SwitchCameraIcon.jsx` - Camera flip button
- `ShareIcon.jsx` - Share functionality
- `DownloadIcon.jsx` - Download button
- `ArrowLeftIcon.jsx` - Filter navigation left
- `ArrowRightIcon.jsx` - Filter navigation right
- `LoadingIcon.jsx` - Animated spinner
- `InfoIcon.jsx` - Information button
- `RetryIcon.jsx` - Retry action
- `CloseIcon.jsx` - Modal close

**Example: CaptureIcon Structure**
```javascript
export default function CaptureIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      {/* Outer circle with border */}
      <circle cx="44" cy="44" r="43" fill="#232323" stroke="#000" strokeWidth="2"/>
      {/* Inner gradient border */}
      <circle cx="44" cy="44" r="41" fill="none" stroke="url(#grad)" strokeWidth="1"/>
      {/* Camera symbol */}
      <circle cx="44" cy="44" r="28" fill="#FAB617"/>
      {/* Gradient definition */}
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#666" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>
    </svg>
  )
}
```

## 4.5 Constants & Configuration

### filters.js

Array of filter names (13 total).

```javascript
export const FILTERS = [
  'Executive',
  'Lord',
  'Wes Anderson',
  'Urban',
  'Runway',
  'Marseille',
  'Halloween',
  'Kill Bill',
  'Chucky',
  'Zombie',
  'Matrix',
  'Star Wars',
  'Harry Potter'
]
```

### stylePrompts.js

Detailed AI prompts mapped to each filter.

```javascript
export const STYLE_PROMPTS = {
  'Executive': 'Create a dramatic black and white portrait...',
  'Lord': 'Transform into a Renaissance royal portrait...',
  // ... etc
}
```

**Prompt Structure Guidelines:**
- 500-2000 characters per prompt
- Emphasize preserving facial identity
- Specify exact visual style elements
- Include lighting, clothing, background details
- Constrain to realistic human proportions

**Example: Executive Prompt**
```javascript
'Executive': `Create a dramatic black and white editorial portrait in the style of high-end fashion photography. The image should feature the person in sharp, professional business attire - a perfectly tailored dark suit with crisp white shirt. Use dramatic side lighting to create strong shadows and highlights across the face, emphasizing bone structure and creating depth. The background should be a gradient of dark to light gray, keeping focus on the subject. Maintain the exact facial features, skin texture, and natural hair of the person - this is critical. The pose should convey confidence and power, with subtle engagement toward the camera. Post-processing should include high contrast, slightly crushed blacks, and a timeless, sophisticated aesthetic reminiscent of iconic Vanity Fair or GQ editorial spreads.`
```

## 4.6 Utilities

### designTokens.js

Centralized design system values.

```javascript
export const designTokens = {
  colors: {
    primary: '#FAB617',
    background: '#242424',
    cameraBackground: '#1C1C1E',
    buttonBackground: '#232323',
    borderPrimary: '#666666',
    borderOuter: '#000000',
    textPrimary: '#FFFFFF',
    textAccent: '#FAB617',
    error: '#FF0000',
  },

  shadows: {
    skeumorphic: {
      light: '0 2px 4px rgba(255, 255, 255, 0.1)',
      dark: '0 4px 8px rgba(0, 0, 0, 0.5)',
    },
  },

  borderRadius: {
    button: '16px',
    camera: '32px',
    controls: '16px',
  },

  spacing: {
    screenPadding: '32px',
    buttonSpacing: '73px',
    filterGap: '24px',
  },

  typography: {
    fontFamily: {
      primary: 'IBM Plex Mono',
      secondary: 'DM Mono',
    },
    fontSize: {
      heading: '24px',
      body: '16px',
    },
    fontWeight: {
      bold: 900,
      regular: 400,
    },
  },

  sizes: {
    button: {
      main: '88px',
      secondary: '64px',
      nav: '48px',
    },
    filter: {
      width: '226px',
    },
    error: {
      messageWidth: '327px',
    },
  },

  breakpoints: {
    mobile: '0px',
    desktop: '768px',
  },
}
```

### watermark.js

Utility for adding watermark to images.

```javascript
export const addWatermark = (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size with device pixel ratio
      const dpr = window.devicePixelRatio || 1
      canvas.width = img.width * dpr
      canvas.height = img.height * dpr

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Watermark configuration
      const text = 'created with Morpheo - morpheo-phi.vercel.app/'
      const baseFontSize = Math.max(canvas.width, canvas.height) / 60
      const fontSize = Math.min(baseFontSize, 4096) // Cap at 4096 for mobile

      ctx.font = `900 ${fontSize}px "IBM Plex Mono", monospace`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'

      // Position: bottom-right with padding
      const padding = fontSize * 0.5
      ctx.fillText(text, canvas.width - padding, canvas.height - padding)

      // Convert to data URL
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.95)
      resolve(watermarkedDataUrl)
    }

    img.onerror = reject
    img.src = imageDataUrl
  })
}
```

**Usage:**
```javascript
import { addWatermark } from '@/lib/watermark'

const handleShare = async () => {
  const watermarkedImage = await addWatermark(generatedImage)
  // Share watermarked image
}
```
