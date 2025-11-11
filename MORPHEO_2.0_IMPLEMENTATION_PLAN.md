# Morpheo 2.0 Implementation Plan

## 🎯 Implementation Status

| Phase | Status | Completion Date | Notes |
|-------|--------|-----------------|-------|
| **Phase 1: Authentication** | ✅ Complete | 2025-01 | Google OAuth, middleware, sign-in UI |
| **Phase 2A: Credits & UI** | ✅ Complete | 2025-01 | Database, context, UI components (no Stripe) |
| **Phase 2B: Stripe Integration** | ⏳ Pending | - | Payment flow (redirect vs in-app), webhooks |
| **Phase 2C: Showcase Enhancements** | ⏳ Pending | - | Images, audio, skeuomorphic elements |
| **Phase 3: Image Storage** | ⏳ Pending | - | Supabase storage, cleanup cron |
| **Phase 4: Polish** | ⏳ Pending | - | Error handling, monitoring, testing |

## Overview
Transform Morpheo from stateless photo booth → authenticated SaaS with credits-based monetization.

**Core V2 Features:**
- ✅ Google SSO authentication (Supabase)
- 🚧 Credits-based paywall
- ⏳ Temporary image storage (1-hour TTL)
- Free tier: 5 images lifetime
- ⏳ Automated image cleanup

---

## Tech Stack Additions

| Component | Solution | Rationale |
|-----------|----------|-----------|
| **Auth** | Supabase Auth (Google OAuth) | Free tier, built-in OAuth, session mgmt |
| **Database** | Supabase PostgreSQL | Free tier 500MB, integrated with auth |
| **File Storage** | Supabase Storage | Free tier 1GB, auto-expiry policies |
| **Payments** | Stripe Checkout | Industry standard, one-time purchases, webhooks |
| **Cron Jobs** | Vercel Cron (hobby free) | Image cleanup automation |

**Alternative Payment Options:**
- **Lemon Squeezy**: Merchant of record (handles tax/compliance), simpler than Stripe
- **Paddle**: Similar to Lemon Squeezy, good for SaaS

**Recommendation:** Start with Stripe (most flexible, best docs, easier debugging).

---

## Database Schema

### Tables

```sql
-- Users (extended from Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 5,  -- Free tier starts with 5
  total_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Images
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  expires_at TIMESTAMPTZ NOT NULL,  -- NOW() + 1 hour
  downloaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- Positive = purchase, Negative = usage
  transaction_type TEXT NOT NULL,  -- 'purchase', 'generation', 'refund'
  stripe_payment_id TEXT,  -- For purchase reconciliation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Products (for reference)
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,  -- e.g., "Starter Pack"
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,  -- USD cents
  stripe_price_id TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Statistics (NEW - for sign-in page stats)
-- NOTE: Gemini API does not provide aggregate usage stats
-- We track all generations here to display "X photos created this week"
CREATE TABLE generation_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL for anonymous pre-auth generations
  filter_name TEXT NOT NULL,
  success BOOLEAN DEFAULT TRUE,  -- Track failures too
  error_message TEXT,  -- For debugging failed generations
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast weekly stats query
CREATE INDEX idx_generation_stats_created_at ON generation_stats(created_at DESC);

-- Function to get photos created this week
CREATE OR REPLACE FUNCTION get_weekly_photo_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM generation_stats
  WHERE success = TRUE
    AND created_at >= DATE_TRUNC('week', NOW());
$$ LANGUAGE SQL STABLE;
```

---

## Macro Implementation Steps

### Phase 1: Authentication Setup (Week 1)
**Goal:** Users can sign in with Google, sessions persist.

1. **Supabase Project Setup**
   - Create project (free tier)
   - Enable Google OAuth provider
   - Configure redirect URLs (localhost + production)
   - Copy env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Frontend Auth Flow**
   - Install `@supabase/ssr` for Next.js 15
   - Create middleware for protected routes
   - Add sign-in screen (pre-camera access)
   - Implement `signInWithOAuth({ provider: 'google' })`
   - Add sign-out button in UI
   - Handle session state globally (Context or Zustand)

3. **Database Setup**
   - Create `profiles` table with RLS policies
   - Trigger: auto-create profile on auth.users insert
   - Set up Row Level Security (users can only read/write own data)

**Gotchas:**
- ⚠️ Next.js 15 requires `@supabase/ssr` (not `@supabase/auth-helpers-nextjs`)
- ⚠️ RLS policies must be configured or users see empty data
- ⚠️ Google OAuth requires verified domain in production (easy in Supabase)
- ⚠️ Session cookies need proper middleware setup for SSR

---

### Phase 2A: Credits System & UI (Week 2) ✅ **DECIDED: No Stripe yet**
**Goal:** Track usage, block at 0 credits, show paywall (mock payment for now).

