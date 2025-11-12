# 🚀 PRODUCTION DEPLOYMENT GUIDE - MORPHEO 2.0

**Date:** 2025-11-12
**Production URL:** https://morpheo-phi.vercel.app/

---

## ✅ STEP 1: UPDATE SUPABASE DATABASE

Run this SQL in your Supabase SQL Editor to add production price IDs:

```sql
-- Add production price IDs alongside test price IDs
-- This allows both local (test) and production (live) to work

-- Add production Starter package (10 credits, €2.99)
INSERT INTO credit_packages (
  name,
  emoji,
  credits,
  price_cents,
  currency,
  stripe_price_id,
  display_order,
  active
) VALUES (
  'Starter',
  '💫',
  10,
  299,
  'EUR',
  'price_1SSK6AK9cHL77TyOXf1pToOD',
  1,
  true
);

-- Add production Creator package (30 credits, €6.99)
INSERT INTO credit_packages (
  name,
  emoji,
  credits,
  price_cents,
  currency,
  stripe_price_id,
  display_order,
  active
) VALUES (
  'Creator',
  '🎨',
  30,
  699,
  'EUR',
  'price_1SSK7OK9cHL77TyOa4DlnClC',
  2,
  true
);

-- Add production Pro package (100 credits, €17.99)
INSERT INTO credit_packages (
  name,
  emoji,
  credits,
  price_cents,
  currency,
  stripe_price_id,
  display_order,
  active
) VALUES (
  'Pro',
  '🏆',
  100,
  1799,
  'EUR',
  'price_1SSK8ZK9cHL77TyOBlBv6ihp',
  3,
  true
);

-- Verify both test and production price IDs exist
SELECT id, name, credits, price_cents, stripe_price_id, active
FROM credit_packages
ORDER BY credits ASC;
```

**Expected Result:** You should see 6 rows (3 test + 3 production price IDs)

---

## 🪝 STEP 2: CREATE PRODUCTION WEBHOOK IN STRIPE

### 2.1 Go to Stripe Dashboard
1. Open: https://dashboard.stripe.com/webhooks
2. Make sure you're in **LIVE MODE** (toggle in top-right corner)

### 2.2 Add Webhook Endpoint
1. Click **"Add endpoint"**
2. **Endpoint URL:** `https://morpheo-phi.vercel.app/api/webhooks/stripe`
3. **Description:** "Morpheo Production - Credit Purchase Webhooks"
4. Click **"Select events"**

### 2.3 Select Events to Listen For
**REQUIRED EVENTS:**
- ✅ `checkout.session.completed` (when payment succeeds)
- ✅ `payment_intent.payment_failed` (when payment fails - optional but recommended)

Click **"Add events"** → Click **"Add endpoint"**

### 2.4 Get Webhook Signing Secret
1. After creating the endpoint, you'll see the webhook details page
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)
4. **SAVE THIS** - you'll need it for Vercel environment variables

---

## ⚙️ STEP 3: CONFIGURE VERCEL ENVIRONMENT VARIABLES

### 3.1 Go to Vercel Project Settings
1. Open: https://vercel.com/dashboard
2. Select your project: **NanoBananaTutorial** (or whatever your project is called)
3. Go to **Settings** → **Environment Variables**

### 3.2 Add/Update These Variables

**CRITICAL: Set these for the "Production" environment!**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_API_KEY` | `<your_google_api_key>` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `<your_supabase_url>` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<your_supabase_anon_key>` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your_supabase_service_role_key>` | Production |
| `STRIPE_SECRET_KEY` | `<your_stripe_live_secret_key>` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `<your_stripe_live_publishable_key>` | Production |
| `STRIPE_WEBHOOK_SECRET` | `<your_stripe_webhook_secret>` (from Step 2.4) | Production |
| `NEXT_PUBLIC_APP_URL` | `<your_production_url>` | Production |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` | `<your_starter_price_id>` | Production |
| `NEXT_PUBLIC_STRIPE_PRICE_CREATOR` | `<your_creator_price_id>` | Production |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | `<your_pro_price_id>` | Production |

**⚠️ IMPORTANT:**
- Make sure "Production" is selected in the environment dropdown
- Do NOT add these to "Preview" or "Development" environments
- Click "Save" after adding each variable

---

## 🧪 STEP 4: PRE-DEPLOYMENT TESTING

### 4.1 Test Locally First
Before deploying, verify your local environment still works:

```bash
# Make sure dev server is stopped
# Then restart it to pick up new env variables
npm run dev
```

**Test Checklist:**
- [ ] App loads without errors
- [ ] Can sign in with Google
- [ ] Paywall modal shows 3 packages with correct prices
- [ ] Can click "Buy Now" (should redirect to Stripe test checkout)
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Credits added after payment

**If any test fails, DO NOT DEPLOY. Fix issues first.**

---

## 🚀 STEP 5: DEPLOY TO PRODUCTION

### 5.1 Commit Changes
```bash
git add .
git commit -m "feat: add environment-based Stripe price configuration for production

- Move Stripe price IDs to environment variables
- Add validation for required env vars
- Support both test and production modes without code changes
- Update Supabase database with production price IDs

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push to Vercel
```bash
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your app
3. Deploy to production
4. Use the production environment variables you configured

