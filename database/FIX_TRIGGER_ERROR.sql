-- FIX: Remove problematic trigger causing 500 errors
-- Run this in Supabase SQL Editor to fix the signup issue

-- Step 1: Remove the trigger that's causing 500 errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Remove the function (optional - only if you want to completely remove it)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Verify it's removed
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If the query returns no rows, the trigger is successfully removed!

-- NOTE: After running this, user profiles will be created automatically 
-- on first login by the application code. This is actually more reliable!
