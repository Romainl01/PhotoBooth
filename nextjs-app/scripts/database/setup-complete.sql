-- ============================================================
-- MORPHEO 2.0 - Complete Database Setup
-- ============================================================
-- Run this ENTIRE file in your Supabase SQL Editor in ONE GO
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================================
-- 1. CREATE CREDIT_TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'generation', 'refund')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for user queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
ON credit_transactions(user_id, created_at DESC);

-- Add index for Stripe payment ID lookups (prevent duplicate processing)
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment
ON credit_transactions(stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;

COMMENT ON TABLE credit_transactions IS 'Audit trail of all credit purchases and usage';


-- ============================================================
-- 2. CREATE CREDIT_PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stripe_price_id TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for active packages query
CREATE INDEX IF NOT EXISTS idx_credit_packages_active_order
ON credit_packages(active, display_order)
WHERE active = TRUE;

COMMENT ON TABLE credit_packages IS 'Credit packages available for purchase via Stripe';

-- Seed with Stripe products
INSERT INTO credit_packages (name, emoji, credits, price_cents, currency, stripe_price_id, display_order) VALUES
  ('Starter', '💫', 10, 299, 'EUR', 'price_1SS4E8K9cHL77TyOtdNpKgCr', 1),
  ('Creator', '🎨', 30, 699, 'EUR', 'price_1SS4FjK9cHL77TyOJNL1mVLc', 2),
  ('Pro', '🏆', 100, 1799, 'EUR', 'price_1SS4EtK9cHL77TyOS3mtMaHi', 3)
ON CONFLICT (stripe_price_id) DO NOTHING;


-- ============================================================
-- 3. DROP OLD ADD_CREDITS FUNCTIONS (if any exist)
-- ============================================================
DO $$
DECLARE
    func_signature TEXT;
BEGIN
    -- Loop through all add_credits functions and drop them
    FOR func_signature IN (
        SELECT oid::regprocedure::text
        FROM pg_proc
        WHERE proname = 'add_credits'
        AND pg_function_is_visible(oid)
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped old function: %', func_signature;
    END LOOP;
END $$;


-- ============================================================
-- 4. CREATE ADD_CREDITS RPC FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_stripe_payment_id TEXT,
  p_package_name TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Check if this payment was already processed (idempotency)
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE stripe_payment_id = p_stripe_payment_id
  ) THEN
    RAISE NOTICE 'Payment % already processed, skipping', p_stripe_payment_id;
    RETURN;
  END IF;

  -- 1. Add credits to user's profile (atomic update)
  UPDATE profiles
  SET
    credits = credits + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 2. Log the transaction for audit trail
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    stripe_payment_id,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    'purchase',
    p_stripe_payment_id,
    NOW()
  );

  -- Log success
  RAISE NOTICE 'Successfully added % credits to user % (payment: %, package: %)',
    p_amount, p_user_id, p_stripe_payment_id, p_package_name;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Failed to add credits: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_credits IS 'Atomically adds purchased credits to user account and logs transaction. Called by Stripe webhook.';


-- ============================================================
-- 5. VERIFY SETUP
-- ============================================================
-- Check tables exist
SELECT
  'credit_transactions' as table_name,
  COUNT(*) as row_count
FROM credit_transactions
UNION ALL
SELECT
  'credit_packages' as table_name,
  COUNT(*) as row_count
FROM credit_packages
UNION ALL
SELECT
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles;

-- Check packages were inserted
SELECT
  name,
  emoji,
  credits,
  CONCAT(currency, ' ', (price_cents::FLOAT / 100)::TEXT) as price,
  stripe_price_id,
  active
FROM credit_packages
ORDER BY display_order;

-- Check function exists
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'add_credits'
AND routine_schema = 'public';
