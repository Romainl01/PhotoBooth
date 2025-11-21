# 2. Technical Architecture

## 2.1 Technology Stack

### Frontend
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

### Backend
```json
{
  "framework": "Next.js API Routes",
  "runtime": "Node.js",
  "ai": "@google/genai 1.25.0",
  "model": "gemini-2.5-flash-image",
  "environment": "dotenv 17.2.3"
}
```

### Development & Build
```json
{
  "bundler": "Next.js with Turbopack",
  "deployment": "Vercel",
  "analytics": "@vercel/analytics 1.5.0",
  "version_control": "Git"
}
```

## 2.2 System Architecture

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

## 2.3 Data Flow

### Capture Flow
```
Video Stream → Canvas Capture → Horizontal Flip → JPEG Compression
   → Base64 Encoding → State Storage → API Request
```

### Generation Flow
```
API Request → Validation → Style Prompt Lookup → Gemini API Call
   → Image Generation → Base64 Response → State Update → Display
```

### Share/Download Flow
```
Generated Image → Canvas Watermarking → Blob Creation
   → [Mobile: Web Share API | Desktop: Download Link]
   → Blob URL Revocation (memory cleanup)
```

## 2.4 Project Structure

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
│   │   │   ├── designTokens.js              # Design system tokens
│   │   │   └── watermark.js                 # Watermark utility
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

## 2.5 Key Architectural Decisions

### 1. Next.js Full-Stack Architecture
**Decision:** Migrate from Vite/Express to Next.js 15
**Rationale:**
- Unified frontend/backend in single codebase
- Built-in API routes eliminate separate backend server
- Vercel deployment optimization
- Better SEO and performance with React Server Components

### 2. Client-Side Image Processing
**Decision:** Use Canvas API for capture and watermarking
**Rationale:**
- No server overhead for image manipulation
- Instant feedback for users
- Reduced bandwidth usage
- Better privacy (images not stored on server)

### 3. Google Gemini 2.5 Flash
**Decision:** Use latest Gemini Flash model instead of heavier models
**Rationale:**
- Fast generation times (< 10 seconds)
- Lower API costs
- Sufficient quality for social media use
- Better user experience with minimal wait

### 4. Mobile-First Design
**Decision:** Optimize primarily for mobile devices
**Rationale:**
- 80%+ users access via smartphone
- Camera is primary input method
- Touch-optimized UI critical for UX
- Desktop as secondary experience

### 5. Stateless Sessions
**Decision:** No user accounts or server-side storage
**Rationale:**
- Zero friction signup flow
- Privacy-focused (no data retention)
- Simplified infrastructure
- Faster time-to-value for users
