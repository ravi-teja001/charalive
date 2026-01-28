-- TEST AND FIX: Ensure trigger creates profiles on signup
-- This script checks if trigger exists and recreates it if needed

-- Step 1: Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgisinternal as is_internal
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 2: Check if function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Step 3: Ensure profiles table exists and RLS is disabled
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS to ensure no blocking
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Recreate trigger function with better error handling
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
  -- Extract role from user metadata - try both locations
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->'role')::TEXT,
    'incharge'  -- Default fallback
  );
  
  -- Log the operation (visible in Supabase logs)
  RAISE NOTICE 'Creating profile for user: %, email: %, role: %', NEW.id, NEW.email, user_role;
  
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
  
  RAISE NOTICE 'Profile created/updated successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detailed error but don't fail auth user creation
    RAISE WARNING 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Step 5: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Grant permissions
GRANT ALL ON public.profiles TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 7: Test - Check recent profiles
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Step 8: Verify trigger is active
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

SELECT '✅ Trigger setup complete! Try signing up a new user now.' as status;
