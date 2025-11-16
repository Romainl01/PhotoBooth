# MORPHEO - Comprehensive Architecture & Test Plan Analysis

> **📖 Documentation Guide:**
> - **This file** - Complete architecture reference & testing strategy (read once, reference often)
> - **ARCHITECTURE_QUICK_REFERENCE.md** - Fast lookup while coding (< 5 min read)
> - **TEST_IMPLEMENTATION_PLAN.md** - Active test implementation tracker with beginner workflow ⭐ **START HERE for testing**

**Project Name:** Morpheo - AI-Powered Creative Photo Transformation Web Application
**Version:** 2.1.0 - Production-Ready
**Live URL:** https://morpheo-phi.vercel.app/
**Repository:** NanoBananaTutorial
**Last Updated:** November 2025

---

## 1. Application Type & Overview

### Classification
- **Primary Type:** Full-Stack Web Application (SPA with Backend APIs)
- **Architecture Pattern:** Next.js 15 App Router with Server Components
- **Deployment:** Vercel (Edge Functions + Serverless)
- **Target Platform:** Mobile-first web application (responsive design)

### Core Purpose
Morpheo is an AI-powered photo transformation application that allows users to:
- Capture photos via device camera or upload from gallery
- Apply 13 themed AI-generated filters (cinematic, fantasy, horror, fashion)
- Purchase credits to generate transformations
- Share/download watermarked results
- Manage authentication and credit balance

**User Journey:**
Sign In → Camera/Upload → Filter Selection → Generation → Result → Share/Download → Repeat

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.5 | React framework with App Router, API routes |
| **React** | 19.1.0 | UI library with hooks and context |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS framework |
| **TypeScript** | N/A (JavaScript) | Client and server code in JS |
| **Lucide React** | 0.553.0 | Icon library |
| **HTML5 Canvas API** | Native | Image capture and manipulation |
| **MediaDevices Web API** | Native | Camera access and video streaming |
| **Web Share API** | Native | Social sharing functionality |

### Backend & APIs
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.5.5 | Serverless backend endpoints |
| **Google GenAI SDK** | 1.25.0 | Gemini 2.5 Flash image generation |
| **Supabase** | 2.80.0 | PostgreSQL database + Auth |
| **@supabase/ssr** | 0.7.0 | Server-side session management |
| **Stripe** | 19.3.0 | Payment processing & webhooks |
| **Vercel Analytics** | 1.5.0 | Application analytics |

### Database
| Component | Purpose |
|-----------|---------|
| **Supabase PostgreSQL** | User profiles, credit transactions, packages |
| **Tables:** `profiles`, `credit_transactions`, `credit_packages` | Core data models |
| **Auth Provider:** Supabase Auth (Google OAuth) | User authentication |

### External Services
| Service | Integration | Purpose |
|---------|-------------|---------|
| **Google Gemini 2.5 Flash** | `@google/genai` | AI image generation |
| **Stripe** | Payments API + Webhooks | Credit purchasing & billing |
| **Supabase** | Client + Server SDKs | Database & authentication |
| **Vercel** | Deployment platform | Hosting & analytics |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >=22.0.0 | Runtime requirement |
| **npm** | >=9.0.0 | Package manager |
| **ESLint** | 9 | Code linting |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |
| **PostCSS** | 8.5.6 | CSS processing |

---

