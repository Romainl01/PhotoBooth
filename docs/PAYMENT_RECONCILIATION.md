# Payment Reconciliation Guide

## When to Use This
User reports: **"I paid but didn't receive credits"**

This is a LOW probability event (< 1% of payments) but requires immediate action when it occurs.

---

## Step 1: Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/payments
2. Search for customer email or payment ID
3. Find the payment in question
4. Copy the **`payment_intent` ID** (starts with `pi_`)
5. Verify payment status is **"Succeeded"**

---

## Step 2: Check if Credits Were Added

Run in **Supabase SQL Editor**:

```sql
-- Check if this payment was processed
SELECT * FROM credit_transactions
WHERE stripe_payment_id = 'pi_XXXXXXXXXXXXXX'; -- Replace with actual payment_intent

-- If no results → credits were NOT added, proceed to Step 3
-- If results exist → credits were added, proceed to Step 3A
```

### Step 3A: Credits Added But User Doesn't See Them

If the transaction exists, check user's current profile:

```sql
-- Check user's current credits
SELECT
  id,
  email,
  credits,
  total_generated,
  created_at,
  updated_at
FROM profiles
WHERE email = 'user@example.com'; -- Replace with user's email
```

**If credits are correct:** User may need to refresh browser/app. Ask them to:
1. Sign out
2. Clear browser cache
3. Sign back in

**If credits are missing:** Database inconsistency detected. Proceed to Step 4.

---

## Step 3: Verify User Profile

```sql
-- Check user's current credits and recent transactions
SELECT
  p.id,
  p.email,
  p.credits,
  p.total_generated,
  p.created_at,
  (
    SELECT COUNT(*)
    FROM credit_transactions ct
    WHERE ct.user_id = p.id AND ct.transaction_type = 'purchase'
  ) as total_purchases
FROM profiles p
WHERE p.email = 'user@example.com'; -- Replace with user's email
```

---

## Step 4: Manual Credit Addition

If payment succeeded in Stripe but credits NOT added in database:

### Get Payment Details from Stripe Dashboard

From the Stripe payment page, note:
- **User Email:** (e.g., user@example.com)
- **Payment Intent ID:** (e.g., pi_3AbCdEfGhIjKlMnO)
- **Amount Paid:** (e.g., €2.99)
- **Package:** Determine from amount:
  - €2.99 = Starter (10 credits)
  - €6.99 = Creator (30 credits)
  - €17.99 = Pro (100 credits)

### Execute Manual Credit Addition

```sql
-- First, get the user's UUID from their email
SELECT id, email, credits
FROM profiles
WHERE email = 'user@example.com'; -- Replace with user's email

-- Copy the UUID from the result above
-- Then manually add credits using the add_credits RPC
SELECT add_credits(
  'USER_UUID_HERE'::UUID,        -- User ID from profiles table (e.g., '550e8400-e29b-41d4-a716-446655440000')
  10,                             -- Credit amount (10 for Starter, 30 for Creator, 100 for Pro)
  'pi_XXXXXXXXXXXXXX',            -- payment_intent ID from Stripe
  'Starter'                       -- Package name ('Starter', 'Creator', or 'Pro')
);
```

### Verify Addition

```sql
-- Verify credits were added
SELECT id, email, credits, updated_at
FROM profiles
WHERE email = 'user@example.com';

-- Verify transaction was logged
SELECT
  user_id,
  amount,
  transaction_type,
  stripe_payment_id,
  created_at
FROM credit_transactions
WHERE user_id = 'USER_UUID_HERE'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Step 5: Notify User

Send email to user:

```
Subject: Your Morpheo Credits Have Been Added

Hi [Name],

We've successfully added [X] credits to your account. We apologize for the delay - there was a temporary issue with our payment processing system.

Your current balance: [Y] credits

Thank you for your patience and for being a valued Morpheo user!

Best regards,
The Morpheo Team
```

---

## Prevention: Monitor Webhook Logs

### Check Webhook Processing Logs

**Vercel Dashboard:**
1. Go to your project
2. Click "Logs" tab
3. Filter by `/api/webhooks/stripe`
4. Look for errors around the payment time

**Supabase Dashboard:**
1. Go to Logs section
2. Filter by "Stripe Webhook" or "add_credits"
3. Look for errors

### Common Webhook Failure Causes

1. **Database timeout:** Supabase was temporarily down
2. **RLS policy issue:** Permission denied on credit_transactions table
3. **Network timeout:** Webhook took >30 seconds to respond
4. **Metadata missing:** user_id or credits not in Stripe session metadata

---

## Recovery Scripts

### Check All Unprocessed Payments (Last 7 Days)

**Manual Check Required:** This requires comparing Stripe payments to credit_transactions

1. Export payments from Stripe Dashboard (last 7 days)
2. Run this query to get all payment_intents in database:

```sql
SELECT stripe_payment_id, created_at
FROM credit_transactions
WHERE created_at > NOW() - INTERVAL '7 days'
  AND stripe_payment_id IS NOT NULL
ORDER BY created_at DESC;
```

3. Compare lists - any payment_intent in Stripe but NOT in database needs manual reconciliation

---

## Emergency Contact

If you cannot resolve the issue:

1. **Check Supabase Status:** https://status.supabase.com/
2. **Check Stripe Status:** https://status.stripe.com/
3. **Review Recent Deployments:** Any recent code changes to webhook handler?

---

## Logging Improvements (Already Implemented)

Your webhook handler now logs:
- ✅ Webhook received timestamp
- ✅ Event type
- ✅ Payment intent ID
- ✅ User ID
- ✅ Credits amount
- ✅ Package name
- ✅ Success/failure status

All logs available in Vercel Dashboard under your project's Logs tab.

---

## Credit Package Configuration

### Single Source of Truth

Credit packages are defined in `/nextjs-app/src/lib/creditPackages.js` as `DEFAULT_CREDIT_PACKAGES`.

This constant is used by:
- **PaywallModal component:** Instant UI rendering (zero loading state)
- **/api/credit-packages route:** Fallback when database fails
- **Manual reconciliation:** Reference for package details

### Package Details (Current)

```javascript
{
  Starter: { credits: 10, price: €2.99, stripe_price_id: 'price_1SS4E8K9cHL77TyOtdNpKgCr' }
  Creator: { credits: 30, price: €6.99, stripe_price_id: 'price_1SS4FjK9cHL77TyOJNL1mVLc' }
  Pro: { credits: 100, price: €17.99, stripe_price_id: 'price_1SS4EtK9cHL77TyOS3mtMaHi' }
}
```

### Updating Prices

When changing credit package prices:

1. **Create new Stripe price** in dashboard.stripe.com
2. **Update** `DEFAULT_CREDIT_PACKAGES` in `/nextjs-app/src/lib/creditPackages.js`
3. **Update database** via Supabase SQL editor:
   ```sql
   UPDATE credit_packages
   SET price_cents = 399, stripe_price_id = 'price_NEW_ID'
   WHERE name = 'Starter';
   ```
4. **Deploy** to production
5. **Verify** PaywallModal shows correct prices

**Important:** Keep `DEFAULT_CREDIT_PACKAGES`, database, and Stripe in sync to avoid pricing inconsistencies.

---

**Last Updated:** 2025-11-12
**Document Version:** 1.1
