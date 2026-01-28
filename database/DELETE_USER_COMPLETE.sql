-- COMPLETE USER DELETION SCRIPT
-- This script deletes a user from both auth.users and profiles tables
-- Run this in Supabase SQL Editor

-- Replace 'suvitha614@gmail.com' with the email you want to delete
DO $$
DECLARE
  user_email TEXT := 'suvitha614@gmail.com';
  user_id UUID;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', user_email;
  ELSE
    RAISE NOTICE 'Found user ID: %', user_id;
    
    -- Delete from profiles first (due to foreign key constraint)
    DELETE FROM public.profiles
    WHERE id = user_id;
    
    RAISE NOTICE 'Deleted from profiles table';
    
    -- Delete from auth.users
    DELETE FROM auth.users
    WHERE id = user_id;
    
    RAISE NOTICE 'Deleted from auth.users table';
    RAISE NOTICE 'User % completely deleted', user_email;
  END IF;
END $$;

-- Verify deletion
SELECT 'Remaining users in auth.users:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'suvitha614@gmail.com';

SELECT 'Remaining profiles:' as info;
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'suvitha614@gmail.com';
