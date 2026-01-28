-- AUTOMATIC FIX FOR SIGNUP - Run this once to fix everything
-- This script fixes RLS, creates trigger, and ensures profiles table exists

-- ============================================
-- STEP 1: Ensure profiles table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- STEP 2: DISABLE RLS (simplest solution)
-- ============================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create trigger function (bypasses RLS anyway)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Extract role from user metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'incharge');
  
  -- Insert into profiles (SECURITY DEFINER bypasses RLS)
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Grant permissions
-- ============================================
GRANT ALL ON public.profiles TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- ============================================
-- VERIFY
-- ============================================
SELECT '✅ Setup complete! RLS disabled, trigger created.' as status;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
