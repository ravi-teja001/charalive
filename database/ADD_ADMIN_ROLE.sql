-- Add admin role to users and user_roles
-- Run automatically on server startup via migrate.ts

-- Users table: add admin to role CHECK
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant', 'admin'));

-- User roles table: add admin to role CHECK
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant', 'admin'));
