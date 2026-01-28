-- ENABLE READING PROFILES FOR EMAIL DISPLAY
-- This script ensures authenticated users can read profiles to see creator emails

-- Step 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Step 2: Check existing policies
SELECT 
  policyname,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 3: Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create/Update policy to allow authenticated users to read all profiles (for email display)
DROP POLICY IF EXISTS "Allow authenticated read all profiles for emails" ON public.profiles;

CREATE POLICY "Allow authenticated read all profiles for emails"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Step 5: Also allow reading profiles by email for display purposes
-- This allows users to see who created each record
CREATE POLICY "Allow read profiles by email display"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- Step 6: Verify policies are created
SELECT 
  policyname,
  roles,
  cmd as command
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 7: Test query to verify it works
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
LIMIT 5;