## 3. Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── page.js                              [Main app - 450+ lines]
│   │   ├── layout.js                            [Root layout + font setup]
│   │   ├── globals.css                          [Global styles]
│   │   ├── api/
│   │   │   ├── health/route.js                  [Health check endpoint]
│   │   │   ├── generate-headshot/route.js       [AI generation (200+ lines)]
│   │   │   ├── checkout/route.js                [Stripe checkout session]
│   │   │   ├── credit-packages/route.js         [Get available packages]
│   │   │   └── webhooks/
│   │   │       └── stripe/route.js              [Stripe webhook handler]
│   │   ├── auth/
│   │   │   └── callback/route.js                [OAuth redirect handler]
│   │   └── sign-in/
│   │       └── page.jsx                         [Sign-in UI page]
│   │
│   ├── components/
│   │   ├── screens/                             [Full-page components]
│   │   │   ├── CameraScreen.jsx                 [Main camera UI]
│   │   │   ├── ResultScreen.jsx                 [Generated image display]
│   │   │   ├── CameraAccessError.jsx            [Permission denied]
│   │   │   ├── GenericError.jsx                 [API error fallback]
│   │   │   ├── FileFormatError.jsx              [Invalid file type]
│   │   │   └── FileSizeError.jsx                [File too large]
│   │   │
│   │   ├── ui/                                  [Reusable UI components]
│   │   │   ├── Button.jsx                       [Primary button]
│   │   │   ├── IconButton.jsx                   [Icon-only button]
│   │   │   ├── CreditBadge.jsx                  [Credit display badge]
│   │   │   ├── FilterSelector.jsx               [Filter carousel]
│   │   │   ├── FilterDisplay.jsx                [Current filter name]
│   │   │   ├── Loader.jsx                       [Loading spinner overlay]
│   │   │   ├── RetryButton.jsx                  [Retry action button]
│   │   │   ├── SkeuomorphicCircleButton.jsx     [Capture button style]
│   │   │   ├── SkeuomorphicRectButton.jsx       [Control buttons style]
│   │   │   └── ErrorLayout.jsx                  [Error screen wrapper]
│   │   │
│   │   ├── icons/                               [SVG icon components]
│   │   │   ├── CaptureIcon.jsx
│   │   │   ├── UploadIcon.jsx
│   │   │   ├── SwitchCameraIcon.jsx
│   │   │   ├── ShareIcon.jsx
│   │   │   ├── DownloadIcon.jsx
│   │   │   ├── LoadingIcon.jsx
│   │   │   ├── RetryIcon.jsx
│   │   │   ├── SettingsIcon.jsx
│   │   │   ├── ArrowLeftIcon.jsx
│   │   │   ├── ArrowRightIcon.jsx
│   │   │   └── CloseIcon.jsx
│   │   │
│   │   ├── auth/                                [Authentication UI]
│   │   │   ├── SignInLayout.jsx                 [Sign-in page layout]
│   │   │   ├── GoogleButton.jsx                 [Google OAuth button]
│   │   │   ├── MorpheoLogo.jsx                  [App logo component]
│   │   │   ├── ShowcaseTV.jsx                   [CRT-style showcase]
│   │   │   ├── VHSPlayback.jsx                  [VHS effect component]
│   │   │   └── .archive/                        [Unused animations]
│   │   │
│   │   ├── modals/                              [Overlay components]
│   │   │   ├── PaywallModal.jsx                 [Credit purchase modal]
│   │   │   └── SettingsDrawer.jsx               [User settings panel]
│   │   │
│   │   ├── grain/                               [Visual effects]
│   │   │   ├── GrainLayout.jsx                  [Film grain overlay]
│   │   │   └── StyleCarousel.jsx                [Filter carousel layout]
│   │   │
│   │   └── CameraCapture.jsx                    [Camera stream component]
│   │
│   ├── constants/
│   │   ├── filters.js                           [13 filter names]
│   │   ├── stylePrompts.js                      [AI prompts per filter]
│   │   └── loadingMessages.js                   [Dynamic loading messages]
│   │
│   ├── contexts/
│   │   └── UserContext.jsx                      [Global user state (450+ lines)]
│   │
│   ├── hooks/
│   │   └── useTypewriter.js                     [Text animation hook]
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js                        [Browser Supabase client]
│   │   │   ├── server.js                        [Server Supabase client]
│   │   │   └── middleware.js                    [Auth middleware]
│   │   ├── fileValidation.js                    [File upload validation]
│   │   ├── creditPackages.js                    [Credit tier configuration]
│   │   ├── designTokens.js                      [Design system values]
│   │   ├── watermark.js                         [Image watermarking utility]
│   │   └── logger.js                            [Production-safe logging]
│   │
│   └── middleware.js                            [Next.js auth middleware]
│
├── public/                                       [Static assets]
│   ├── logo.svg
│   ├── favicon.ico
│   └── [other images/icons]
│
├── next.config.mjs                              [Security headers config]
├── tailwind.config.js                           [Tailwind customization]
├── postcss.config.mjs                           [PostCSS plugins]
├── package.json                                 [Dependencies]
└── .env.local                                   [Environment variables]
```

---

## 4. Core Architecture Patterns

### 4.1 Component Architecture

#### Client vs Server Components
```
Page Component (Client)
├── useUser() hook [Context]
├── State management (8+ useState hooks)
├── Camera/Upload handlers
├── Generation flow
└── Screen routing logic

