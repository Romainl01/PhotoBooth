# MORPHEO - Product & Technical Documentation

**Version:** 2.0.0 - Production Payment System
**Last Updated:** November 19, 2025
**Live URL:** https://morpheo-phi.vercel.app/

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Getting Started](#3-getting-started)
4. [Components & Modules](#4-components--modules)
5. [API Reference](#5-api-reference)
6. [Design System](#6-design-system)
7. [Advanced Features](#7-advanced-features)
8. [Best Practices](#8-best-practices)
9. [Deployment & Production](#9-deployment--production)
10. [Maintenance & Evolution](#10-maintenance--evolution)
11. [Appendices](#11-appendices)

---

## 1. Product Overview

### 1.1 Vision & Value Proposition

**Morpheo** is an AI-powered creative photo transformation web application that instantly transforms user photos into themed visual styles using Google's Gemini AI. The application enables users to reimagine themselves in cinematic, artistic, and cultural contexts through a seamless mobile-first interface.

**Core Value:**
- **Instant Transformation**: Generate styled photos in seconds, not minutes
- **Authentic Results**: Preserves facial identity while applying creative styles
- **Mobile-First**: Optimized for smartphone cameras and touch interfaces
- **Zero Friction**: No account required, instant access via browser

### 1.2 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Live Camera Capture** | Real-time video feed with instant capture | ✅ Live |
| **Photo Upload** | Support for existing photos from device gallery | ✅ Live |
| **13 Themed Filters** | Curated styles from cinematic to cultural themes | ✅ Live |
| **AI Generation** | Google Gemini 2.5 Flash image transformation | ✅ Live |
| **Camera Switching** | Toggle between front/rear cameras (mobile) | ✅ Live |
| **Watermark Protection** | Automatic branding on shared images | ✅ Live |
| **Web Share API** | Native mobile sharing to social platforms | ✅ Live |
| **Dynamic Loading Messages** | Context-aware messages during AI generation | ✅ Live |
| **Error Recovery** | Graceful error handling with retry options | ✅ Live |

### 1.3 Available Filters

#### Creative & Cinematic
1. **Executive** - Dramatic black & white editorial photography
2. **Wes Anderson** - 1960s-70s symmetrical cinematic aesthetic
3. **Kill Bill** - Beatrix Kiddo warrior-inspired style
4. **Matrix** - Cyberpunk leather aesthetic with digital atmosphere

#### Fantasy & Pop Culture
5. **Star Wars** - Jedi/Sith robes in galaxy far, far away
6. **Harry Potter** - Hogwarts student wizard aesthetic
7. **Lord** - Renaissance royal portrait style

#### Horror & Halloween
8. **Halloween** - Human-like costume character transformation
9. **Chucky** - Horror doll costume aesthetic
10. **Zombie** - The Walking Dead practical makeup effects

#### Fashion & Urban
11. **Runway** - High-fashion editorial photography
12. **Urban** - Blue-hour street photography aesthetic
13. **Marseille** - Olympique de Marseille scooter culture

### 1.4 Use Cases

- **Social Media Content**: Generate unique profile pictures and posts
- **Creative Exploration**: Experiment with visual identity transformations
- **Event Entertainment**: Interactive photo booth at parties/events
- **Personal Branding**: Create themed professional headshots
- **Marketing Assets**: Generate styled content for campaigns

### 1.5 Product Roadmap

#### Phase 1: Core Experience ✅ (Current)
- Camera capture and upload
- 13 curated filters
- AI generation via Gemini
- Basic sharing and download

#### Phase 2: Morpheo 2.0 - Authentication & User Accounts 🔄 (In Progress)
- ✅ Sign-in screen UI with skeuomorphic TV design
- 🔄 Google OAuth integration (setup guide complete)
- 📋 User session management with Supabase
- 📋 User profile and image history
- 📋 Real-time usage statistics
- 📋 Additional 10+ filters
- 📋 Batch processing for multiple photos
- 📋 Advanced editing controls (brightness, contrast)

#### Phase 3: Social & Teams 📋 (Future)
- Social media optimization presets
- Team/organization accounts
- Analytics and usage tracking
- Custom filter creation

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
```json
{
  "framework": "Next.js 15.5.5",
  "runtime": "React 19.1.0",
  "styling": "Tailwind CSS 3.4.18",
  "fonts": "Next.js Font Optimization (Geist, IBM Plex Mono, DM Mono)",
  "state": "React Hooks (useState, useRef, useEffect)",
  "canvas": "HTML5 Canvas API",
  "camera": "MediaDevices Web API (getUserMedia)"
}
```

#### Backend
```json
{
  "framework": "Next.js API Routes",
  "runtime": "Node.js",
  "ai": "@google/genai 1.25.0",
  "model": "gemini-2.5-flash-image",
  "environment": "dotenv 17.2.3"
}
```

#### Development & Build
```json
{
  "bundler": "Next.js with Turbopack",
  "deployment": "Vercel",
  "analytics": "@vercel/analytics 1.5.0",
  "version_control": "Git"
}
```

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DEVICE                          │
│  ┌─────────────┐          ┌─────────────┐                  │
│  │   Camera    │          │ File Upload │                  │
│  └──────┬──────┘          └──────┬──────┘                  │
│         │                        │                          │
│         └────────────┬───────────┘                          │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Component (page.js)                           │  │
│  │  - State Management (5 screen states)                │  │
│  │  - Camera Initialization                             │  │
│  │  - Image Capture (Canvas)                            │  │
│  │  - Base64 Encoding                                   │  │
│  └───────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │
                             │ POST /api/generate-headshot
                             │ { image: base64, style: name }
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS BACKEND                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Route (generate-headshot/route.js)              │  │
│  │  - Request Validation                                │  │
│  │  - Style Prompt Lookup                               │  │
│  │  - Base64 Processing                                 │  │
│  └───────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │
                             │ API Call with Image + Prompt
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI API                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Model: gemini-2.5-flash-image                       │  │
│  │  - Content Understanding                             │  │
│  │  - Style Application                                 │  │
│  │  - Image Generation                                  │  │
│  └───────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │
                             │ Generated Image (Base64)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Result Processing                                    │  │
│  │  - Display Generated Image                           │  │
│  │  - Apply Watermark (Canvas)                          │  │
│  │  - Download/Share Options                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Data Flow

#### Capture Flow
```
Video Stream → Canvas Capture → Horizontal Flip → JPEG Compression
   → Base64 Encoding → State Storage → API Request
```

#### Generation Flow
```
API Request → Validation → Style Prompt Lookup → Gemini API Call
   → Image Generation → Base64 Response → State Update → Display
```

#### Share/Download Flow
```
Generated Image → Canvas Watermarking → Blob Creation
   → [Mobile: Web Share API | Desktop: Download Link]
   → Blob URL Revocation (memory cleanup)
```

### 2.4 Project Structure

```
/home/user/PhotoBooth/
├── nextjs-app/                              # Main Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js                      # Main entry (client component)
│   │   │   ├── layout.js                    # Root layout with fonts
│   │   │   ├── globals.css                  # Global Tailwind styles
│   │   │   └── api/
│   │   │       ├── health/route.js          # Health check endpoint
│   │   │       └── generate-headshot/route.js  # AI generation API
│   │   │
│   │   ├── components/
│   │   │   ├── screens/
│   │   │   │   ├── CameraScreen.jsx         # Camera UI + filters
│   │   │   │   ├── ResultScreen.jsx         # Generated image display
│   │   │   │   ├── CameraAccessError.jsx    # Camera permission error
│   │   │   │   └── GenericError.jsx         # API error screen
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx               # Skeumorphic text button
│   │   │   │   ├── IconButton.jsx           # Circular icon buttons
│   │   │   │   ├── FilterSelector.jsx       # Filter navigation
│   │   │   │   ├── FilterDisplay.jsx        # SVG filter badge
│   │   │   │   ├── InfoModal.jsx            # Creator info modal
│   │   │   │   ├── ErrorLayout.jsx          # Error screen template
│   │   │   │   ├── Loader.jsx               # Loading spinner overlay
│   │   │   │   └── RetryButton.jsx          # Error retry button
│   │   │   │
│   │   │   └── icons/
│   │   │       ├── CaptureIcon.jsx          # Main capture button
│   │   │       ├── UploadIcon.jsx           # File upload button
│   │   │       ├── SwitchCameraIcon.jsx     # Camera flip button
│   │   │       ├── ShareIcon.jsx            # Share button
│   │   │       ├── DownloadIcon.jsx         # Download button
│   │   │       ├── ArrowLeftIcon.jsx        # Filter nav left
│   │   │       ├── ArrowRightIcon.jsx       # Filter nav right
│   │   │       ├── LoadingIcon.jsx          # Spinner animation
│   │   │       ├── InfoIcon.jsx             # Info button
│   │   │       ├── RetryIcon.jsx            # Retry icon
│   │   │       └── CloseIcon.jsx            # Modal close
│   │   │
│   │   ├── constants/
│   │   │   ├── filters.js                   # Filter names array (13)
│   │   │   └── stylePrompts.js              # AI prompts per filter
│   │   │
│   │   └── lib/
│   │       ├── designTokens.js              # Design system tokens
│   │       └── watermark.js                 # Watermark utility
│   │
│   ├── public/                              # Static assets
│   ├── tailwind.config.js                   # Tailwind customization
│   ├── next.config.mjs                      # Next.js configuration
│   ├── jsconfig.json                        # Path aliases (@/*)
│   ├── package.json                         # Dependencies
│   └── .env.local                           # Environment variables
│
└── Documentation/
    ├── MORPHEO_DOCUMENTATION.md             # This file
    ├── PROJECT_SPEC.md                      # Original specification
    ├── PROJECT_LEARNINGS.md                 # Best practices
    ├── NEXTJS_MIGRATION_PLAN.md             # Migration docs
    ├── CAMERA_PERMISSION_PLAN.md            # Camera modal plan
    ├── WATERMARK_REFERENCE.md               # Watermark details
    ├── RATE_LIMIT_REFERENCE.md              # Rate limiting reference
    └── UI_IMPLEMENTATION_BRIEF.md           # UI guidelines
```

### 2.5 Key Architectural Decisions

#### 1. Next.js Full-Stack Architecture
**Decision:** Migrate from Vite/Express to Next.js 15
**Rationale:**
- Unified frontend/backend in single codebase
- Built-in API routes eliminate separate backend server
- Vercel deployment optimization
- Better SEO and performance with React Server Components

#### 2. Client-Side Image Processing
**Decision:** Use Canvas API for capture and watermarking
**Rationale:**
- No server overhead for image manipulation
- Instant feedback for users
- Reduced bandwidth usage
- Better privacy (images not stored on server)

#### 3. Google Gemini 2.5 Flash
**Decision:** Use latest Gemini Flash model instead of heavier models
**Rationale:**
- Fast generation times (< 10 seconds)
- Lower API costs
- Sufficient quality for social media use
- Better user experience with minimal wait

#### 4. Mobile-First Design
**Decision:** Optimize primarily for mobile devices
**Rationale:**
- 80%+ users access via smartphone
- Camera is primary input method
- Touch-optimized UI critical for UX
- Desktop as secondary experience

#### 5. Stateless Sessions
**Decision:** No user accounts or server-side storage
**Rationale:**
- Zero friction signup flow
- Privacy-focused (no data retention)
- Simplified infrastructure
- Faster time-to-value for users

---

## 3. Getting Started

### 3.1 Prerequisites

#### Required
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **Google Cloud Account**: For Gemini API access

#### Recommended
- **VS Code**: With ESLint and Prettier extensions
- **Modern Browser**: Chrome, Firefox, or Safari
- **HTTPS Development**: Use ngrok or similar for mobile testing

### 3.2 Installation

#### 1. Clone Repository
```bash
cd /home/user/PhotoBooth
git status  # Verify you're in the correct directory
```

#### 2. Navigate to Next.js App
```bash
cd nextjs-app
```

#### 3. Install Dependencies
```bash
npm install
```

Expected output:
```
added 324 packages, and audited 325 packages in 15s
```

#### 4. Verify Installation
```bash
npm list --depth=0
```

Should show:
```
nextjs-app@0.1.0
├── @google/genai@1.25.0
├── @vercel/analytics@1.5.0
├── dotenv@17.2.3
├── next@15.5.5
├── react@19.1.0
└── react-dom@19.1.0
```

### 3.3 Configuration

#### 1. Create Environment File
```bash
cp .env.example .env.local
```

#### 2. Obtain Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

#### 3. Configure Environment Variables

Edit `.env.local`:
```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional (for future features)
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

⚠️ **Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3.4 Development Launch

#### Start Development Server
```bash
npm run dev
```

Expected output:
```
   ▲ Next.js 15.5.5
   - Local:        http://localhost:3000
   - Experiments:  turbopack

 ✓ Ready in 2.3s
```

#### Access Application
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

#### Verify Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

### 3.5 Mobile Testing (Optional)

#### Using ngrok for HTTPS
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000
```

Access via provided HTTPS URL on mobile device.

⚠️ **Note:** Camera access requires HTTPS in production (localhost HTTP is allowed in dev).

### 3.6 Production Build

#### Build Application
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

#### Test Production Build
```bash
curl http://localhost:3000/api/health
```

---

## 4. Components & Modules

### 4.1 Main Entry Point

**File:** `src/app/page.js`

#### Purpose
Main client-side React component managing the entire application lifecycle.

#### Key Responsibilities
- Screen state management (5 states)
- Camera initialization and control
- Image capture and upload handling
- API communication
- Error handling

#### State Management

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

#### Core Methods

##### `initializeCamera()`
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

##### `handleCapture()`
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

##### `generateImage(imageDataUrl)`
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

##### `handleFilterChange(direction)`
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

### 4.2 Screen Components

#### CameraScreen.jsx

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

#### ResultScreen.jsx

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

#### CameraAccessError.jsx

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

#### GenericError.jsx

**Purpose:** Error screen for API and generation failures.

**Props:**
```javascript
{
  message: string,
  onRetry: () => void,
  onBack: () => void
}
```

#### PaywallModal.jsx

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
│   [Get Creator pack - 6.99€]   │
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

### 4.3 UI Components

#### Button.jsx

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

#### IconButton.jsx

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

#### FilterSelector.jsx

**Filter navigation** with left/right arrows and current filter display.

```javascript
<FilterSelector
  currentFilter="Executive"
  onPrev={handlePrev}
  onNext={handleNext}
/>
```

#### FilterDisplay.jsx

**SVG filter badge** showing current filter name.

```javascript
<FilterDisplay filterName="Executive" />
```

**Styling:**
- Yellow badge (`#FAB617`)
- DM Mono font
- Centered text in rounded rectangle

#### InfoModal.jsx

**Creator information modal** (desktop only).

**Features:**
- Overlay background with backdrop blur
- Close button (X icon)
- Creator name and link
- Click outside to close

### 4.4 Icon Components

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

### 4.5 Constants & Configuration

#### filters.js

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

#### stylePrompts.js

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

### 4.6 Utilities

#### designTokens.js

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

#### watermark.js

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

---

## 5. API Reference

### 5.1 Endpoint: Generate Headshot

**POST** `/api/generate-headshot`

Generates an AI-styled image based on uploaded photo and selected filter.

#### Request

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

#### Response

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

#### Example Usage

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

#### Implementation Details

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

### 5.2 Endpoint: Health Check

**GET** `/api/health`

Health check endpoint for monitoring API status.

#### Request

No parameters required.

#### Response

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

#### Example Usage

```bash
curl http://localhost:3000/api/health
```

```javascript
const response = await fetch('/api/health')
const data = await response.json()
console.log('API Status:', data.status)
console.log('API Key:', data.apiKeyConfigured)
```

### 5.3 Error Codes

| HTTP Code | Meaning | Typical Cause |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing or invalid parameters |
| 500 | Internal Server Error | Gemini API failure, server error |

### 5.4 Rate Limiting

**Current Status:** Not implemented (planned feature)

**Reference:** See `RATE_LIMIT_REFERENCE.md` for Upstash Redis implementation guide.

**Planned Limits:**
- 10 requests per minute per IP
- 100 requests per day per IP

---

## 6. Design System

### 6.1 Design Tokens

All design values are centralized in `src/lib/designTokens.js` and mirrored in `tailwind.config.js`.

#### Color Palette

```javascript
// Primary Brand
primary: '#FAB617'          // Yellow/Gold - Active filters, accents

// Backgrounds
background: '#242424'       // Main app background
cameraBackground: '#1C1C1E' // Camera view (slightly darker)
buttonBackground: '#232323' // Button backgrounds

// Borders
borderPrimary: '#666666'    // Subtle element borders
borderOuter: '#000000'      // Outer skeumorphic borders

// Text
textPrimary: '#FFFFFF'      // Primary white text
textAccent: '#FAB617'       // Yellow accent text

// Semantic
error: '#FF0000'            // Error states and messages
```

#### Typography

**Font Families:**
```javascript
primary: 'IBM Plex Mono'    // Main UI text (buttons, labels)
secondary: 'DM Mono'        // Filter badges
body: 'Geist'               // Body text (minimal usage)
```

**Font Sizes:**
```javascript
heading: '24px'             // Screen titles
body: '16px'                // Button text, labels
badge: '14px'               // Filter badges
```

**Font Weights:**
```javascript
bold: 900                   // Buttons, headings
regular: 400                // Body text
```

#### Spacing

```javascript
screenPadding: '32px'       // Screen edge padding
buttonSpacing: '73px'       // Horizontal gap between buttons
filterGap: '24px'           // Gap between filter elements
```

#### Sizing

```javascript
// Buttons
button.main: '88px'         // Capture button
button.secondary: '64px'    // Upload, switch camera
button.nav: '48px'          // Filter navigation arrows

// Components
filter.width: '226px'       // Filter badge width
error.messageWidth: '327px' // Error message max width
```

#### Border Radius

```javascript
button: '16px'              // Standard button corners
camera: '32px'              // Camera view corners (mobile)
controls: '16px'            // Control container corners
```

#### Shadows

```javascript
skeumorphic: {
  light: '0 2px 4px rgba(255, 255, 255, 0.1)',
  dark: '0 4px 8px rgba(0, 0, 0, 0.5)'
}
```

### 6.2 Skeumorphic Design Pattern

The application uses a **double-border skeumorphic design** to create depth and tactile feel.

#### Visual Structure

```
┌─────────────────────────────┐
│  Outer Black Border (#000)  │
│  ┌───────────────────────┐  │
│  │ Inner Gradient Border │  │
│  │  ┌─────────────────┐  │  │
│  │  │  Button Content │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

#### Implementation Example

```jsx
<div className="relative">
  {/* Outer border */}
  <div className="absolute inset-0 rounded-2xl bg-black" />

  {/* Inner gradient border */}
  <div className="relative rounded-2xl bg-gradient-to-br from-border-primary to-background">
    {/* Content */}
    <button className="w-full h-full bg-button-bg rounded-2xl">
      Button Text
    </button>
  </div>
</div>
```

#### Key Principles

1. **Icons Own Their Design**
   - Icons include complete visual elements (circles, borders, gradients)
   - No external wrapper styling needed
   - Self-contained SVG structure

2. **Button Reset Styles**
   - Always include: `bg-transparent border-0 outline-none p-0 m-0`
   - Prevents browser default styles
   - Critical for mobile Safari compatibility

3. **Consistent Structure**
   - Similar components use identical patterns
   - No unnecessary wrapper divs
   - Reuse established patterns, don't reinvent

### 6.3 Component Guidelines

#### Buttons

**Standard Button Pattern:**
```jsx
<button
  className="bg-transparent border-0 outline-none p-0 m-0 cursor-pointer"
  onClick={handleClick}
>
  {/* Button content */}
</button>
```

**Text Button Pattern (with skeumorphic effect):**
```jsx
<Button onClick={handleClick}>
  Button Text
</Button>
```

**Icon Button Pattern:**
```jsx
<IconButton onClick={handleClick} size="main">
  <CaptureIcon />
</IconButton>
```

#### Icons

**Self-Contained Icon Structure:**
```jsx
export default function CustomIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      {/* Outer circle with border */}
      <circle cx="44" cy="44" r="43" fill="#232323" stroke="#000" strokeWidth="2"/>

      {/* Inner gradient border */}
      <circle cx="44" cy="44" r="41" fill="none" stroke="url(#grad)" strokeWidth="1"/>

      {/* Icon content */}
      <path d="..." fill="#FAB617"/>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="grad">
          <stop offset="0%" stopColor="#666" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>
    </svg>
  )
}
```

**Usage:**
```jsx
// Correct: Icon used with IconButton wrapper
<IconButton onClick={handleClick} size="main">
  <CustomIcon />
</IconButton>

// Incorrect: Don't add extra styling wrappers
<div className="rounded-full border-2"> {/* ❌ */}
  <CustomIcon />
</div>
```

### 6.4 Responsive Design

#### Mobile-First Approach

All layouts are designed mobile-first with desktop enhancements.

**Breakpoints:**
```javascript
mobile: '0px'     // Default (320px+)
desktop: '768px'  // md: prefix
```

#### Layout Patterns

**Center Alignment (ALL Breakpoints):**
```jsx
// Correct: Apply to all breakpoints
<div className="flex items-center justify-center">
  {/* Content */}
</div>

// Incorrect: Desktop-only centering
<div className="md:flex md:items-center md:justify-center"> {/* ❌ */}
  {/* Content */}
</div>
```

**Responsive Component Visibility:**
```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  <InfoModal />
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  <SwitchCameraIcon />
</div>
```

**Responsive Spacing:**
```jsx
<div className="px-4 md:px-8 py-6 md:py-12">
  {/* Content with responsive padding */}
</div>
```

### 6.5 Accessibility

#### Focus States

All interactive elements include focus styles:
```css
focus:outline-none focus:ring-2 focus:ring-primary
```

#### Touch Targets

Minimum touch target size: 44x44px (following iOS guidelines)

#### Semantic HTML

- Use semantic elements (`<button>`, `<nav>`, etc.)
- Provide `aria-label` for icon buttons
- Use `alt` text for images

#### Example:
```jsx
<button
  aria-label="Capture photo"
  className="..."
  onClick={handleCapture}
>
  <CaptureIcon />
</button>
```

---

## 7. Advanced Features

### 7.1 Camera Management

#### Initialization

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

#### Camera Switching (Mobile)

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

#### Cleanup

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

#### Error Handling

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

### 7.2 Image Capture & Processing

#### Canvas Capture

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

#### File Upload Processing

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

#### Image Validation

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

### 7.3 AI Image Generation

#### Gemini API Integration

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

#### Prompt Engineering

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

### 7.4 Watermarking System

#### Implementation

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

#### Usage in Components

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

#### Mobile Share Integration

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

#### Performance Considerations

1. **Device Pixel Ratio:** Accounts for high-DPI displays
2. **Font Size Capping:** Max 4096px for mobile stability
3. **Blob URL Cleanup:** Revoke URLs to prevent memory leaks
4. **Dynamic Sizing:** Scales with image dimensions

### 7.5 Filter System

#### Adding a New Filter

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

---

## 8. Best Practices

### 8.1 Critical Development Patterns

These patterns are **essential** for maintaining code quality and consistency. Deviation from these patterns has historically caused bugs and rework.

#### Pattern 1: Icon Component Structure

**Rule:** Icons own their complete visual design. Wrapper components only handle sizing and interaction.

**Correct:**
```jsx
// Icon component includes all visual elements
export default function CaptureIcon() {
  return (
    <svg width="88" height="88">
      <circle cx="44" cy="44" r="43" fill="#232323" stroke="#000"/>
      <circle cx="44" cy="44" r="41" fill="none" stroke="url(#grad)"/>
      {/* Icon content */}
    </svg>
  )
}

// Wrapper only handles interaction
<IconButton onClick={handleClick} size="main">
  <CaptureIcon />
</IconButton>
```

**Incorrect:**
```jsx
// ❌ Don't add visual styling in wrapper
<div className="rounded-full border-2 shadow-lg">
  <CaptureIcon />
</div>
```

**Why:** Prevents double-ring effects, maintains consistency, simplifies debugging.

#### Pattern 2: Button Reset Styles

**Rule:** All button elements must include comprehensive reset styles.

**Required Styles:**
```jsx
<button className="bg-transparent border-0 outline-none p-0 m-0">
  {/* Button content */}
</button>
```

**Why:**
- Prevents browser default styling
- Essential for mobile Safari compatibility
- Eliminates blue focus rings and tap highlights
- Ensures consistent cross-browser appearance

#### Pattern 3: Responsive Design Application

**Rule:** Apply flexbox centering to ALL breakpoints, not just desktop.

**Correct:**
```jsx
<div className="flex items-center justify-center">
  {/* Content centered on all devices */}
</div>
```

**Incorrect:**
```jsx
// ❌ Don't use desktop-only centering
<div className="md:flex md:items-center md:justify-center">
  {/* Content not centered on mobile */}
</div>
```

**Why:** Mobile is primary platform; desktop is enhancement.

#### Pattern 4: Component Consistency

**Rule:** Replicate established patterns. Don't invent new structures for similar components.

**Approach:**
1. Identify existing similar component
2. Copy structure and styling approach
3. Modify content, not architecture
4. Verify against design tokens

**Example:**
```jsx
// If UploadIcon exists, model SwitchCameraIcon after it
// Both are secondary action buttons with similar structure
```

#### Pattern 5: React Dependency Management

**Rule:** Pure utility functions should be defined at module level, not inside components.

**Correct:**
```jsx
// Module-level pure function (stable reference)
const retryWithBackoff = async (fn, maxRetries = 3) => {
  // Implementation that only uses parameters
}

export function MyComponent() {
  const [data, setData] = useState(null)

  const fetchData = useCallback(async (id) => {
    const result = await retryWithBackoff(async () => {
      // Fetch logic using setData
    })
  }, []) // retryWithBackoff not in deps (stable module reference)

  useEffect(() => {
    fetchData(userId)
  }, [fetchData, userId])
}
```

**Incorrect:**
```jsx
// ❌ Function defined inside component (recreated every render)
export function MyComponent() {
  const [data, setData] = useState(null)

  const retryWithBackoff = async (fn, maxRetries = 3) => {
    // Same implementation
  }

  const fetchData = useCallback(async (id) => {
    const result = await retryWithBackoff(async () => {
      // Fetch logic
    })
  }, [retryWithBackoff]) // Unstable dependency!

  useEffect(() => {
    fetchData(userId)
  }, [fetchData, userId]) // Effect runs every render → infinite loop
}
```

**Why:**
- Functions defined inside components get new references every render
- Including them in dependency arrays causes effects/callbacks to recreate
- This creates infinite loops: render → new function → effect runs → setState → render
- Pure functions (no component state/props) should live at module level
- **Real impact:** 10-20x database queries per page load → 1 query (95% reduction)

**Identification Checklist:**
- ✅ Function uses only its parameters → move to module level
- ✅ Function uses browser APIs only (setTimeout, console) → module level
- ❌ Function uses component state (setState) → keep in component with useCallback
- ❌ Function uses props → keep in component with useCallback

### 8.2 Common Pitfalls

#### Pitfall 1: Wrapper Div Proliferation

**Problem:** Adding unnecessary wrapper divs for styling.

**Solution:** Use existing structure or extend component properly.

```jsx
// ❌ Bad: Extra wrapper
<div className="flex justify-center">
  <div className="rounded-full">
    <IconButton>
      <Icon />
    </IconButton>
  </div>
</div>

// ✅ Good: Minimal structure
<IconButton>
  <Icon />
</IconButton>
```

#### Pitfall 2: Inline Styles

**Problem:** Using inline styles instead of design tokens.

**Solution:** Always use design tokens via Tailwind classes.

```jsx
// ❌ Bad: Inline styles
<button style={{ backgroundColor: '#232323', borderRadius: '16px' }}>
  Click
</button>

// ✅ Good: Design tokens
<button className="bg-button-bg rounded-2xl">
  Click
</button>
```

#### Pitfall 3: Inconsistent State Management

**Problem:** Managing similar state in different ways.

**Solution:** Use consistent patterns across components.

```jsx
// ✅ Good: Consistent useState pattern
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

// ❌ Bad: Mixing state management approaches
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
let filterIndex = 0  // Don't mix let with useState
```

#### Pitfall 4: Forgetting Mobile Testing

**Problem:** Testing only on desktop during development.

**Solution:** Test on mobile device regularly, especially for camera features.

**Testing Checklist:**
- [ ] Camera access on mobile
- [ ] Touch interactions
- [ ] Screen rotations
- [ ] Share functionality
- [ ] Upload from gallery

### 8.3 Pre-Development Checklist

Before implementing any new feature, verify:

#### Design Review
- [ ] Design tokens identified (colors, spacing, fonts)
- [ ] Existing similar components reviewed
- [ ] Responsive breakpoints planned
- [ ] Mobile-first approach confirmed

#### Component Planning
- [ ] Component hierarchy sketched
- [ ] State management planned
- [ ] Props interface defined
- [ ] Reusable patterns identified

#### Implementation Standards
- [ ] Button reset styles planned
- [ ] Icon visual ownership clarified
- [ ] Accessibility attributes identified
- [ ] Error handling approach defined

#### Testing Strategy
- [ ] Desktop testing plan
- [ ] Mobile testing plan
- [ ] Error scenarios identified
- [ ] Performance considerations noted

### 8.4 Code Review Standards

#### Reviewer Checklist

**Design System Compliance:**
- [ ] Uses design tokens (no magic numbers)
- [ ] Follows skeumorphic patterns
- [ ] Consistent with existing components
- [ ] Responsive design applied correctly

**Code Quality:**
- [ ] No unnecessary wrapper divs
- [ ] Button reset styles present
- [ ] Proper state management
- [ ] Error handling implemented

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Proper cleanup (useEffect returns)
- [ ] Canvas memory management
- [ ] Blob URL revocation

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels on icon buttons
- [ ] Focus states visible
- [ ] Touch targets ≥ 44px

### 8.5 Git Commit Standards

#### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(filters): add Halloween themed filter

docs(readme): update setup instructions

fix(camera): resolve mobile Safari permission issue

refactor(watermark): improve performance with canvas optimization
```

---

## 9. Deployment & Production

### 9.1 Production Build

#### Build Process

```bash
cd nextjs-app
npm run build
```

**Build Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         92.3 kB
├ ○ /api/generate-headshot
└ ○ /api/health

○  (Static)  prerendered as static content
```

#### Build Verification

```bash
# Start production server
npm start

# Test health endpoint
curl http://localhost:3000/api/health

# Test in browser
open http://localhost:3000
```

### 9.2 Vercel Deployment

Morpheo is optimized for **Vercel** deployment with zero configuration.

#### Initial Deployment

**Via GitHub:**
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Production Environment Variables

In Vercel dashboard, add:

```
GOOGLE_API_KEY=your_production_api_key
```

**Optional (for future features):**
```
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

#### Deployment Configuration

**File:** `vercel.json` (optional, uses defaults)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

#### Automatic Deployments

- **Production:** Push to `main` branch
- **Preview:** Push to feature branches
- **PR Previews:** Automatic preview URLs for pull requests

### 9.3 Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google GenAI API key | `AIzaSyD...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live) | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (live) | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` | Stripe price ID for Starter package | `price_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_CREATOR` | Stripe price ID for Creator package | `price_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | Stripe price ID for Pro package | `price_...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://morpheo-phi.vercel.app` |

#### Optional Variables

| Variable | Description | Usage |
|----------|-------------|-------|
| `KV_REST_API_URL` | Upstash Redis URL | Rate limiting |
| `KV_REST_API_TOKEN` | Upstash Redis token | Rate limiting |

#### Environment-Based Configuration

Morpheo uses environment variables to support different configurations for local development (test mode) and production (live mode):

- **Local Development:** Uses test Stripe keys and test price IDs from `.env.local`
- **Production/Preview:** Uses live Stripe keys and production price IDs from Vercel environment variables

**See:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete production deployment guide.

#### Security Best Practices

1. **Never Commit Secrets:** Keep `.env.local` in `.gitignore`
2. **Rotate Keys Regularly:** Update API keys every 90 days
3. **Use Vercel Secrets:** Store sensitive data in Vercel dashboard
4. **Restrict API Keys:** Limit Google API key to specific domains
5. **Separate Test/Live Keys:** Never use production Stripe keys in development
6. **Webhook Security:** Verify webhook signatures using `STRIPE_WEBHOOK_SECRET`

### 9.4 SEO & Social Sharing

Morpheo includes comprehensive Open Graph and Twitter Card metadata for optimal social sharing experiences.

#### Metadata Configuration

**File:** `nextjs-app/src/app/layout.js`

```javascript
export const metadata = {
  title: "Morpheo - AI Photobooth",
  description: "Transform your photos with AI-powered creative filters",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo.svg',
    shortcut: '/logo.svg',
  },
  openGraph: {
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    url: 'https://morpheo-phi.vercel.app',
    siteName: 'Morpheo',
    images: [
      {
        url: 'https://morpheo-phi.vercel.app/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Morpheo Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    images: ['https://morpheo-phi.vercel.app/logo.svg'],
  },
};
```

#### Social Sharing Features

**Platforms Optimized For:**
- **Notion:** Rich preview cards with logo
- **Slack:** Unfurled links with metadata
- **Discord:** Embedded previews
- **Facebook:** Open Graph integration
- **Twitter/X:** Large image cards
- **LinkedIn:** Professional link previews

**Meta Tags Generated:**
- `og:title` - Page title for social platforms
- `og:description` - Brief description of the app
- `og:image` - Preview image (1200x630px recommended)
- `og:url` - Canonical URL
- `twitter:card` - Twitter card type (large image)
- `twitter:image` - Twitter preview image

#### Best Practices

1. **Image Requirements:**
   - Recommended size: 1200x630px (1.91:1 ratio)
   - Format: PNG or JPG preferred over SVG for compatibility
   - Absolute URLs required for external platforms

2. **Testing Social Previews:**
   - [OpenGraph.xyz](https://www.opengraph.xyz/) - Test all platforms
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Cache Invalidation:**
   - Social platforms cache meta tags for 24-48 hours
   - Use validators with cache-busting after updates
   - Notion may require re-pasting the URL

### 9.5 Performance Monitoring

#### Vercel Analytics

Morpheo includes `@vercel/analytics` for performance tracking.

**Implementation:**
```javascript
// src/app/layout.js
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics Tracked:**
- Page load times
- API response times
- Core Web Vitals (LCP, FID, CLS)
- User interactions

#### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ✅ ~1.2s |
| Largest Contentful Paint | < 2.5s | ✅ ~2.0s |
| Time to Interactive | < 3.0s | ✅ ~2.5s |
| API Generation Time | < 10s | ✅ ~7s |

#### Optimization Strategies

1. **Next.js Image Optimization:** Auto-optimized images
2. **Font Optimization:** Next.js font loading
3. **Code Splitting:** Automatic via Next.js
4. **Canvas Optimization:** Device pixel ratio handling
5. **Lazy Loading:** Defer non-critical components

### 9.5 Error Tracking

#### Recommended: Sentry Integration

```bash
npm install @sentry/nextjs
```

**Configuration:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

**Error Boundaries:**
```jsx
import { ErrorBoundary } from '@sentry/nextjs'

<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### 9.6 Backup & Recovery

#### Database (Future)
Currently no database. When implemented:
- Daily automated backups
- Point-in-time recovery
- Backup retention: 30 days

#### Git Repository
- Protected main branch
- Required PR reviews
- Automated backups via GitHub

#### Vercel Deployments
- Automatic deployment history
- One-click rollback to previous version
- Deployment logs retained for 30 days

---

## 10. Maintenance & Evolution

### 10.1 Adding a New Filter

#### Step-by-Step Guide

**1. Define Filter Concept**

Document the filter concept:
- Name and theme
- Visual style references
- Target aesthetic
- Constraints and requirements

**2. Add to Filter List**

Edit `src/constants/filters.js`:

```javascript
export const FILTERS = [
  'Executive',
  'Lord',
  // ... existing filters
  'Cyberpunk'  // Add new filter name
]
```

**3. Create Style Prompt**

Edit `src/constants/stylePrompts.js`:

```javascript
export const STYLE_PROMPTS = {
  // ... existing prompts

  'Cyberpunk': `
    Create a cyberpunk-inspired portrait featuring the person in a neon-lit urban dystopia.

    Visual Style:
    - High-contrast lighting with vibrant neon colors (pink, blue, cyan)
    - Cinematic blade runner atmosphere with rain-slicked surfaces
    - Futuristic urban night setting with holographic advertisements
    - Shallow depth of field with bokeh neon lights in background

    Clothing & Appearance:
    - Techwear or cyberpunk street fashion (leather jacket, tactical vest)
    - Possible tech augmentations (subtle cybernetic details)
    - Neon accent lighting on clothing and face
    - Urban warrior aesthetic

    Critical Constraints:
    - Maintain EXACT facial features and identity of the person
    - Preserve natural hair color and style
    - Keep realistic human body proportions
    - Authentic cyberpunk aesthetic without over-stylization

    Background & Mood:
    - Dystopian megacity at night
    - Neon signs with Asian characters
    - Moody, atmospheric, cinematic
    - Rain or mist effects for depth
  `
}
```

**4. Test Filter**

```bash
npm run dev
```

- Navigate to camera screen
- Cycle to new filter
- Capture test image
- Verify generation quality
- Test on mobile device

**5. Iterate Prompt**

If results are unsatisfactory:
- Adjust prompt specificity
- Add/remove style constraints
- Test with multiple sample images
- Compare against reference images

**6. Document Filter**

Update this documentation:
- Add to Section 1.3 "Available Filters"
- Include style description
- Note any special considerations

**7. Commit Changes**

```bash
git add src/constants/filters.js src/constants/stylePrompts.js
git commit -m "feat(filters): add Cyberpunk themed filter"
git push
```

#### Prompt Engineering Tips

**Do's:**
- Be specific about lighting, colors, mood
- Reference known visual styles (e.g., "Blade Runner aesthetic")
- Emphasize facial identity preservation
- Specify clothing and background details
- Use cinematic/photographic terminology

**Don'ts:**
- Avoid vague descriptions ("make it cool")
- Don't over-specify small details
- Avoid conflicting style directions
- Don't request unrealistic body modifications
- Avoid copyrighted character names (unless transformative)

### 10.2 Modifying UI Components

#### Component Update Process

**1. Identify Component**

Locate component file:
```bash
find src/components -name "*.jsx" | grep ComponentName
```

**2. Review Design Tokens**

Check `src/lib/designTokens.js` for relevant tokens:
```javascript
// Use existing tokens when possible
const { colors, spacing, borderRadius } = designTokens
```

**3. Review Similar Components**

Find and review similar components for pattern consistency.

**4. Make Changes**

Follow established patterns:
- Use design tokens
- Apply button reset styles
- Maintain responsive design
- Preserve accessibility

**5. Test Across Breakpoints**

```bash
# Test on desktop
npm run dev

# Test on mobile (via ngrok or device)
ngrok http 3000
```

**6. Verify Accessibility**

- Tab navigation works
- Focus states visible
- ARIA labels present
- Touch targets ≥ 44px

**7. Update Documentation**

If component API changed, update Section 4 of this document.

### 10.3 Testing Strategy

#### Manual Testing Checklist

**Desktop Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Testing:**
- [ ] iOS Safari (iPhone)
- [ ] Chrome Mobile (Android)
- [ ] Camera access on both platforms
- [ ] Upload functionality
- [ ] Share functionality
- [ ] Screen rotations

**Feature Testing:**
- [ ] Camera initialization
- [ ] Image capture
- [ ] File upload
- [ ] Filter navigation
- [ ] AI generation (all filters)
- [ ] Error scenarios
- [ ] Download
- [ ] Share (mobile)
- [ ] Watermark application

#### Automated Testing

**Current Coverage (Jan 2026):**
- **Vitest integration suites** covering profile loading, credits deduction, Stripe webhooks, and API validation (`npm test`).
- **Playwright E2E:**
  1. `tests/e2e/critical/auth-logout.spec.js` – logout clears Supabase session + multi-tab propagation.
  2. `tests/e2e/critical/image-generation.spec.js` – upload/generate/download happy path, API failure + retry, and zero-credit paywall protection.

Run locally:
```bash
npx playwright test          # all E2E flows
npm run test:all             # Vitest + Playwright
```

#### Adding More Tests

**Recommended Setup:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Test Structure:**
```
src/
  components/
    __tests__/
      Button.test.jsx
      IconButton.test.jsx
      CameraScreen.test.jsx
```

**Example Test:**
```javascript
import { render, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <Button onClick={handleClick}>Click Me</Button>
    )

    fireEvent.click(getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 10.4 Troubleshooting

#### Common Issues

##### Issue: Camera Not Working

**Symptoms:**
- Camera permission denied
- Black screen in camera view
- "Camera access denied" error

**Solutions:**
1. Check browser permissions (Settings > Privacy > Camera)
2. Ensure HTTPS in production (HTTP localhost is OK in dev)
3. Verify no other app is using camera
4. Test in different browser
5. Check console for detailed error

**Debug:**
```javascript
// Add to initializeCamera()
console.log('Requesting camera access...')
console.log('Constraints:', constraints)
console.log('Stream:', stream)
```

##### Issue: Generation Fails

**Symptoms:**
- API error screen appears
- "Failed to generate headshot" message
- Long loading times

**Solutions:**
1. Verify `GOOGLE_API_KEY` is set correctly
2. Check API quota limits in Google Cloud Console
3. Verify network connectivity
4. Test with different filter/image combination
5. Check API health endpoint: `/api/health`

**Debug:**
```bash
# Check API key configuration
curl http://localhost:3000/api/health

# Expected: { "apiKeyConfigured": "Yes" }
```

##### Issue: Watermark Not Appearing

**Symptoms:**
- Downloaded/shared images lack watermark
- Watermark position incorrect

**Solutions:**
1. Verify `addWatermark()` is being called
2. Check font loading (IBM Plex Mono)
3. Test with different image sizes
4. Verify canvas context is available

**Debug:**
```javascript
// Add to watermark.js
console.log('Canvas dimensions:', canvas.width, canvas.height)
console.log('Font size:', fontSize)
console.log('Text position:', x, y)
```

##### Issue: Mobile Share Not Working

**Symptoms:**
- Share button doesn't respond
- Download instead of share on mobile

**Solutions:**
1. Verify Web Share API support: `navigator.share`
2. Check file type is shareable
3. Ensure HTTPS (Share API requires secure context)
4. Test on different mobile browser

**Debug:**
```javascript
// Add to handleShare()
console.log('Share API available:', !!navigator.share)
console.log('Can share files:', navigator.canShare({ files: [file] }))
```

#### Debug Mode

**Enable Verbose Logging:**

```javascript
// Add to src/app/page.js
const DEBUG = process.env.NODE_ENV === 'development'

const log = (...args) => {
  if (DEBUG) console.log('[Morpheo]', ...args)
}

// Use throughout code
log('Camera initialized')
log('Image captured:', capturedImage.substring(0, 50))
log('Generation started with filter:', currentFilter)
```

### 10.5 Performance Optimization

#### Optimization Checklist

**Images:**
- [ ] Compress captured images (quality: 0.95)
- [ ] Use appropriate canvas resolution
- [ ] Clean up blob URLs after use

**Components:**
- [ ] Minimize re-renders with React.memo
- [ ] Use useCallback for event handlers
- [ ] Lazy load non-critical components

**API:**
- [ ] Implement request caching (future)
- [ ] Add rate limiting (future)
- [ ] Optimize image payload size

**Bundle:**
- [ ] Remove unused dependencies
- [ ] Analyze bundle with `npm run build`
- [ ] Code split large components

#### Performance Monitoring

```bash
# Build and analyze
npm run build

# Check bundle size
du -sh .next/static
```

**Target Metrics:**
- Initial load: < 100kB
- Time to Interactive: < 3s
- Generation time: < 10s

#### PaywallModal Optimization (Optimistic UI Pattern)

**Problem:** Modal showed "Loading packages..." state (200-500ms delay) when opening.

**Solution:** Implemented single source of truth pattern with zero loading state.

**Implementation:**

1. **Constants File** (`/lib/creditPackages.js`):
```javascript
export const DEFAULT_CREDIT_PACKAGES = [
  {
    id: '1',
    name: 'Starter',
    emoji: '💫',
    credits: 10,
    price_cents: 299,
    currency: 'EUR',
    stripe_price_id: 'price_1SS4E8K9cHL77TyOtdNpKgCr',
  },
  // Creator and Pro packages...
]
```

2. **Component Update** (`PaywallModal.jsx`):
```javascript
// Initialize with constants for instant UI
const [packages, setPackages] = useState(DEFAULT_CREDIT_PACKAGES)

// Background sync (optional, silently updates from DB)
useEffect(() => {
  fetch('/api/credit-packages')
    .then(res => res.json())
    .then(data => setPackages(data.packages))
    .catch(err => console.error(err)) // No fallback needed - already initialized
}, [])
```

3. **API Route Update** (`/api/credit-packages/route.js`):
```javascript
import { DEFAULT_CREDIT_PACKAGES } from '@/lib/creditPackages'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')

    if (error) throw error
    return NextResponse.json({ packages: data })
  } catch (error) {
    // Return constants as fallback
    return NextResponse.json({ packages: DEFAULT_CREDIT_PACKAGES })
  }
}
```

**Results:**
- ✅ Zero loading state (instant UI rendering)
- ✅ Single source of truth for pricing
- ✅ Guaranteed consistency between component and API
- ✅ Graceful degradation when database fails
- ✅ 200-500ms performance improvement

**Architecture:**
```
DEFAULT_CREDIT_PACKAGES (lib/creditPackages.js)
    │
    ├──> PaywallModal: Initialize state instantly
    └──> API Route: Fallback when DB fails
```

**Updating Prices:**
1. Update Stripe dashboard (create new price ID)
2. Update `DEFAULT_CREDIT_PACKAGES` in `/lib/creditPackages.js`
3. Update database via Supabase SQL
4. Deploy to production

**Pattern:** Optimistic UI - treat configuration as code, not dynamic data. Credit packages change rarely (1-2x/year), so hardcoding with optional background sync provides best UX.

#### Credit Badge Update Race Condition Fix (Nov 13, 2025)

**Problem:** Credit badge showed stale credit count after image generation. API deducted credits in database but didn't return new count. Frontend tried async `refreshCredits()`, but users navigated back to camera before refresh completed.

**Root Cause:** Race condition between async credit refresh and user navigation.

**Solution:** 3-layer defense architecture.

**Layer 1 - Primary Fix (API Response Enhancement):**
```javascript
// API Route (generate-headshot/route.js)
// After credit deduction, fetch and return new count
const { data: updatedProfile } = await supabase
  .from('profiles')
  .select('credits')
  .eq('id', user.id)
  .single()

return NextResponse.json({
  success: true,
  image: generatedDataUrl,
  style: style,
  credits: updatedProfile.credits  // Include new count
})
```

**Layer 2 - Context Update Pattern:**
```javascript
// UserContext.jsx
// New function for synchronous state update
const updateCredits = useCallback((credits) => {
  setProfile(prev => ({ ...prev, credits }))
}, [])

// Frontend (page.js)
// Use API response credit count immediately
if (typeof data.credits === 'number') {
  updateCredits(data.credits)  // Instant, guaranteed consistency
}
```

**Layer 3 - Safety Net:**
```javascript
// page.js - handleNewPhoto()
// Refresh credits when returning to camera
refreshCredits().catch(err => {
  console.warn('[NewPhoto] Credit refresh failed (non-critical):', err)
})
```

**Results:**
- ✅ Zero race condition (credits update instantly)
- ✅ Guaranteed UI/DB consistency
- ✅ 100% reliability (3 fallback layers)
- ✅ Single source of truth (API response)

**Architecture:**
```
Generation Success → API returns new credit count → updateCredits()
                                                   → Display result screen
User clicks "New Photo" → Navigate to camera → refreshCredits() (safety)
                                             → Badge shows correct count
```

**Pattern:** Always return updated resource state in mutation API responses to eliminate async refresh race conditions.

#### Credit Loading Optimization - Stale-While-Revalidate (Nov 19, 2025)

**Problem:** After sign-in, users waited 10-15 seconds to see their credit count. During loading, clicking the camera button showed the paywall even if they had credits (false positive bug).

**Root Cause:**
1. Retry mechanism with aggressive timeouts (2s × 3 attempts + 1s, 2s, 4s delays = 13s worst case)
2. Paywall logic didn't differentiate between "loading" and "no credits"

**Solution:** 3-part optimization strategy.

**Part 1 - localStorage Caching (Instant Reload):**
```javascript
// UserContext.jsx - Cache helper functions
const PROFILE_CACHE_KEY = '__morpheo_profile_cache__'

function cacheProfile(profile) {
  const cacheData = { profile, timestamp: Date.now() }
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData))
}

function readCachedProfile() {
  const cached = localStorage.getItem(PROFILE_CACHE_KEY)
  if (!cached) return null
  const parsed = JSON.parse(cached)
  return parsed.profile
}

function clearProfileCache() {
  localStorage.removeItem(PROFILE_CACHE_KEY)
}
```

**Part 2 - Optimistic Loading:**
```javascript
// UserContext.jsx - useEffect initialization
useEffect(() => {
  // Load cached profile immediately for instant display
  const cachedProfile = readCachedProfile()
  if (cachedProfile) {
    console.log('[UserContext] Loading cached profile for instant display')
    setProfile(cachedProfile)  // Instant! (0ms)
    // Note: loading stays true because we still need fresh data
  }

  // Fetch fresh data in background
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await fetchProfile(session.user.id)  // Updates with fresh data
    } else {
      setProfile(null)
      clearProfileCache()  // Clear cache on logout
    }
  })
}, [])
```

**Part 3 - Faster Retry Mechanism:**
```javascript
// UserContext.jsx - Optimized retry with backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()
      if (result) return result

      // OPTIMIZED: 300ms, 600ms, 1200ms (instead of 1s, 2s, 4s)
      const delay = Math.min(300 * Math.pow(2, attempt), 1200)
      await new Promise(resolve => setTimeout(resolve, delay))
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      const delay = Math.min(300 * Math.pow(2, attempt), 1200)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return null
}

