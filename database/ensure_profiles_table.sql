-- Ensure the profiles table exists with correct structure
-- This script creates the profiles table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON public.profiles;

-- Create permissive policy to allow all operations (for development)
-- For production, you should restrict these based on user roles
CREATE POLICY "Allow all operations on profiles" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