Rendering Strategy:
- Page: 'use client' (client component)
- CameraScreen: 'use client' (client state + refs)
- ResultScreen: 'use client' (event handlers)
- Layout: Server component with UserProvider wrap
```

#### Component Hierarchy
```
RootLayout (Server)
└── UserProvider (Client Context)
    └── HomePage (Client)
        ├── CameraScreen
        │   ├── CreditBadge
        │   ├── FilterSelector
        │   ├── PaywallModal
        │   ├── SettingsDrawer
        │   └── [Icon Buttons]
        ├── ResultScreen
        ├── Error Screens
        └── Loader Overlay
```

### 4.2 State Management

#### Global State (UserContext)
- `user`: Supabase auth user object
- `profile`: Database profile with credits count
- `loading`: Initial load state
- `refreshCredits()`: Manually trigger profile refresh
- `updateCredits(count)`: Synchronously update credits from API response

**Key Features:**
- Exponential backoff retry logic (3 attempts, 1s-8s delays)
- 2-second query timeout to prevent hanging
- Session refresh before API calls
- bfcache (back/forward cache) handling

#### Page-Level State
```javascript
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
const [currentFilterIndex, setCurrentFilterIndex] = useState(0)
const [capturedImage, setCapturedImage] = useState(null)
const [generatedImage, setGeneratedImage] = useState(null)
const [isGenerating, setIsGenerating] = useState(false)  // Race condition prevention
const [isMobile, setIsMobile] = useState(false)
```

#### State Flow for Generation
```
Camera Screen
    ↓ (capture/upload)
Loading Screen + setIsGenerating(true)
    ↓ (POST /api/generate-headshot)
✓ Success: setGeneratedImage() + Result Screen
✗ Error 402: Back to Camera + Paywall shown
✗ Error 401: Redirect to /sign-in
✗ API Error: GenericError Screen
```

### 4.3 Data Flow & API Integration

#### Image Generation Pipeline
```
1. Capture/Upload
   ├─ Validate file format (MIME types)
   ├─ Validate file size (<10MB)
   └─ Convert to base64 data URL

2. Client-Side Pre-flight
   ├─ Validate image data (not empty, min 100 bytes)
   ├─ Refresh Supabase session (10s timeout)
   └─ Validate filter index

3. API Call: POST /api/generate-headshot
   ├─ Auth check (401 if unauthorized)
   ├─ Credit check (402 if <1 credit)
   ├─ Call Google Gemini 2.5 Flash API
   ├─ Handle quota errors (503)
   ├─ Validate response structure
   ├─ Check finish reason (safety filters)
   └─ Return base64 image + credits count

4. Client-Side Post-processing
   ├─ Update credits from API response (sync)
   ├─ Fallback: refreshCredits() async if missing
   └─ Display in ResultScreen
```

#### Credit System Flow
```
Purchase Credits (Stripe)
    ↓
POST /api/checkout
    ↓ (creates session)
Redirect to Stripe Checkout
    ↓
User pays + Stripe sends webhook
    ↓
POST /api/webhooks/stripe (signature verified)
    ↓ (updates profile.credits)
Webhook returned 200 (idempotent)
    ↓
Frontend polls refreshCredits() every 2s (5 attempts)
    ↓ (webhook latency 1-3 seconds)
Credits display updated + URL cleaned
```

### 4.4 Authentication Flow

#### OAuth Sign-In
```
/sign-in page
    ↓
GoogleButton clicks
    ↓
supabase.auth.signInWithOAuth({provider: 'google'})
    ↓
Redirect to Google → OAuth consent → Redirect back
    ↓
/auth/callback?code=xxx
    ↓
Supabase auto-completes exchange
    ↓
