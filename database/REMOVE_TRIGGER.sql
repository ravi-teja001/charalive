-- REMOVE DATABASE TRIGGER TO FIX 500 ERROR
-- Run this in Supabase SQL Editor if you're getting "Database error saving new user"

-- Remove the trigger that's causing the 500 error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the function (optional - only if you want to completely remove it)
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- After running this, try signing up again
-- The profile will be created automatically on first login instead
