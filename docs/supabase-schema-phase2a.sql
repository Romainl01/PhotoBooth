-- =====================================================
-- Morpheo 2.0 - Phase 2A Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- ==================== TABLES ====================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 5 CHECK (credits >= 0), -- Prevent negative credits
  total_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions table (audit log)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = purchase/grant, Negative = usage
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('initial', 'purchase', 'generation', 'refund', 'admin_adjustment')),
  metadata JSONB, -- Store filter name, payment ID, error details, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Credit transactions policies (read-only for users)
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ==================== TRIGGERS ====================

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile with 5 free credits
  INSERT INTO public.profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 5)
  ON CONFLICT (id) DO NOTHING;

  -- Log initial credit grant
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, metadata)
  VALUES (NEW.id, 5, 'initial', jsonb_build_object('source', 'signup_bonus'));

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger: Run handle_new_user() after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==================== RPC FUNCTIONS ====================

-- Function: Atomically deduct 1 credit and log transaction
CREATE OR REPLACE FUNCTION public.deduct_credit(
  p_user_id UUID,
  p_filter_name TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists and has credits
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  IF v_current_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits. Current: %, Required: 1', v_current_credits;
  END IF;

  -- Deduct credit and increment counter (atomic)
  UPDATE public.profiles
  SET
    credits = credits - 1,
    total_generated = total_generated + 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, metadata)
  VALUES (
    p_user_id,
    -1,
    'generation',
    jsonb_build_object('filter', p_filter_name, 'timestamp', NOW())
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise with context
    RAISE EXCEPTION 'Credit deduction failed for user %: %', p_user_id, SQLERRM;
END;
$$;

-- Function: Add credits (for future Stripe integration)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive. Received: %', p_amount;
  END IF;

  -- Add credits (atomic)
  UPDATE public.profiles
  SET
    credits = credits + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, metadata)
  VALUES (
    p_user_id,
    p_amount,
    'purchase',
    jsonb_build_object('payment_id', p_payment_id, 'timestamp', NOW())
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Credit addition failed for user %: %', p_user_id, SQLERRM;
END;
$$;

-- ==================== HELPER FUNCTIONS ====================

-- Function: Get user's current credits (convenience function)
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_credits, 0);
END;
$$;

-- ==================== GRANT PERMISSIONS ====================

-- Grant authenticated users access to profiles
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;

-- Grant service role full access (for admin operations)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.credit_transactions TO service_role;

-- ==================== VERIFICATION QUERIES ====================

-- Run these queries to verify setup:
-- 1. Check if tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'credit_transactions');

-- 2. Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'credit_transactions');

-- 3. Check if trigger exists:
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';

-- 4. Test trigger by creating a test user (do this in Supabase dashboard):
-- Go to Authentication > Users > Invite User
-- Check if profile was auto-created: SELECT * FROM profiles;

-- ==================== MIGRATION FOR EXISTING USERS ====================

-- If you have existing auth.users without profiles, run this:
-- INSERT INTO public.profiles (id, email, credits)
-- SELECT id, email, 5
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles)
-- ON CONFLICT (id) DO NOTHING;

-- Log initial credits for migrated users:
-- INSERT INTO public.credit_transactions (user_id, amount, transaction_type, metadata)
-- SELECT id, 5, 'initial', '{"source": "migration"}'::jsonb
-- FROM auth.users
-- WHERE id NOT IN (
--   SELECT user_id FROM public.credit_transactions WHERE transaction_type = 'initial'
-- );

-- =====================================================
-- END OF SCHEMA
-- =====================================================
