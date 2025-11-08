# Morpheo 2.0 Implementation Plan

## Overview
Transform Morpheo from stateless photo booth → authenticated SaaS with credits-based monetization.

**Core V2 Features:**
- Google SSO authentication (Supabase)
- Temporary image storage (1-hour TTL)
- Free tier: 5 images lifetime
- Credits-based paywall
- Automated image cleanup

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

### Phase 2: Credits & Paywall (Week 2)
**Goal:** Track usage, block at 0 credits, show paywall.

**Recommended Pre-Phase Setup:**
- **Install Supabase MCP Server** (optional but helpful)
  - Enables AI assistant to auto-generate TypeScript types from schema
  - Allows real-time database queries for debugging
  - Reduces manual copy-paste of schema definitions
  - See [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp)
  - Token cost: ~500-1000 tokens overhead, but saves tokens on schema iterations

1. **Credits Logic**
   - Add credits display in UI header
   - Check credits before API call in `/api/generate-headshot`
   - Deduct 1 credit on successful generation
   - Log transaction in `credit_transactions`

2. **Usage Stats Tracking** (NEW - for sign-in page)
   - Create `generation_stats` table (tracks all API requests)
   - Update `/api/generate-headshot` to log every generation attempt
   - Log user_id, filter_name, success/failure, timestamp
   - Create Postgres function `get_weekly_photo_count()` for fast queries
   - Update sign-in page to fetch weekly count (replaces hardcoded "1,576")
   - Cache stats query (5-minute TTL) to reduce database load

3. **Paywall UI**
   - Modal/screen when credits = 0
   - Display credit packages (e.g., 10 for $5, 50 for $20, 100 for $35)
   - "Buy Credits" button → redirect to Stripe Checkout

4. **Stripe Integration**
   - Create Stripe account, get API keys
   - Create Products & Prices in Stripe Dashboard
   - Install `stripe` package
   - Create `/api/checkout` endpoint → Stripe Checkout Session
   - Create `/api/webhooks/stripe` for payment confirmation
   - Verify webhook signature, add credits on `checkout.session.completed`

**Gotchas:**
- ⚠️ Race condition: User generates while webhook pending → use optimistic locking
- ⚠️ Webhook failures: Implement retry logic + manual reconciliation UI
- ⚠️ Stripe test mode: Use test cards, separate test/prod keys
- ⚠️ Credits must be atomic transactions (use DB transactions)
- ⚠️ Users could spam API before credit deduction → add rate limiting (Upstash Redis)

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

## Questions to Answer Before Starting

1. **Credit pricing final?** (Adjust packages before Stripe setup)
2. **Watermark for paid users?** (Keep or remove?)
3. **Refund policy?** (None, or 24h unused credits?)
4. **Image expiry flexible?** (Fixed 1h or tiered: free=1h, paid=24h?)
5. **Email notifications?** (Expiry warnings? Purchase confirmations?)

---

**Estimated Development Time:** 3-4 weeks (1 developer, part-time)
**Recurring Costs:** $0/month (Supabase free tier) until scale hits limits
**One-Time Costs:** $0 (Stripe has no setup fees)
**First Revenue Goal:** 100 paying users × $10 avg = $1,000 MRR