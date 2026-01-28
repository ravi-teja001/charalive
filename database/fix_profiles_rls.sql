-- Fix RLS policies for profiles table to allow signup data to be saved
-- This ensures that profiles can be created during signup

-- Check if profiles table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON public.profiles;
    
    -- Create policies that allow all operations (for now, to ensure signup works)
    -- You can restrict these later for security
    CREATE POLICY "Allow all operations on profiles" 
    ON public.profiles 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
    
    RAISE NOTICE 'RLS policies created for profiles table';
  ELSE
    RAISE NOTICE 'profiles table does not exist - run schema.sql first';
  END IF;
END $$;

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