Redirect to / (homepage)
    ↓
UserContext listens to onAuthStateChange
    ↓
Session exists → Fetch profile → Set user/profile state
```

#### Session Management
- **Browser Storage:** Cookies (via @supabase/ssr)
- **Auth Listener:** Automatic on mount + sign-in/out
- **Token Refresh:** Before critical API calls (10s timeout)
- **Safety Timeout:** If no session after 10s, stop loading

### 4.5 Error Handling Strategy

#### Error Categories & Screens
```
1. CameraAccessError
   - Trigger: navigator.mediaDevices.getUserMedia() fails
   - Reasons: Permission denied, device unavailable
   - Recovery: Retry button

2. FileFormatError
   - Trigger: File MIME type not in [jpeg, jpg, png, webp]
   - Recovery: Select different file

3. FileSizeError
   - Trigger: File size > 10MB
   - Recovery: Select smaller file

4. GenericError (API failures)
   - Trigger: Gemini API error (non-quota), network errors
   - Recovery: Retry generation with saved captured image

5. PaymentError (402)
   - Trigger: User has 0 credits
   - Recovery: Show PaywallModal, purchase credits
```

#### Error Recovery Mechanisms
- **Retry with Exponential Backoff:** Profile fetch (1s, 2s, 4s delays)
- **Idempotent Webhooks:** Stripe events deduplicated by session ID
- **Session Refresh Timeout:** 10s max, proceeds if timeout
- **Credit Update Fallback:** Async refresh if API didn't return credits
- **bfcache Refresh:** Reload profile on browser back/forward

### 4.6 Security Architecture

#### Security Headers (Next.js Config)
```
X-Frame-Options: DENY              [Prevent clickjacking]
X-Content-Type-Options: nosniff    [Prevent MIME sniffing]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
```

#### Authentication Security
- **Client:** Supabase client-side auth (session cookies)
- **Server:** Supabase createServerClient with cookies
- **Middleware:** Validates auth for protected routes
- **API Routes:** getUser() check before processing

#### Data Security
```
Production Logging:
- PII Sanitization: User IDs (last 4 chars), emails (u***@domain), payments (***LAST4)
- No Debug Logs in Prod
- Sensitive Field Redaction

Stripe Integration:
- Webhook Signature Verification (HMAC)
- Idempotent Processing (prevents duplicate credits)
- Metadata Validation (userId, credits in session)
```

#### Credit System Rate Limiting
- **Natural Rate Limiting:** User can't generate beyond purchased credits
- **No Spam Protection Needed:** Credit balance prevents abuse
- **Transaction Audit Trail:** credit_transactions table logs all changes

---

## 5. Critical User Flows

### Flow 1: First-Time User Sign-In
```
1. Load / (unauthenticated)
2. UserContext mounts → onAuthStateChange fires
3. No session found → user = null
4. Middleware detects no auth? → Redirect to /sign-in
5. /sign-in loads SignInLayout with GoogleButton
6. User clicks "Sign In with Google"
7. OAuth flow → Redirect to /auth/callback?code=...
8. Callback handles exchange → Redirect back to /
9. UserContext refires → Session exists
10. Fetch profile (3 retries, 2s timeout) → Set user/profile
11. Homepage loads, shows CreditBadge with 0 credits
12. Must purchase to generate
```

### Flow 2: Capturing & Generating Image
```
1. Camera initialized → video stream running
2. User clicks capture or uploads file
3. Guard: checkCredits() → if <1 show PaywallModal
4. Guard: isGenerating flag → prevent race condition
5. Validate image data (not empty, min 100 bytes)
6. Refresh session (10s timeout, non-blocking)
7. POST /api/generate-headshot with base64 + filter
8. API: Auth → Credits check → Gemini call
9. Response: 
   - ✓ 200: image + credits returned
   - ✗ 402: Insufficient credits (show paywall)
   - ✗ 401: Session expired (redirect to sign-in)
   - ✗ 503: Quota exceeded (retry message)
   - ✗ Other: Generic error screen