**Implementation Approach:**
- Build full credits system WITHOUT Stripe integration
- Mock "Buy Credits" flow (button shows placeholder/coming soon)
- Focus on atomic credit deduction and UI polish
- Add Stripe in Phase 2B once core flow is validated

**Key Decisions Made:**
- ✅ **State Management:** React Context (native, zero dependencies)
- ✅ **Watermarks:** Keep for ALL users (free + paid) for branding
- ✅ **Contact Button:** Links to LinkedIn (already implemented)
- ⏳ **Credit Pricing:** TBD when implementing Stripe

1. **Database Schema**
   - `profiles` table with `credits` column (default 5)
   - `credit_transactions` table for audit log
   - Database trigger to auto-create profile on signup
   - Atomic `deduct_credit()` RPC function with race condition protection

2. **Global State Management**
   - Create `UserContext` with React Context API
   - Manages: user session, profile data, credit count
   - Provides `refreshCredits()` for manual refresh after purchases
   - Integrates with Supabase auth listener for real-time updates

3. **UI Components**
   - **CreditBadge:** Floating tooltip with liquid glass effect
     - Color-coded: Green (>10), Yellow (3-10), Red (≤3)
     - Text: "5 free images left" vs "X credits left"
   - **PaywallModal:** Full-screen overlay when credits = 0
     - Copy: "Don't stop now! Your best picture might be next"
     - CTA: "Add credits" (mock for now)
   - **SettingsDrawer:** Slide-up panel with user info
     - Sections: User (credits + buy button), About, Account (logout)

4. **API Protection**
   - Add auth check to `/api/generate-headshot`
   - Check credits BEFORE calling Gemini (save API costs)
   - Deduct credit AFTER successful generation (atomic)
   - Return 402 status code when insufficient credits
   - Log all transactions for reconciliation

5. **Camera Screen Integration**
   - Display CreditBadge in top-right corner
   - Block capture if credits < 1
   - Show PaywallModal on insufficient credits
   - Settings icon opens SettingsDrawer

**Gotchas:**
- ⚠️ Race condition: Multiple rapid captures → use atomic DB function
- ⚠️ Deduct AFTER generation (not before) to avoid charging on failures
- ⚠️ Profile not loaded yet → add null checks everywhere
- ⚠️ Credit fraud: Database constraint `CHECK (credits >= 0)`

---

### Phase 2B: Stripe Integration (Week 3) ⏳ **DEFERRED**
**Goal:** Real payment flow with credit purchases.

**Blocked Until:** Phase 2A complete + credit pricing finalized

1. **Stripe Setup**
   - Create Stripe account, get API keys
   - Create Products & Prices in Stripe Dashboard
   - Install `stripe` package
   - Finalize credit packages (e.g., 10 for $2.99, 50 for $9.99, 100 for $14.99)

2. **Payment Flow Options**

   **Option A: Stripe Checkout (Redirect) - RECOMMENDED**
   - Pros: Faster implementation, PCI compliant out-of-box, mobile optimized
   - Cons: Leaves your site briefly, less brand control
   - Implementation:
     - Create `/api/checkout` endpoint → Stripe Checkout Session
     - Redirect user to Stripe-hosted page
     - User pays → redirected back to success/cancel URL
     - Webhook confirms payment → credits added

   **Option B: Stripe Payment Element (In-App)**
   - Pros: Full UI control, stays in Morpheo, supports Apple Pay/Google Pay
   - Cons: More frontend work, need to handle payment states
   - Implementation:
     - Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
     - Create custom checkout modal with Stripe Payment Element
     - Handle payment intents, confirmations, errors
     - Webhook confirms payment → credits added

   **Decision:** Start with **Option A** (faster, proven), upgrade to Option B later if needed.

3. **Credit Badge Click Flow**
   - Make CreditBadge clickable on CameraScreen
   - On click → open credit purchase modal/flow
   - Show credit packages with "Best Value" badge
   - Redirect to checkout (Option A) or show payment form (Option B)
   - After successful purchase → refresh credits, show success toast

4. **Reconciliation**
   - Implement webhook retry logic
   - Manual reconciliation UI for failed webhooks
   - Store `stripe_payment_id` in credit_transactions
   - Monitor Stripe dashboard vs database credits

**Gotchas:**
- ⚠️ Webhook failures: Implement idempotency keys
- ⚠️ Stripe test mode: Use test cards, separate test/prod keys
- ⚠️ Tax compliance: Enable Stripe Tax or use Lemon Squeezy
- ⚠️ Apple Pay requires HTTPS + verified domain (works on Vercel)
- ⚠️ Mobile Safari: Payment Element requires careful styling

---

### Phase 2C: Showcase & Branding Enhancements ⏳ **NEW**
**Goal:** Polish the app presentation with visual/audio elements.

