-- Verify the profiles table structure and constraints
-- This helps ensure the table is set up correctly for all three roles

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there are any check constraints on the role column
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND contype = 'c';

-- Test valid role values
-- These should all be valid:
-- 'supervisor_stockpoint'
-- 'incharge'  
-- 'supervisor_plant'

-- Count profiles by role to see distribution
SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.profiles) as percentage
FROM public.profiles
GROUP BY role
ORDER BY role;