10. Client: Update credits + show result
11. Show ResultScreen with download/share/retry options
```

### Flow 3: Purchasing Credits
```
1. Click on CreditBadge or use PaywallModal
2. Select package (Starter 10/$2.99, Creator 30/$6.99, Pro 100/$17.99)
3. POST /api/checkout with priceId
4. API: Auth → Validate price in DB → Create Stripe session
5. Redirect to Stripe Checkout
6. User enters payment details
7. Stripe confirms → Calls webhook POST /api/webhooks/stripe
8. API: Verify signature → Extract userId/credits from metadata
9. Update profiles table: credits += amount
10. Webhook returns 200 (idempotent by session ID)
11. User redirected back to / with ?payment=success
12. Frontend: Poll refreshCredits() every 2s (5 times)
13. UserContext updates credits after 1-3s (webhook latency)
14. CreditBadge changes color and shows new count
```

### Flow 4: Error Recovery - Retry Generation
```
1. API generation fails (non-402, non-401)
2. GenericError screen shown with Retry button
3. Captured image still in memory
4. Click Retry → generateImage(capturedImage, currentFilterIndex)
5. Same generation flow as Flow 2
6. OR: Click "New Photo" → Back to Camera → Reset state
```

### Flow 5: Browser Back/Forward (bfcache)
```
1. User completes payment on Stripe
2. Browser redirects back to / with ?payment=success
3. Frontend polls refreshCredits() every 2s
4. User navigates away then back (hits back button)
5. Browser restores page from bfcache (frozen state)
6. pageshow event fires with persisted=true
7. UserContext handlePageShow refires
8. Call getSession() → fetchProfile(userId)
9. Credits update to current DB value (not stale)
```

---

## 6. Main Features & Modules

### Feature 1: Live Camera Capture
- **Components:** CameraScreen, CameraCapture ref
- **APIs Used:** navigator.mediaDevices.getUserMedia()
- **Browser Support:** iOS 15+, Android 5+
- **Key Logic:** Canvas draw + horizontal flip + base64 conversion
- **Mobile Support:** Facingmode switching (user/environment)
- **Error Handling:** CameraAccessError screen with retry

### Feature 2: Photo Upload
- **Components:** CameraScreen (file input), fileValidation lib
- **Validation:** MIME type + file size (10MB max)
- **Supported Formats:** JPEG, PNG, WebP
- **Error Handling:** FileFormatError, FileSizeError screens
- **FileReader API:** Convert File → base64 data URL

### Feature 3: AI Image Generation
- **API Route:** POST /api/generate-headshot
- **AI Model:** Google Gemini 2.5 Flash (vision)
- **Prompts:** 13 custom prompts per filter (constants/stylePrompts.js)
- **Input:** Base64 image + filter name
- **Output:** Base64 PNG image + credits remaining
- **Error Handling:** Safety filters, quota limits, generic errors

### Feature 4: User Authentication
- **Provider:** Supabase Auth (Google OAuth)
- **Pages:** /sign-in (UI), /auth/callback (handler)
- **Session Management:** Cookie-based (via @supabase/ssr)
- **State:** UserContext global context with retry logic
- **Timeout:** 10s max for initial load + profile fetch

### Feature 5: Credit System
- **Models:** profiles table (credits), credit_transactions table
- **Tiers:** Starter (10cr/$3), Creator (30cr/$7), Pro (100cr/$18)
- **Deduction:** 1 credit per image generation
- **Purchase:** Stripe integration via checkout modal
- **Validation:** Checked before generation + payment required response

### Feature 6: Payment Processing
- **Provider:** Stripe (Checkout Sessions + Webhooks)
- **Checkout API:** POST /api/checkout
- **Webhook Handler:** POST /api/webhooks/stripe
- **Signature Verification:** HMAC validation (security)
- **Idempotency:** Session ID deduplication
- **Metadata:** Passes userId, credits, package_name

### Feature 7: Image Sharing & Download
- **ResultScreen Component:** Download/Share buttons
- **Download:** Canvas.toDataURL() + HTML link
- **Sharing:** Web Share API (navigator.share)
- **Watermark:** Automatic "Morpheo" branding on images
- **Platform Support:** iOS (mail, messages), Android (apps)

### Feature 8: Filter System
- **Filters:** 13 curated styles (constants/filters.js)
- **Categories:** Cinematic (4), Fantasy (3), Horror (3), Fashion (3)
- **Prompts:** Custom AI prompts per filter (constants/stylePrompts.js)
- **Navigation:** Left/right carousel with filter preview
- **Validation:** Runtime check that FILTERS ⊆ STYLE_PROMPTS

### Feature 9: Error Handling & Retry
- **Error Screens:** 5 distinct error types
- **Retry Logic:** 
  - Profile fetch: 3 retries with exponential backoff
  - Generation: Save image for retry
  - Camera: Restart permission flow
- **User Feedback:** Explicit error messages + retry actions

### Feature 10: Loading States
- **Loader Component:** Spinner overlay with filter name
- **Loading Messages:** Dynamic contextual messages (constants/loadingMessages.js)
- **Race Condition Prevention:** isGenerating flag blocks duplicate clicks
- **Estimated Time:** "Creating your X image..." with ETA

### Feature 11: Analytics & Logging
- **Vercel Analytics:** Automatic page load metrics
- **Custom Logging:** Production-safe logger (lib/logger.js)
- **PII Redaction:** Automatic in production
- **Log Levels:** debug, info, warn, error, security

### Feature 12: Design System
- **Colors:** Via Tailwind config (dark theme)
- **Typography:** DM Mono, IBM Plex Mono, Crimson Pro fonts
- **Components:** Skeuomorphic buttons (3D effect), glass morphism badges
- **Responsive:** Mobile-first (max-width 402px on mobile)

---

## 7. API Endpoints Reference

### 1. GET /api/health
**Purpose:** Health check endpoint for deployment verification
```
Response (200):
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