### 5.3 Monitor Deployment
1. Watch the deployment in Vercel dashboard
2. Wait for "Ready" status
3. Check deployment logs for any errors

---

## ✅ STEP 6: POST-DEPLOYMENT VERIFICATION

### 6.1 Test Production App
Visit: https://morpheo-phi.vercel.app/

**Critical Tests:**
- [ ] App loads without errors
- [ ] Sign in with Google account
- [ ] Generate 1 image (verify credit deducted)
- [ ] Open Paywall modal
- [ ] Verify 3 packages shown with correct prices (€2.99, €6.99, €17.99)
- [ ] Click "Buy Now" on Starter package
- [ ] **DO NOT USE TEST CARD** - Use a real card or cancel
- [ ] If you complete payment, verify credits added within 10 seconds

### 6.2 Test Webhook Delivery
1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click on your production webhook endpoint
3. Check "Events" tab
4. Look for recent `checkout.session.completed` events
5. Status should be "Succeeded" (green checkmark)

**If webhook shows "Failed":**
- Check Vercel logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook URL is `https://morpheo-phi.vercel.app/api/webhooks/stripe`

### 6.3 Monitor Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by "Production" environment
3. Look for:
   - `[Checkout] Creating session for user...` (when user clicks Buy Now)
   - `[Stripe Webhook] Event received: checkout.session.completed`
   - `[Stripe Webhook] Successfully added X credits to user...`

**Red flags to watch for:**
- ❌ `Missing required environment variables`
- ❌ `Invalid price ID`
- ❌ `Webhook signature verification failed`
- ❌ `Failed to add credits`

---

## 🔐 SECURITY CHECKLIST

Before going live with real customers:

- [ ] Webhook secret is set correctly (not test secret)
- [ ] Live Stripe keys are used (not test keys)
- [ ] Test keys are ONLY in `.env.local` (never committed to git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Production price IDs match Stripe dashboard
- [ ] Webhook endpoint is HTTPS (not HTTP)
- [ ] Supabase RLS policies are enabled
- [ ] Service role key is secure

---

## 🎯 ROLLBACK PLAN

If production has critical issues:

### Immediate Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"
4. Production will instantly roll back

### Emergency Mode (Stripe)
1. Go to Stripe Dashboard → Products
2. Set all products to "Inactive"
3. Users won't be able to purchase credits (but app still works)

---

## 📊 MONITORING SCHEDULE

**First 24 Hours:**
- Check Vercel logs every 2 hours
- Check Stripe webhook delivery every 4 hours
- Monitor user reports/emails

**First Week:**
- Daily log review
- Daily webhook success rate check
- Weekly financial reconciliation (Stripe revenue vs. Supabase credit_transactions)

---

## 🐛 TROUBLESHOOTING

### Issue: "Invalid price ID" error
**Cause:** Price ID not in database
**Fix:** Run Step 1 SQL again in Supabase

### Issue: "Missing required environment variables"
**Cause:** Vercel env vars not set
**Fix:** Re-run Step 3, make sure "Production" is selected

### Issue: Webhook shows "Failed" in Stripe
**Cause:** Wrong webhook secret or URL
**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe dashboard
2. Verify webhook URL is `https://morpheo-phi.vercel.app/api/webhooks/stripe`
3. Check Vercel logs for signature verification errors

### Issue: Credits not added after payment
**Cause:** Webhook not working or RPC failure
**Fix:**
1. Check Stripe webhook events - did it send?
2. Check Vercel logs - did webhook handler execute?
3. Check Supabase logs - did RPC execute?
4. Use [PAYMENT_RECONCILIATION.md](docs/PAYMENT_RECONCILIATION.md) for manual fix

### Issue: User paid but credits didn't appear
**Cause:** Webhook delay or failure
**Fix:**
1. Wait 30 seconds (webhooks can be delayed)
2. Check if user refreshed page (credits update on refresh)
3. Follow [PAYMENT_RECONCILIATION.md](docs/PAYMENT_RECONCILIATION.md)

---

## 📝 POST-DEPLOYMENT TASKS

After successful deployment:

- [ ] Update documentation with production URLs
- [ ] Train team on webhook monitoring
- [ ] Set up Stripe payment alerts (email notifications)
- [ ] Schedule first financial reconciliation
- [ ] Add production metrics to monitoring dashboard
- [ ] Document any deployment issues encountered

---

## ✨ SUCCESS CRITERIA

Production is considered "stable" when:

- ✅ 10+ successful payments processed
- ✅ Webhook success rate > 99%
- ✅ Zero critical errors in Vercel logs
- ✅ Zero manual payment reconciliations needed
- ✅ Average credit delivery time < 5 seconds

---

**Deployment Status:** ⏳ READY TO DEPLOY
**Next Step:** Execute Step 1 (SQL in Supabase)
**Estimated Time:** 30-45 minutes

**Author:** Claude Code (Sonnet 4.5)
**Generated:** 2025-11-12
