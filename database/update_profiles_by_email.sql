-- Update specific user profiles by email to correct roles
-- Replace the email addresses and roles as needed

-- Example: Update a user to Plant Supervisor
-- UPDATE public.profiles
-- SET role = 'supervisor_plant'
-- WHERE email = 'user@example.com';

-- Example: Update a user to Incharge
-- UPDATE public.profiles
-- SET role = 'incharge'
-- WHERE email = 'incharge@example.com';

-- Example: Update a user to Stock Point Supervisor
-- UPDATE public.profiles
-- SET role = 'supervisor_stockpoint'
-- WHERE email = 'supervisor@example.com';

-- Check current roles before updating
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN (
  'user@example.com',  -- Replace with actual emails
  'incharge@example.com',
  'supervisor@example.com'
);
