-- ============================================================
-- FIX: Add missing stripe_payment_id column to credit_transactions
-- ============================================================
-- Run this in your Supabase SQL Editor

-- Add the missing column
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Add index for Stripe payment ID lookups (prevent duplicate processing)
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment
ON credit_transactions(stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;

-- Verify the fix
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'credit_transactions'
ORDER BY ordinal_position;
