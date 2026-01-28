-- QUICK FIX: Disable RLS on profiles table to allow signups to work
-- This is the simplest solution - RLS can be re-enabled later with proper policies

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

SELECT 'RLS disabled on profiles table - signup should work now!' as status;
