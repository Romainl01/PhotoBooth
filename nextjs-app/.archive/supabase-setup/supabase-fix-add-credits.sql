-- ============================================================
-- Phase 2B: Fix add_credits function conflict
-- ============================================================
-- Run this in TWO STEPS in your Supabase SQL Editor

-- STEP 1: First, run this to see what versions exist
-- Copy this, run it, and check the results
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'add_credits';

-- STEP 2: After seeing the results, manually drop each version
-- Uncomment and run these one at a time based on what you see in STEP 1:

-- If you see: add_credits(p_user_id uuid, p_filter_name text)
-- DROP FUNCTION IF EXISTS add_credits(uuid, text);

-- If you see: add_credits(p_user_id uuid, p_amount integer)
-- DROP FUNCTION IF EXISTS add_credits(uuid, integer);

-- If you see: add_credits(p_user_id uuid, p_amount integer, p_stripe_payment_id text, p_package_name text)
-- DROP FUNCTION IF EXISTS add_credits(uuid, integer, text, text);

-- STEP 3: After dropping all versions, create the new one
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_stripe_payment_id TEXT,
  p_package_name TEXT
)
RETURNS VOID AS $$
BEGIN
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
  RAISE NOTICE 'Added % credits to user % (payment: %, package: %)',
    p_amount, p_user_id, p_stripe_payment_id, p_package_name;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Failed to add credits: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION add_credits IS 'Atomically adds purchased credits to user account and logs transaction';
