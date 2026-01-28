-- FIX VEHICLES TABLE RLS POLICIES
-- Run this in Supabase SQL Editor to ensure vehicles table can be updated/deleted

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'vehicles';

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on vehicles" ON public.vehicles;

-- Step 3: Re-enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive policies for all operations
-- Allow authenticated users to perform all operations
CREATE POLICY "Allow authenticated users all operations on vehicles" 
ON public.vehicles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Allow users to read all vehicles (needed for dropdowns)
CREATE POLICY "Allow authenticated users to read all vehicles" 
ON public.vehicles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow users to insert vehicles
CREATE POLICY "Allow authenticated users to insert vehicles" 
ON public.vehicles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to update their own vehicles
CREATE POLICY "Allow authenticated users to update own vehicles" 
ON public.vehicles 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow users to delete their own vehicles
CREATE POLICY "Allow authenticated users to delete own vehicles" 
ON public.vehicles 
FOR DELETE 
TO authenticated
USING (true);

-- Step 5: Verify policies
SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'vehicles'
ORDER BY policyname;

SELECT '✅ Vehicles RLS policies fixed!' as status;
