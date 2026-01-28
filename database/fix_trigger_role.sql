-- Fix the trigger to properly use the role from user_metadata
-- The issue is that the trigger might be defaulting incorrectly or the role isn't being read properly

-- Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that properly handles role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Extract role from user metadata, with proper fallback
  -- Try user_metadata first, then raw_user_meta_data, then default to NULL (let app handle it)
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NULL
  );
  
  -- Only insert if role is actually set (non-null)
  -- If role is NULL, the app code will handle profile creation
  IF user_role IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, profiles.email),
      -- Always update role from metadata if it's provided
      role = CASE 
        WHEN EXCLUDED.role IS NOT NULL THEN EXCLUDED.role
        ELSE profiles.role
      END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