### 2. POST /api/generate-headshot
**Purpose:** Generate AI-styled image from photo
```
Headers: 'Content-Type: application/json'
Body:
{
  "image": "data:image/jpeg;base64,...",
  "style": "Executive"  // Filter name
}

Response (200):
{
  "success": true,
  "image": "data:image/png;base64,...",
  "style": "Executive",
  "credits": 42  // Remaining credits after deduction
}

Response (402): Insufficient credits
{
  "error": "Insufficient credits",
  "needsCredits": true,
  "message": "Purchase more credits to continue."
}

Response (401): Unauthorized
{
  "error": "Unauthorized. Please sign in."
}

Response (503): Quota exceeded
{
  "error": "Service temporarily at capacity",
  "message": "Your credit was NOT used.",
  "retryAfter": 60
}
```

### 3. POST /api/checkout
**Purpose:** Create Stripe checkout session for credit purchase
```
Headers: 'Content-Type: application/json'
Body:
{
  "priceId": "price_1SS4E8K9cHL77TyOtdNpKgCr"
}

Response (200):
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}

Response (401): Unauthorized
Response (400): Invalid price ID
```

### 4. GET /api/credit-packages
**Purpose:** Fetch available credit packages
```
Response (200):
{
  "packages": [
    {
      "id": "1",
      "name": "Starter",
      "emoji": "💫",
      "credits": 10,
      "price_cents": 299,
      "currency": "EUR",
      "stripe_price_id": "price_1SS4E8K9cHL77TyOtdNpKgCr",
      "display_order": 1
    },
    // ... more packages
  ]
}
```

### 5. POST /api/webhooks/stripe
**Purpose:** Handle Stripe webhook events
```
Headers: stripe-signature: t=...,v1=...

Event: checkout.session.completed
- Extract: userId, credits, packageName from metadata
- Update: profiles.credits += credits
- Create: credit_transactions entry
- Return: 200 OK (idempotent)

Error Handling:
- 400: Missing signature
- 400: Signature verification failed
- 400: Missing metadata
```

### 6. GET /auth/callback
**Purpose:** Handle OAuth redirect after Google login
```
Query: ?code=... (from Google)

Process:
- Supabase auto-exchanges code for session
- Redirect to /
- UserContext picks up session

Response: 302 redirect to /
```

---

## 8. Database Schema (Supabase)

