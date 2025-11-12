# Stripe Integration Setup Guide

Complete guide for setting up Stripe payments in Morpheo 2.0.

---

## ✅ Quick Start Checklist

### Step 1: Database Setup (5 minutes)

1. **Open Supabase SQL Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. **Run the migration**:
   - Open `nextjs-app/scripts/database/setup-complete.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - ✅ Verify: You should see 3 credit packages returned

### Step 2: Environment Variables (2 minutes)

Ensure your `.env.local` has these variables:

```bash
# Stripe Keys (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Webhook Secret (from stripe listen command)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL  
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### Step 3: Stripe CLI Setup (10 minutes)

**Start your Next.js app:**
```bash
cd nextjs-app
npm run dev
```

**In a NEW terminal, forward webhooks:**
```bash
stripe listen --forward-to http://localhost:3003/api/webhooks/stripe
```

Copy the webhook signing secret and add to `.env.local`, then restart the dev server.

---

## 🧪 Testing

```bash
# Check database state
node scripts/debug/check-db-state.mjs

# Test webhook (optional)
node scripts/debug/test-webhook.mjs
```

See full testing steps and troubleshooting in the guide.
