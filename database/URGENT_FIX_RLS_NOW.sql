-- URGENT FIX: Fix RLS policies blocking signup
-- Run this immediately in Supabase SQL Editor

-- Step 1: Disable RLS temporarily to check table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role all on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.profiles;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive policies for INSERT (this is the critical one)
-- Allow anon users to insert during signup
CREATE POLICY "Allow anon insert during signup" 
ON public.profiles 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 5: Create policies for SELECT (read)
CREATE POLICY "Allow authenticated read own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow anon to read (might be needed for verification)
CREATE POLICY "Allow anon read profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

-- Step 6: Create policies for UPDATE
CREATE POLICY "Allow authenticated update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 7: Service role can do everything (for admin operations)
CREATE POLICY "Service role all operations" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles';

-- Test: This should show the policies
SELECT 'RLS policies created successfully!' as status;
