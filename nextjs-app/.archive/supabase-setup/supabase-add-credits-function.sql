-- ============================================================
-- Phase 2B: Stripe Integration - Add Credits RPC Function
-- ============================================================
-- Run this in your Supabase SQL Editor
-- This function is called by the Stripe webhook to add credits after successful payment

-- Drop ALL versions of add_credits function using dynamic SQL
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
        RAISE NOTICE 'Dropped function: %', func_signature;
    END LOOP;
END $$;

-- Create new add_credits function with Stripe payment tracking
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

-- Test the function (optional - will add 10 test credits to your account)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- SELECT add_credits(
--   'YOUR_USER_ID'::UUID,
--   10,
--   'test_payment_intent_123',
--   'Test Package'
-- );