1. **Showcase Media Assets**
   - Organize showcase images: `/public/showcase/mobile/` and `/public/showcase/desktop/`
   - Add hero images demonstrating app features
   - Screenshots of before/after transformations
   - Different filter styles showcased

2. **Audio Experience**
   - Add background music or sound effects (optional)
   - Consider: shutter sound on capture, success chime on generation
   - Use Web Audio API or HTML5 `<audio>` with user controls
   - Respect user preference: mute by default, toggle in settings

3. **Skeuomorphic Visual Elements**
   - Enhance existing skeumorphic buttons (already implemented in Phase 2A)
   - Add camera lens reflections, film grain textures
   - Polaroid-style result display option
   - Vintage camera UI theme elements
   - Consider: retro loading animation, film development effect

4. **Landing/Marketing Page** (Optional)
   - Before sign-in: showcase hero section with demo images
   - Feature highlights carousel
   - Social proof: "X photos created this week" stat
   - Pricing table preview

**Gotchas:**
- ⚠️ Audio autoplay: Browsers block it, need user interaction first
- ⚠️ Image file sizes: Optimize showcase images (WebP format, lazy loading)
- ⚠️ Skeuomorphic overload: Balance aesthetics vs. usability

---

### Phase 3: Image Storage (Week 3)
**Goal:** Save images temporarily, auto-delete after 1 hour.

1. **Supabase Storage Setup**
   - Create bucket: `generated-images` (private)
   - Set RLS policy: users can only read their own images
   - Configure bucket: no public access

2. **Save Images Flow**
   - After Gemini generates image → upload to Supabase Storage
   - Store record in `images` table with `expires_at = NOW() + 1 hour`
   - Return storage URL to frontend (signed URL, 1-hour expiry)
   - Display in ResultScreen with expiry countdown

3. **Image Cleanup**
   - Create `/api/cron/cleanup-images` endpoint
   - Vercel Cron: trigger every 15 minutes
   - Query `images` where `expires_at < NOW()`
   - Delete from Supabase Storage + database
   - Free tier limit: 1GB storage (monitor usage)

4. **User Gallery (Optional)**
   - Add "My Images" screen
   - Show images with expiry countdown
   - "Download" button → fetch signed URL

**Gotchas:**
- ⚠️ Free tier: 1GB storage, 2GB bandwidth/month → monitor closely
- ⚠️ Signed URLs expire → regenerate on each request
- ⚠️ Cron job failures → images linger → manual cleanup script needed
- ⚠️ Large images: Gemini returns PNG (can be 5-10MB) → monitor storage fast
- ⚠️ Vercel Cron free tier: 1 job, runs max every minute (15min interval OK)
- ⚠️ Users might not download before expiry → add email notification? (increases complexity)

---

### Phase 4: Polish & Edge Cases (Week 4)

1. **Error Handling**
   - Payment failed → clear UI feedback
   - Credit deduction failed → rollback generation
   - Storage upload failed → refund credit

2. **User Experience**
   - Loading states for auth/payments
   - Credit balance prominently displayed
   - Expiry countdown on images
   - "Download All" button (before expiry)

3. **Monitoring**
   - Supabase dashboard: track storage usage
   - Stripe dashboard: revenue tracking
   - Vercel logs: cron job health
   - Sentry/LogRocket: error tracking (optional)

4. **Testing**
   - Stripe test mode end-to-end
   - Edge case: user signs out mid-generation
   - Edge case: payment succeeds but webhook fails
   - Edge case: image cleanup during active download

---

## Critical Side Effects & Gotchas

### 🔴 High-Risk Issues

1. **Supabase Free Tier Limits**
   - 500MB database (images table can grow fast with metadata)
   - 1GB storage (PNG images ~5MB each = 200 images max)
   - 2GB bandwidth/month (downloads count against this)
   - **Mitigation:** Compress images server-side, monitor usage, upgrade if needed

2. **Payment Webhook Race Conditions**
   - User buys credits → webhook delayed → generation blocked
   - **Mitigation:** Optimistic credit grant (add credits immediately, verify later)
   - **Risk:** Fraud if user disputes payment after using credits

3. **Image Cleanup Failures**
   - Cron job fails → storage fills → hitting limits
   - **Mitigation:** Manual cleanup script, alerts on storage >80%

4. **Credit Fraud Vectors**
   - Multiple accounts with same Google OAuth
   - Referral abuse if you add referral system later
   - **Mitigation:** Track by email domain, limit free tier to verified emails

5. **Gemini API Rate Limits**
   - Free tier: 15 requests/minute (current v1.0 has no protection)
   - Paid tier: 1000 requests/minute
   - **Mitigation:** Add Upstash Redis rate limiting per user (already planned in v1.0)

### 🟡 Medium-Risk Issues

