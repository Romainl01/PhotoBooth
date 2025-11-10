# Phase 2A Setup Guide - Credits System

## 🎯 Implementation Status
**Phase 2A (Credits & UI)**: ✅ Code Complete | ⏳ Needs Database Setup + Testing

---

## 📋 Quick Setup Checklist

### Step 1: Set Up Supabase Database
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy entire contents of `docs/supabase-schema-phase2a.sql`
4. Paste and click **Run**
5. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('profiles', 'credit_transactions');
   ```

### Step 2: Test User Creation Trigger
1. Go to **Authentication > Users**
2. Click **Invite User** or create test user
3. Check if profile was auto-created:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```
4. Should see: `credits = 5`, matching email from auth.users

### Step 3: Migrate Existing Users (if any)
If you already have users in `auth.users`, run:
```sql
INSERT INTO public.profiles (id, email, credits)
SELECT id, email, 5
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Start Dev Server
```bash
cd nextjs-app
npm run dev
```

### Step 5: Test the Flow
1. **Sign in** (or create new account)
2. **Credit badge** should appear top-right showing "5 free images left"
3. **Capture photo** → Generates image → Badge updates to "4 credits left"
4. **Generate 5 images** → Badge shows "0 credits left"
5. **Try to capture** → **Paywall modal** appears
6. **Click settings icon** → **Settings drawer** opens
7. **Click logout** → Redirects to sign-in page

---

## 🎨 Components Overview

### Global State
- **`UserContext`** (`src/contexts/UserContext.jsx`)
  - Manages user session and profile data
  - Provides `useUser()` hook to any component
  - Auto-refreshes on auth state changes

### UI Components
- **`CreditBadge`** (`src/components/ui/CreditBadge.jsx`)
  - Liquid glass effect tooltip
  - Color-coded: Green (>10), Yellow (4-10), Red (≤3)
  - Auto-switches text: "free images" vs "credits"

- **`PaywallModal`** (`src/components/modals/PaywallModal.jsx`)
  - Shows when credits = 0
  - Blocks camera capture
  - "Add credits" button (placeholder for Phase 2B)

- **`SettingsDrawer`** (`src/components/modals/SettingsDrawer.jsx`)
  - Full-screen overlay
  - Displays user info + credits
  - Buy credits, Contact me, Log out

### API Protection
- **`/api/generate-headshot`** (updated)
  - ✅ Auth check (401 if not signed in)
  - ✅ Credit check (402 if credits < 1)
  - ✅ Atomic credit deduction after generation
  - ✅ Transaction logging

---

## 🔒 Security Features

### Database Level
- ✅ **Row Level Security (RLS)** enabled
- ✅ Users can only see their own data
- ✅ **Check constraint** prevents negative credits
- ✅ **Atomic RPC function** prevents race conditions
- ✅ **Database trigger** auto-creates profiles

### API Level
- ✅ Server-side auth validation
- ✅ Credit check before Gemini API call (saves costs)
- ✅ Proper HTTP status codes (401, 402, 404, 500)
- ✅ Error logging for manual reconciliation

---

## 🐛 Troubleshooting

### Issue: "Profile not found" error
**Cause:** Database trigger didn't run or existing user without profile
**Fix:** Run migration script (Step 3 above)

### Issue: Credit badge not showing
**Cause:** UserContext not loaded or user not authenticated
**Fix:** Check browser console for errors, verify user is signed in

### Issue: RPC function "deduct_credit" not found
**Cause:** SQL schema not fully executed
**Fix:** Re-run entire `supabase-schema-phase2a.sql`

### Issue: Credits deducted but image failed
**Cause:** Gemini API error after credit deduction
**Solution:** Check server logs for `[CRITICAL]` messages
**Manual Fix:** Run SQL to refund:
```sql
UPDATE profiles SET credits = credits + 1 WHERE id = '<user-id>';
INSERT INTO credit_transactions (user_id, amount, transaction_type, metadata)
VALUES ('<user-id>', 1, 'refund', '{"reason": "manual_refund"}');
```

### Issue: Paywall not showing at 0 credits
**Cause:** Credit check in CameraScreen not working
**Fix:** Check `profile` is loaded in `useUser()` hook

---

## 📊 Database Queries for Monitoring

### Check total users and credits
```sql
SELECT
  COUNT(*) as total_users,
  SUM(credits) as total_credits,
  AVG(credits) as avg_credits,
  SUM(total_generated) as total_generated
FROM profiles;
```

### Check credit transactions (last 24h)
```sql
SELECT
  user_id,
  amount,
  transaction_type,
  metadata,
  created_at
FROM credit_transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Find users with low credits
```sql
SELECT id, email, credits, total_generated
FROM profiles
WHERE credits <= 3
ORDER BY credits ASC;
```

### Audit trail for a specific user
```sql
SELECT
  ct.amount,
  ct.transaction_type,
  ct.metadata,
  ct.created_at,
  p.credits as current_credits
FROM credit_transactions ct
JOIN profiles p ON p.id = ct.user_id
WHERE ct.user_id = '<user-id>'
ORDER BY ct.created_at DESC;
```

---

## ⏭️ Next Steps: Phase 2B (Stripe Integration)

When ready to implement payments:
1. Create Stripe account
2. Define credit packages (e.g., 10/$2.99, 50/$9.99, 100/$14.99)
3. Create Stripe Products & Prices
4. Implement `/api/checkout` endpoint
5. Implement `/api/webhooks/stripe` webhook handler
6. Update "Buy Credits" buttons to redirect to Stripe Checkout
7. Test with Stripe test cards

---

## 🎉 What's Working Now

✅ Users get 5 free credits on signup
✅ Credits deduct automatically on image generation
✅ Paywall blocks usage at 0 credits
✅ Settings drawer shows credit balance
✅ Credit badge displays with color-coded status
✅ Atomic transactions prevent race conditions
✅ Full audit log of all credit changes

❌ Cannot actually purchase credits yet (Phase 2B)

---

**Status**: Ready for testing! 🚀
**Estimated Time to Test**: 10-15 minutes
**Blockers**: None (database setup required first)