// Faster timeout per attempt
const fetchProfile = async (userId) => {
  const result = await retryWithBackoff(async () => {
    // OPTIMIZED: 500ms timeout (instead of 2s)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 500)
    )

    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    if (error) return null

    setProfile(data)
    cacheProfile(data)  // Cache for next visit
    return data
  }, 3)
}
```

**Part 4 - Paywall Bug Fix:**
```javascript
// CameraScreen.jsx - Fixed credit check
const { profile, loading } = useUser()

const checkCredits = () => {
  // Don't check credits if still loading - prevents false paywall
  if (loading) {
    console.log('[CameraScreen] Still loading profile, preventing action')
    return false
  }

  // Now safe to check credits (profile is loaded)
  if (!profile || profile.credits < 1) {
    setShowPaywall(true)
    return false
  }
  return true
}
```

**Results:**
- ✅ First visit: 10-15s → 1-2s (7-13x faster)
- ✅ Return visits: Instant (0ms cached display, 500ms fresh update)
- ✅ Zero false paywall bugs (respects loading state)
- ✅ Retry timeout: 2s → 500ms (4x faster)
- ✅ Retry delays: 1s, 2s, 4s → 300ms, 600ms, 1200ms (3x faster)
- ✅ Total worst case: 13s → ~3s

**Test Coverage:**
```bash
# Added 6 new cache tests to profile-loading.test.js
npm test
# ✅ 374 tests passing (was 368)
```

**Testing:**
```bash
# Test 1: First load
1. Clear localStorage: localStorage.clear()
2. Sign in and measure time to credit badge appearing
3. Expected: 1-2 seconds

