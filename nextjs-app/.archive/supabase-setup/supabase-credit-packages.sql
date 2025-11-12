-- ============================================================
-- Phase 2B: Stripe Integration - Credit Packages Table
-- ============================================================
-- Run this in your Supabase SQL Editor
-- This creates the credit_packages table and seeds it with your Stripe products

-- Create credit_packages table
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

-- Add comment for documentation
COMMENT ON TABLE credit_packages IS 'Credit packages available for purchase via Stripe';

-- Create index for active packages query
CREATE INDEX IF NOT EXISTS idx_credit_packages_active_order
ON credit_packages(active, display_order)
WHERE active = TRUE;

-- Seed with your Stripe products
INSERT INTO credit_packages (name, emoji, credits, price_cents, currency, stripe_price_id, display_order) VALUES
  ('Starter', '💫', 10, 299, 'EUR', 'price_1SS4E8K9cHL77TyOtdNpKgCr', 1),
  ('Creator', '🎨', 30, 699, 'EUR', 'price_1SS4FjK9cHL77TyOJNL1mVLc', 2),
  ('Pro', '🏆', 100, 1799, 'EUR', 'price_1SS4EtK9cHL77TyOS3mtMaHi', 3)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Verify insertion
SELECT
  name,
  emoji,
  credits,
  CONCAT('€', (price_cents::FLOAT / 100)::TEXT) as price,
  stripe_price_id
FROM credit_packages
ORDER BY display_order;
