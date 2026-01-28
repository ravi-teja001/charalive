-- Check current profiles and their roles
-- This will help you see what roles are currently stored in the database

SELECT 
  id,
  email,
  role,
  stock_point_id,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Count profiles by role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;