### Table: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR,
  credits INTEGER DEFAULT 0,
  total_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Table: credit_transactions
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  amount INTEGER,
  type VARCHAR (purchase, refund, generation),
  reference_id VARCHAR,  -- Stripe session ID or generation ID
  created_at TIMESTAMP DEFAULT now()
);
```

### Table: credit_packages
```sql
CREATE TABLE credit_packages (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  emoji VARCHAR,
  credits INTEGER,
  price_cents INTEGER,
  currency VARCHAR,
  stripe_price_id VARCHAR UNIQUE,
  active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 9. Environment Variables

### Required Variables
```
# Google Gemini API
GOOGLE_API_KEY=AIza...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_CREATOR=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

---

## 10. Existing Tests & Infrastructure

### Current State
- **No Unit Tests:** No .test.js or .spec.js files in src/
- **No E2E Tests:** No Cypress, Playwright, or similar setup
- **No Test Runner:** No Jest, Vitest, or test script in package.json
- **Linting Only:** eslint is configured but no testing tools

### Test Infrastructure Gaps
1. Missing unit test framework (Jest/Vitest)
2. Missing E2E test framework (Playwright/Cypress)
3. Missing integration test setup
4. No test database fixtures
5. No mock Google Gemini API setup
6. No mock Stripe API setup
7. No test coverage reporting

---

## 11. Critical Paths Requiring Tests

### High-Priority (Core Functionality)
1. **Image Generation Pipeline**
   - Valid image → Generation → Credit deduction
   - Invalid image → Error handling
   - Safety filters triggering
   - Quota limits

2. **Authentication Flow**
   - Sign-in → Profile load → Session state
   - Session expiry + refresh
   - Unauthorized errors

3. **Credit System**
   - Sufficient credits check → Allow generation
   - Insufficient credits check → 402 response
   - Credit deduction after successful generation
   - Fallback credit refresh

4. **Payment Processing**
   - Checkout session creation
   - Webhook signature verification
   - Idempotent credit addition
   - Database transaction atomicity

5. **File Upload**
   - Format validation (MIME types)
   - Size validation (<10MB)
   - Error messages for invalid files

### Medium-Priority (Integration)
6. Stripe integration end-to-end
7. Supabase auth + profile sync
8. Gemini API error handling (quota, safety)
9. Credit expiration/management
10. Settings and user preferences

### Low-Priority (UI/UX)
11. Component rendering
12. Navigation flow
13. Error screen display
14. Loading states
15. Responsive design

---

## 12. Build & Deployment Setup

### Build Process
```bash
npm run build
# → Next.js compilation
# → Static optimization
# → API route bundling
```

### Development Server
```bash
npm run dev
# → Next.js dev server with Turbopack
# → Hot reload on changes
# → localhost:3000
```

### Production Server
```bash
npm start
# → Optimized production bundle
# → Server-side rendering
# → Edge functions (Vercel)
```

### Deployment
- **Platform:** Vercel (automatic from git push)
- **Runtime:** Node.js 22+
- **Build Output:** .next directory
- **Environment:** Managed in Vercel dashboard
- **Database:** Supabase (PostgreSQL, hosted)
- **CDN:** Vercel Edge Network

### CI/CD
- **Git:** GitHub repo integration
- **Deployment Trigger:** Push to main branch
- **Auto-scaling:** Vercel serverless functions
- **Monitoring:** Vercel Analytics + custom logging

---

## 13. Architecture Strengths & Weaknesses

### Strengths ✅
1. **Full-stack integration:** Next.js handles frontend + API in one framework
2. **Type-safe potential:** Using JavaScript but could add TypeScript
3. **Security-conscious:** Headers, PII redaction, webhook verification
4. **Mobile-optimized:** Canvas API for camera, responsive design
5. **Scalable architecture:** Serverless functions, edge computing
6. **Good error handling:** Multiple error types with specific recovery
7. **Payment integration:** Stripe webhooks with idempotent processing
8. **Real-time features:** Supabase auth listener, credit updates
9. **Production-ready:** Logging, analytics, security headers
10. **Well-documented:** Code comments, types, API docs

### Weaknesses ⚠️
1. **No automated tests:** Zero test coverage, all manual testing
2. **JavaScript only:** No TypeScript for type safety
3. **Single codebase:** Monolithic structure (no separation of concerns)
4. **Limited error recovery:** Some edge cases may not be covered
5. **No API versioning:** Future breaking changes could break clients
6. **No database migrations:** Schema changes require manual SQL
7. **Hardcoded constants:** Colors, sizes, timeouts scattered in code
8. **No rate limiting:** Only credit-based limiting (could still spam)
9. **No caching strategy:** Every generation calls Gemini (could batch)
10. **Limited logging in prod:** Redaction may hide important errors

---

## 14. Recommended Testing Strategy

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Jest + testing library
- [ ] Create test utilities + fixtures
- [ ] Mock Supabase client
- [ ] Mock Google Gemini API
- [ ] Mock Stripe API

### Phase 2: Unit Tests (Weeks 3-4)
- [ ] File validation utility
- [ ] Logger (sanitization)
- [ ] Credit packages constant
- [ ] Design tokens
- [ ] Date/time utilities

### Phase 3: API Route Tests (Weeks 5-6)
- [ ] GET /api/health
- [ ] POST /api/generate-headshot (success + errors)
- [ ] POST /api/checkout (valid + invalid price)
- [ ] POST /api/webhooks/stripe (signature + idempotency)
- [ ] GET /api/credit-packages

### Phase 4: Integration Tests (Weeks 7-8)
- [ ] Full image generation flow (with mocked Gemini)
- [ ] Full payment flow (with mocked Stripe)
- [ ] Auth flow (with mocked Supabase)
- [ ] Credit deduction + update

### Phase 5: E2E Tests (Weeks 9-10)
- [ ] User sign-in → capture → generate
- [ ] User purchase → credits applied
- [ ] Error recovery flows
- [ ] Mobile camera permissions

### Phase 6: Performance & Security (Weeks 11-12)
- [ ] Load testing (concurrent users)
- [ ] Quota handling under stress
- [ ] Security header validation
- [ ] PII redaction verification
- [ ] Webhook signature verification

---

## 15. Key Metrics for Test Coverage

### Target Coverage Goals
```
Statements: 80%+
Branches: 75%+
Functions: 80%+
Lines: 80%+
```

### Critical Paths (must be 100%)
- Image generation API
- Payment webhook handler
- Credit deduction logic
- Authentication checks
- File validation

### Coverage Report Tool
- Jest built-in coverage
- Codecov/Coveralls integration
- Github PR comments with coverage delta

---

## 16. Testing Challenges & Solutions

| Challenge | Impact | Solution |
|-----------|--------|----------|
| External APIs (Gemini, Stripe, Supabase) | Can't test real calls in CI | Mock libraries + fixtures |
| Media API (camera, file upload) | Browser-specific behavior | jsdom + user-event simulation |
| Async race conditions | Hard to reproduce reliably | Controlled time advancing (jest.useFakeTimers) |
| Canvas API | Can't easily assert image output | Mock Canvas, test base64 format |
| WebSocket connections | Supabase auth realtime | Mock @supabase/ssr package |
| Webhook verification | Need Stripe secret key | Test with known good signatures |
| Database state | Tests need isolation | Separate test DB or fixtures |

---

## Summary

**Morpheo** is a production-ready full-stack Next.js application with:
- **Frontend:** React 19, Tailwind CSS, responsive mobile-first design
- **Backend:** Next.js API routes, Google Gemini AI, Supabase auth/db, Stripe payments
- **Database:** PostgreSQL (Supabase) with user profiles, credits, transactions
- **Deployment:** Vercel edge functions, serverless architecture
- **Security:** OAuth, PII redaction, webhook verification, security headers
- **Features:** Camera capture, photo upload, AI generation, payment system, credit management
- **Status:** Live at https://morpheo-phi.vercel.app/ (Phase 2.1 complete)

**Critical Testing Gaps:**
- Zero unit test coverage
- No E2E test suite
- No API integration tests
- Manual testing only

**Recommended Action:**
Implement phased testing strategy starting with unit tests (utilities) → API tests (core business logic) → integration tests → E2E (user flows) → Performance tests. Target 80%+ coverage for main flows, 100% for critical paths.
