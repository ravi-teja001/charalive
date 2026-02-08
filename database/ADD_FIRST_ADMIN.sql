-- Add admin role support and optionally promote first admin
-- Run in Railway Query tab or: psql $DATABASE_URL -f database/ADD_FIRST_ADMIN.sql

-- 1. Ensure admin is in the role CHECK (in case ADD_ADMIN_ROLE migration didn't run)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant', 'admin'));

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant', 'admin'));

-- 2. Promote an existing user to admin (replace 'your-admin@email.com' with the actual email)
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';

-- 3. Or add admin role to user_roles (if using user_roles table)
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'admin' FROM users WHERE email = 'your-admin@email.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
