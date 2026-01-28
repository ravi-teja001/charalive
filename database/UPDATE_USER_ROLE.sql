-- UPDATE_USER_ROLE.sql
-- Use this script to update a user's role in the database
-- Replace the email and role values as needed

-- Example: Update user to Plant Supervisor
UPDATE public.profiles 
SET 
  role = 'supervisor_plant',  -- Change to: 'supervisor_stockpoint', 'incharge', or 'supervisor_plant'
  updated_at = NOW()
WHERE email = 'suvitha614@gmail.com';  -- Replace with the user's email

-- Also update the auth.users metadata
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"supervisor_plant"'::jsonb  -- Change to match the role above
  ),
  updated_at = NOW()
WHERE email = 'suvitha614@gmail.com';  -- Replace with the user's email

-- Verify the update
SELECT 
  p.id,
  p.email,
  p.role as profile_role,
  au.raw_user_meta_data->>'role' as metadata_role,
  p.updated_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.email = 'suvitha614@gmail.com';  -- Replace with the user's email