6. **Session Persistence**
   - User generates image, closes tab, loses result
   - **Mitigation:** Image gallery to revisit recent generations

7. **Storage URL Expiry**
   - User opens "My Images" after 1 hour → broken links
   - **Mitigation:** Show "Expired" badge, don't fetch signed URL

8. **Stripe Tax Compliance**
   - Selling digital goods requires tax collection in some regions
   - **Mitigation:** Enable Stripe Tax (automatic), or use Lemon Squeezy

9. **Google OAuth Quota**
   - Google Cloud free tier: 100 OAuth requests/day
   - **Mitigation:** Unlikely to hit with organic growth, monitor GCP quotas

### 🟢 Low-Risk Issues

10. **Watermark Removal**
    - Paid users might expect no watermark
    - **Decision:** Keep watermark for branding or remove for paid?

11. **Refund Policy**
    - User buys credits, immediately requests refund
    - **Mitigation:** Clear "no refunds" policy, or allow within 24h unused

12. **Image Quality**
    - Users complain 1-hour expiry too short
    - **Mitigation:** Offer "permanent storage" as premium tier later

---

## Recommended Credit Packages

| Package | Credits | Price | $/Credit | Hook |
|---------|---------|-------|----------|------|
| Starter | 10 | $2.99 | $0.299 | Impulse buy |
| Popular | 50 | $9.99 | $0.200 | Best value (33% off) |
| Pro | 100 | $14.99 | $0.150 | Power users (50% off) |

**Pricing Strategy:**
- Free tier: 5 images (enough to try all features)
- Starter: Low friction first purchase
- Popular: Highlighted as "best value"
- Pro: For serious users / content creators

---

## Implementation Order Summary

```
Week 1: Auth Setup
├── Supabase project + Google OAuth
├── profiles table + RLS
├── Sign-in/sign-out UI
└── Session management

Week 2: Credits & Payments
├── credits column + transactions table
├── Credit deduction in API
├── Paywall UI
├── Stripe Checkout integration
└── Webhook handler

Week 3: Image Storage
├── Supabase Storage bucket
├── Upload after generation
├── images table + expiry logic
├── Gallery UI
└── Cron cleanup job

Week 4: Polish
├── Error handling
├── Monitoring setup
├── Edge case testing
└── Production deployment
```

---

## Environment Variables Needed

```env
# Existing
GOOGLE_API_KEY=xxx  # Gemini AI

# New for v2.0
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # For admin operations

STRIPE_SECRET_KEY=sk_test_xxx  # Test mode first
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

CRON_SECRET=xxx  # Secure cron endpoint
```

---

## Migration Strategy (v1.0 → v2.0)

**Option 1: Hard Launch (Recommended for lean approach)**
- Deploy v2.0 as new version
- Old users: No migration needed (v1.0 was stateless)
- New users: Must sign in to use

**Option 2: Soft Launch**
- Keep v1.0 route `/legacy`
- v2.0 at `/` (requires auth)
- Allow users to choose

**Recommendation:** Hard launch. v1.0 users have no stored data to lose.

---

## Success Metrics to Track

1. **Conversion Rate:** Free users → paid users (target: 2-5%)
2. **Revenue per User:** Average credits purchased
3. **Image Downloads:** % images downloaded before expiry
4. **Storage Usage:** Ensure staying under 1GB
5. **API Costs:** Gemini API usage vs revenue

---

## Future Enhancements (Post-v2.0)

- **Subscription Model:** $9.99/month for unlimited generations
- **Image History:** Option to keep images >1 hour (paid feature)
- **Referral Program:** Give 5 credits for each referral
- **Custom Filters:** User-uploaded style references
- **Batch Processing:** Generate multiple images at once
- **Mobile App:** React Native wrapper

---

## Decisions Log

### ✅ Answered (Phase 2A)
1. **Watermark for paid users?** → **KEEP for all users** (branding strategy)
2. **State management library?** → **React Context** (native, zero dependencies)
3. **Stripe integration timing?** → **Phase 2B** (after core credits flow validated)
4. **Contact button destination?** → **LinkedIn** (already implemented)

### ⏳ Pending (Phase 2B/3/4)
1. **Credit pricing final?** → Decide before Stripe setup (e.g., 10/$2.99, 50/$9.99, 100/$14.99)
2. **Refund policy?** → None, or 24h unused credits?
3. **Image expiry flexible?** → Fixed 1h or tiered: free=1h, paid=24h?
4. **Email notifications?** → Expiry warnings? Purchase confirmations?

---

**Estimated Development Time:** 3-4 weeks (1 developer, part-time)
**Recurring Costs:** $0/month (Supabase free tier) until scale hits limits
**One-Time Costs:** $0 (Stripe has no setup fees)
**First Revenue Goal:** 100 paying users × $10 avg = $1,000 MRR