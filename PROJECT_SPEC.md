# AI Professional Headshot Generator

## Overview
A web application that transforms casual photos into professional headshots using AI. Users can capture a photo using their device camera (desktop webcam or mobile camera), select from three professional styles, and receive an AI-generated headshot that can be compared side-by-side with the original image.

## Features
- **Live Camera Capture**: Access device camera (webcam/mobile) to take real-time photos
- **Style Selection**: Three professional headshot styles
  - Corporate Classic: Traditional business headshot with neutral background
  - Creative Professional: Modern, approachable style with artistic flair
  - Executive Portrait: Premium, high-end corporate look
- **Side-by-Side Comparison**: View original and AI-generated headshot simultaneously
- **Download Capability**: Save generated headshots to local device
- **Local Storage**: Images persisted in browser for session continuity

## Requirements

### Functional Requirements
- Users can capture photos using device camera (webcam on desktop, front/rear camera on mobile)
- Camera preview with real-time video feed
- Capture button to take snapshot from video stream
- Option to retake photo if not satisfied
- Users can select one of three predefined headshot styles
- System generates professional headshot using Google's Imagen 3 (Nano Banana) API
- Users can view original and generated images side-by-side
- Users can download generated headshots
- Images stored locally in browser (no server-side persistence)
- No user authentication required

### Non-Functional Requirements
- Responsive design for desktop and mobile devices
- Fast image generation (<10 seconds)
- Clean, professional UI/UX
- Error handling for failed generations
- Image preview before generation

## Tech Stack

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS v3 (instead of v4)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Camera Access**: MediaDevices Web API (getUserMedia)
- **Image Capture**: HTML5 Canvas API for video snapshot
- **Storage**: Browser localStorage

### Backend
- **Framework**: Express.js
- **Runtime**: Node.js
- **API Integration**: Google Gemini API (Imagen 3 - Nano Banana https://ai.google.dev/gemini-api/docs/image-generation)
- **Environment Variables**: dotenv for API key management

### Image Processing
- **API**: Google Imagen 3 (image-to-image transformation)
- **Model**: Nano Banana (vega-nano-banana-imagen-v1)

## Architecture
```
┌─────────────┐
│   React     │
│  Frontend   │ ──── HTTP ────┐
│  (Tailwind) │               │
└─────────────┘               ▼
                      ┌──────────────┐
                      │   Express    │
                      │   Backend    │
                      └──────────────┘
                              │
                              │ API Call
                              ▼
                      ┌──────────────┐
                      │   Google     │
                      │  Gemini API  │
                      │ (Nano Banana)│
                      └──────────────┘
```

## Milestones

### Milestone 1: UI Setup & Frontend Implementation
**Goal**: Build complete user interface with mock functionality

**Tasks**:
- [ ] Initialize React project with Vite
- [ ] Configure Tailwind CSS v3
- [ ] Create main layout component
- [ ] Implement camera capture component:
  - [ ] Request camera permissions via getUserMedia API
  - [ ] Display live video feed from device camera
  - [ ] Add capture button to take photo snapshot
  - [ ] Implement retake functionality
  - [ ] Handle camera permission denied errors
  - [ ] Support front/rear camera selection on mobile
- [ ] Build style selection interface (3 style cards)
- [ ] Create side-by-side comparison view
- [ ] Implement download functionality
- [ ] Add localStorage integration for image persistence
- [ ] Create loading states and error UI components
- [ ] Make responsive design for mobile/tablet/desktop

**Deliverables**:
- Fully functional UI with all components
- Working camera capture with live preview
- Mock image generation (shows captured photo as placeholder)
- Working download and comparison features
- Responsive layout across all screen sizes
- Proper error handling for camera permissions

### Milestone 2: Backend Integration & AI Generation
**Goal**: Integrate Google Nano Banana API for real headshot generation

**Tasks**:
- [ ] Initialize Express.js backend server
- [ ] Set up environment variables and API key configuration
- [ ] Create `/api/generate-headshot` endpoint
- [ ] Implement Google Gemini API client setup
- [ ] Build image-to-image transformation logic using Nano Banana
- [ ] Create prompt engineering for three headshot styles:
  - Corporate Classic prompt
  - Creative Professional prompt
  - Executive Portrait prompt
- [ ] Implement error handling and API rate limiting
- [ ] Add image format conversion (base64 ↔ binary)
- [ ] Connect frontend to backend API
- [ ] Test end-to-end generation workflow
- [ ] Add retry logic for failed generations

**Deliverables**:
- Working Express backend with Nano Banana integration
- Three distinct style generation outputs
- Full end-to-end image generation pipeline
- Error handling and user feedback
- Production-ready application

## API Reference

### Google Gemini API (Nano Banana)
- **Documentation**: https://ai.google.dev/gemini-api/docs/image-generation
- **Model**: `vega-nano-banana-imagen-v1`
- **Method**: Image-to-image transformation
- **Authentication**: API Key via `x-goog-api-key` header

## File Structure
```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── StyleSelector.jsx
│   │   │   ├── ImageComparison.jsx
│   │   │   └── DownloadButton.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── server/                 # Express backend
│   ├── routes/
│   │   └── generate.js
│   ├── services/
│   │   └── geminiService.js
│   ├── server.js
│   └── package.json
│
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key
- npm or yarn package manager

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Configure environment variables
cp .env.example .env
# Add your GOOGLE_API_KEY to .env

# Run development servers
npm run dev  # In both client and server directories
```

## Future Enhancements
- User accounts with image history
- More style options (10+ styles)
- Batch processing for multiple photos
- Advanced editing controls (brightness, contrast, background)
- Social media optimization presets
- Team/organization management features
