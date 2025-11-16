-- Copy and paste this into Supabase SQL Editor to check RLS status

-- 1. Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 2. Check what policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Check if your user has a profile
SELECT
  id,
  email,
  credits,
  created_at
FROM profiles
WHERE id = auth.uid();