# Test 2: Instant reload
1. Hard refresh (Cmd+Shift+R)
2. Credit badge should appear instantly
3. Check Console: "[Cache] Loaded cached profile: X credits"

# Test 3: No false paywall
1. Sign in with fresh account (has credits)
2. Click camera button during loading
3. Expected: Button disabled, no paywall shown
```

**Architecture:**
```
First Visit Flow:
Sign In → Auth Event → Fetch Profile (500ms timeout)
                    → Retry 3x (300ms, 600ms delays)
                    → Update UI + Cache
                    → Total: 1-2s

Return Visit Flow:
Page Load → Read Cache → Show Profile (0ms!)
         → Background Fetch → Update if changed (~500ms)

Camera Button (During Loading):
Click → Check loading state → If loading: Disable
                            → If loaded: Check credits
```

**Pattern:** Stale-While-Revalidate - show cached data instantly, fetch fresh data in background. Same pattern used by Netflix, Instagram, and Next.js. Users perceive instant loading because they see content immediately, not a spinner.

**Files Modified:**
- `nextjs-app/src/contexts/UserContext.jsx` - Caching + faster retries
- `nextjs-app/src/components/screens/CameraScreen.jsx` - Paywall bug fix
- `tests/integration/flows/profile-loading.test.js` - Updated timings + 6 new cache tests

---

## 11. Appendices

### 11.1 Glossary

| Term | Definition |
|------|------------|
| **Base64** | Binary-to-text encoding scheme for images |
| **Canvas API** | HTML5 API for drawing graphics via JavaScript |
| **Data URL** | URL scheme that embeds inline data (e.g., `data:image/jpeg;base64,...`) |
| **Design Tokens** | Centralized design system values (colors, spacing, etc.) |
| **Device Pixel Ratio (DPR)** | Ratio between physical pixels and logical pixels |
| **Facing Mode** | Camera direction: 'user' (front) or 'environment' (rear) |
| **Gemini API** | Google's AI API for text and image generation |
| **getUserMedia** | Web API for accessing camera/microphone |
| **Next.js** | React framework with server-side rendering and API routes |
| **Skeumorphic** | Design style mimicking real-world physical objects |
| **Web Share API** | Browser API for native sharing to apps/services |
| **Watermark** | Text/image overlay for branding/protection |

### 11.2 External Resources

#### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google GenAI Documentation](https://ai.google.dev/docs)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

#### Tutorials & Guides
- [Next.js Learn](https://nextjs.org/learn)
- [Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [getUserMedia Guide](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

#### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google AI Studio](https://aistudio.google.com)
- [Can I Use](https://caniuse.com) - Browser compatibility

#### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://react.dev/community)

### 11.3 Changelog

#### Version 1.1.0 - Morpheo 2.0 Phase 1 (Current)
**Release Date:** November 2025
**Last Update:** November 12, 2025

**Features:**
- ✅ Sign-in screen UI with skeuomorphic TV design
- ✅ MorpheoLogo component with red recording dot
- ✅ ShowcaseTV component with layered shadow effects
- ✅ GoogleButton component (styled, auth integration pending)
- ✅ Responsive mobile/desktop layouts (338px mobile, 800px desktop)
- ✅ Responsive showcase images with VHS playback effect
  - Desktop (≥768px): 9 landscape photos from `/showcase/desktop/`
  - Mobile (<768px): 8 portrait photos from `/showcase/mobile/`
  - Dynamic viewport detection using `matchMedia`
  - Auto-rotate with VHS glitch effects
- ✅ IBM Plex Mono & Crimson Pro fonts integrated
- ✅ Component composition patterns for reusability
- ✅ UserContext with authentication and credit management
- ✅ CreditBadge with liquid glass effect and color-coded states
- 🔄 Google OAuth setup guide complete (implementation pending)

**Performance Optimizations:**
- ✅ Fixed infinite render loop in UserContext (Jan 12, 2025)
  - Moved `retryWithBackoff` utility to module level
  - Stabilized React dependency chain
  - Reduced database queries from 10-20 per page load to 1
  - 95% reduction in Supabase API calls
- ✅ Eliminated PaywallModal loading state (Nov 12, 2025)
  - Implemented optimistic UI pattern with constants
  - Created single source of truth in `/lib/creditPackages.js`
  - Zero loading state (instant UI rendering)
  - 200-500ms performance improvement
- ✅ Fixed credit badge update race condition (Nov 13, 2025)
  - API now returns updated credit count after deduction
  - Added synchronous `updateCredits()` function to UserContext
  - Eliminated async refresh race condition
  - 3-layer defense architecture for 100% reliability
  - Guaranteed UI/DB consistency

**Documentation Added:**
- Complete sign-in UI implementation guide
- Google OAuth setup guide for Supabase
- Morpheo 2.0 design specifications
- Phase-based implementation roadmap
- UserContext performance optimization notes

#### Version 1.0.0
**Release Date:** October 2025

**Features:**
- ✅ Next.js 15 migration complete
- ✅ 13 themed filters implemented
- ✅ Google Gemini 2.5 Flash integration
- ✅ Mobile-first responsive design
- ✅ Camera capture and file upload
- ✅ Watermark system
- ✅ Web Share API integration
- ✅ Error handling and recovery
- ✅ Production deployment on Vercel

**Recent Changes:**
- Updated Halloween filter to specify human-like characters
- Added camera permission modal implementation plan
- Simplified filter prompts (Star Wars, Harry Potter)
- Replaced Skull filter with Halloween theme
- Removed Vampire filter

#### Version 0.9.0 (Pre-Release)
**Date:** September 2025
- Initial Vite/Express implementation
- 8 original filters
- Basic camera functionality

### 11.4 Project File References

#### Core Documentation Files
- `docs/PROJECT_SPEC.md` - Original project specification and architecture
- `docs/PROJECT_LEARNINGS.md` - Critical patterns and best practices
- `docs/NEXTJS_MIGRATION_PLAN.md` - Migration from Vite to Next.js
- `docs/WATERMARK_REFERENCE.md` - Watermark implementation details
- `docs/RATE_LIMIT_REFERENCE.md` - Rate limiting reference (Upstash)
- `docs/CAMERA_PERMISSION_PLAN.md` - Camera permission modal plan
- `docs/UI_IMPLEMENTATION_BRIEF.md` - UI design guidelines

#### Morpheo 2.0 - Authentication Documentation
- `docs/SIGN_IN_UI_IMPLEMENTATION.md` - Complete sign-in screen implementation guide (Phase 1 ✅)
- `docs/GOOGLE_OAUTH_SETUP_GUIDE.md` - Step-by-step Google OAuth and Supabase setup
- `MORPHEO_2.0_PHASE_1_SETUP.md` - Morpheo 2.0 technical setup and dependencies
- `MORPHEO_2.0_PHASE_1_DESIGN_SPEC.md` - Design specifications and Figma references
- `MORPHEO_2.0_IMPLEMENTATION_PLAN.md` - Overall implementation roadmap

#### Key Code Files
- `src/app/page.js` - Main application entry point
- `src/app/api/generate-headshot/route.js` - AI generation API
- `src/constants/filters.js` - Filter definitions
- `src/constants/stylePrompts.js` - AI prompts
- `src/lib/designTokens.js` - Design system tokens
- `src/lib/watermark.js` - Watermark utility
- `tailwind.config.js` - Tailwind customization

### 11.5 Team & Credits

#### Core Team
- **Creator:** [Creator Name]
- **Repository:** [GitHub URL]
- **License:** [License Type]

#### Technologies & Services
- **Next.js** - Vercel
- **Google Gemini** - Google AI
- **Vercel** - Hosting & Deployment
- **Tailwind CSS** - Adam Wathan

#### Special Thanks
- Google AI team for Gemini API access
- Vercel team for Next.js and hosting
- Open source community

---

## Document Maintenance

**Current Version:** 1.1.0 - Morpheo 2.0 Phase 1
**Last Updated:** November 13, 2025
**Next Review:** December 2025

**Update Triggers:**
- New feature implementation
- Architecture changes
- API updates
- Performance optimizations
- Bug fixes affecting documentation

**Update Process:**
1. Make code changes
2. Update relevant documentation sections
3. Update changelog (Section 11.3)
4. Update "Last Updated" date
5. Commit with message: `docs: update documentation for [feature]`

---

**End of Documentation**

For questions or contributions, please contact the team or submit an issue in the repository.
