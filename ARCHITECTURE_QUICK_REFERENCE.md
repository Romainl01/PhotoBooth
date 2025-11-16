# MORPHEO - Architecture Quick Reference

> **📖 Documentation Guide:**
> - **ARCHITECTURE_AND_TEST_PLAN.md** - Complete technical reference (30 min read)
> - **This file** - Quick lookup during coding (< 5 min read) ⚡
> - **TEST_IMPLEMENTATION_PLAN.md** - Active test implementation with step-by-step guide

---

## 1. What Type of Application?
**Full-Stack Web Application (SPA with Backend APIs)**
- Frontend: React 19 + Next.js 15 App Router
- Backend: Serverless API routes + external services
- Deployment: Vercel (Edge + Serverless)
- Database: Supabase PostgreSQL
- Type: Mobile-first, progressive web app

## 2. Frameworks & Languages
| Layer | Framework/Language | Version |
|-------|-------------------|---------|
| **Runtime** | Node.js | 22+ |
| **Frontend Framework** | Next.js | 15.5.5 |
| **UI Library** | React | 19.1.0 |
| **Styling** | Tailwind CSS | 3.4.18 |
| **Language** | JavaScript (ES6) | Native |
| **Backend Framework** | Next.js API Routes | 15.5.5 |
| **Auth** | Supabase Auth | 2.80.0 |
| **Database** | PostgreSQL (Supabase) | Latest |
| **Payments** | Stripe | 19.3.0 |
| **AI** | Google Gemini 2.5 Flash | Latest |

## 3. Project Structure Overview
```
nextjs-app/src/
├── app/                    [Pages + API routes]
│   ├── page.js            [Main home page (450 lines)]
│   ├── layout.js          [Root layout]
│   ├── api/               [5 endpoints]
│   │   ├── health/
│   │   ├── generate-headshot/     [Core AI feature]
│   │   ├── checkout/              [Stripe payments]
│   │   ├── credit-packages/       [Billing]
│   │   └── webhooks/stripe/       [Payment webhook]
│   ├── auth/callback/     [OAuth redirect]
│   └── sign-in/           [Auth UI]
│
├── components/            [React components]
│   ├── screens/           [Full-page components (6)]
│   ├── ui/                [Reusable UI (10+)]
│   ├── icons/             [SVG icons (11)]
│   ├── auth/              [Auth screens (5)]
│   ├── modals/            [Overlays (2)]
│   └── grain/             [Effects (2)]
│
├── contexts/              [Global state]
│   └── UserContext.jsx    [Auth + credits (450 lines)]
│
├── lib/                   [Utilities]
│   ├── supabase/          [DB client (3 files)]
│   ├── fileValidation.js  [Upload checks]
│   ├── logger.js          [Production logging]
│   ├── creditPackages.js  [Billing config]
│   └── watermark.js       [Image branding]
│
└── constants/             [Static data]
    ├── filters.js         [13 filter names]
    ├── stylePrompts.js    [AI prompts]
    └── loadingMessages.js [UI text]
```

