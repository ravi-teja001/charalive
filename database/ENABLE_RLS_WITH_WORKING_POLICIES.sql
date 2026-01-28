-- Enable RLS with working policies that allow signup
-- Run this if you want RLS enabled but signup to work

-- Step 1: Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
  END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy that allows EVERYONE (including anon) to insert
-- This is needed because during signup, user is not yet authenticated (anon)
CREATE POLICY "Allow anyone to insert profiles" 
ON public.profiles 
FOR INSERT 
TO public  -- This includes anon, authenticated, and all roles
WITH CHECK (true);

-- Step 5: Allow authenticated users to read their own profile
CREATE POLICY "Allow authenticated read own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Step 6: Allow authenticated users to update their own profile
CREATE POLICY "Allow authenticated update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 7: Also allow anon to read (for verification during signup)
CREATE POLICY "Allow anon read profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

-- Verify policies
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'profiles';

SELECT 'RLS enabled with working policies!' as status;