## 4. Main Features & Modules
| # | Feature | Status | Files | Key Tech |
|---|---------|--------|-------|----------|
| 1 | **Live Camera Capture** | ✅ Live | CameraScreen.jsx | MediaDevices API, Canvas |
| 2 | **Photo Upload** | ✅ Live | fileValidation.js | File API, MIME types |
| 3 | **AI Generation** | ✅ Live | generate-headshot/route.js | Google Gemini 2.5 Flash |
| 4 | **Authentication** | ✅ Live | UserContext.jsx | Supabase Auth, OAuth |
| 5 | **Credit System** | ✅ Live | creditPackages.js | PostgreSQL, logic |
| 6 | **Payment Processing** | ✅ Live | checkout + webhook | Stripe, HMAC verification |
| 7 | **Share/Download** | ✅ Live | ResultScreen.jsx | Web Share API, Canvas |
| 8 | **13 Filters** | ✅ Live | constants/*.js | AI prompts, carousel |
| 9 | **Error Handling** | ✅ Live | 5 error screens | Try/catch, fallbacks |
| 10 | **Loading States** | ✅ Live | Loader.jsx | Spinner, messages |
| 11 | **Analytics** | ✅ Live | logger.js | Vercel Analytics |
| 12 | **Design System** | ✅ Live | tailwind.config.js | Tokens, themes |

## 5. Existing Tests & Infrastructure
- **Unit Tests:** NONE (0%)
- **E2E Tests:** NONE (0%)
- **Integration Tests:** NONE (0%)
- **Test Framework:** NOT INSTALLED
- **Coverage:** 0%
- **Status:** Manual testing only

## 6. Tech Stack at a Glance
```
Frontend:
├── React 19 (UI)
├── Next.js 15 (Framework)
├── Tailwind CSS (Styling)
├── Canvas API (Image capture)
├── MediaDevices API (Camera)
└── Web Share API (Social sharing)

Backend:
├── Next.js API Routes (Serverless)
├── Supabase (Database + Auth)
├── Google Gemini 2.5 Flash (AI)
├── Stripe (Payments)
└── Vercel Analytics (Monitoring)

Database:
├── PostgreSQL (Supabase)
├── Tables: profiles, credit_transactions, credit_packages
└── Auth: Supabase Auth (Google OAuth)

External Services:
├── Google Cloud (Gemini API key)
├── Stripe (Live + Test keys)
├── Supabase (Hosted DB)
└── Vercel (Hosting)
```

## 7. Critical User Flows

### Flow A: Sign In (First Time)
```
Load / → No session → Redirect /sign-in 
→ Click Google Sign In → OAuth flow 
→ /auth/callback?code=... → Auto exchange 
→ Redirect / → Session exists 
→ Fetch profile (with retry) → Show home
```

### Flow B: Capture & Generate
```
Camera ready → Click capture/upload 
→ Validate image (format, size) 
→ Check credits → POST /api/generate-headshot 
→ Auth check (401) → Credit check (402) 
→ Gemini API call → Get base64 image 
→ Update credits → Show result
```

### Flow C: Buy Credits
```
Click PaywallModal → Select package 
→ POST /api/checkout → Stripe session 
→ Redirect to checkout → User pays 
→ Stripe webhook received → Verify signature 
→ Update profile.credits → Return 200 
→ Frontend polls refreshCredits() 
→ Credits appear in UI
```

### Flow D: Error Recovery
```
Generation fails → Show GenericError screen 
→ Retry button keeps image in memory 
→ Same generation flow → Success or fail again
```

## 8. Security Measures
✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
✅ OAuth 2.0 (Google)
✅ Session cookies with httpOnly flag
✅ Webhook signature verification (HMAC-SHA256)
✅ PII redaction in production logs
✅ Idempotent payment processing
✅ Credit-based rate limiting (natural)
✅ Input validation (file formats, sizes)
✅ Database query timeouts
✅ API error responses (401, 402, 503)

## 9. Build & Deployment
```
Local Dev:        npm run dev (Turbopack)
Production:       npm run build → npm start
Deployment:       Vercel (automatic from git)
Runtime:          Node.js 22+
Database:         Supabase (hosted)
Monitoring:       Vercel Analytics
```

## 10. Architecture Strengths
✅ Full-stack in one framework (Next.js)
✅ Security-conscious design
✅ Mobile-first responsive UI
✅ Good error handling (5+ error types)
✅ Scalable serverless architecture
✅ Production-ready logging
✅ Well-documented code
✅ Real-time state management
✅ Payment integration
✅ Proper authentication flow

## 11. Architecture Weaknesses
❌ NO automated tests (critical gap)
❌ No TypeScript (no type safety)
❌ No API versioning
❌ Limited error recovery for some cases
❌ No database migrations tool
❌ No caching strategy
❌ Hardcoded constants scattered
❌ No request rate limiting
❌ Monolithic structure

## 12. Critical Gaps for Testing
1. **Framework:** No Jest/Vitest setup
2. **Mocking:** No mock Gemini, Stripe, Supabase
3. **Fixtures:** No test data or fixtures
4. **Coverage:** 0% coverage
5. **Integration:** No test database
6. **E2E:** No Playwright/Cypress
7. **CI/CD:** No automated test pipeline

## 13. Files to Focus on for Testing
```
HIGHEST PRIORITY (Business Logic):
├── src/app/api/generate-headshot/route.js     [AI generation]
├── src/app/api/webhooks/stripe/route.js       [Payments]
├── src/contexts/UserContext.jsx               [Auth + state]
├── src/lib/fileValidation.js                  [File checks]
└── src/lib/logger.js                          [Logging]

MEDIUM PRIORITY (Features):
├── src/app/api/checkout/route.js              [Checkout]
├── src/app/api/credit-packages/route.js       [Billing]
├── src/app/page.js                            [Main flow]
└── src/components/screens/*.jsx               [Screens]

LOW PRIORITY (UI):
├── src/components/ui/*.jsx                    [Components]
├── src/components/icons/*.jsx                 [Icons]
└── src/constants/*.js                         [Static data]
```

## 14. Recommended Test Plan (Summary)
```
Phase 1: Setup (Week 1)
├── Jest + testing-library
├── Mock libraries
└── Test utilities

Phase 2: Unit Tests (Week 2-3)
├── Validation utilities
├── Logger (PII redaction)
├── Constants/config
└── Hooks

Phase 3: API Tests (Week 4-5)
├── POST /api/generate-headshot
├── POST /api/webhooks/stripe
├── POST /api/checkout
├── GET /api/credit-packages
└── GET /api/health

Phase 4: Integration Tests (Week 6-7)
├── Full generation flow
├── Full payment flow
├── Auth flow
└── Error scenarios

Phase 5: E2E Tests (Week 8-9)
├── User sign-in
├── Capture + generate
├── Purchase credits
└── Error recovery

Phase 6: Performance (Week 10)
├── Load testing
├── Concurrent users
└── API timing
```

## 15. What's Production-Ready?
✅ **YES:** Live at https://morpheo-phi.vercel.app/
✅ **YES:** All 12 features working
✅ **YES:** Security headers in place
✅ **YES:** Error handling implemented
✅ **YES:** Logging in production
✅ **YES:** Payment system live
✅ **YES:** Database live with data

❌ **NOT:** Automated tests (0%)
❌ **NOT:** Type safety (JavaScript only)
❌ **NOT:** Test coverage
❌ **NOT:** Integration tests
❌ **NOT:** E2E test suite

---

## Quick File Size Summary
```
src/app/page.js               450 lines    [Complex state management]
src/contexts/UserContext.jsx  450 lines    [Global state + retry logic]
src/app/api/webhooks/stripe   200 lines    [Payment webhook]
src/app/api/generate-headshot 200 lines    [AI generation + error handling]
src/components/screens/       150+ lines   [Each main screen]
src/lib/logger.js             250 lines    [Production logging]
Total Source:                 ~2,000 lines
```

---

**QUICK ANSWER:** 
- **Type:** Full-stack Next.js SPA
- **Tech:** React 19, Next.js 15, Tailwind, Supabase, Stripe, Google Gemini
- **Status:** Production-ready (live), feature-complete
- **Tests:** ZERO (needs testing infrastructure)
- **Security:** Good (headers, auth, webhooks)
- **Scalability:** Good (serverless, edge functions)
- **Best Practices:** Mostly followed (with exceptions)

**Full 1,000+ line analysis saved to:** ARCHITECTURE_AND_TEST_PLAN.md
