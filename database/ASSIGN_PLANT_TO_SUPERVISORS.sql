-- Assign plant to Plant Supervisors who don't have one
-- Run in Railway Query tab or: psql $DATABASE_URL -f database/ASSIGN_PLANT_TO_SUPERVISORS.sql

-- Update users table: set plant_id = 'plant1' for supervisor_plant with null plant_id
UPDATE users
SET plant_id = 'plant1'
WHERE role = 'supervisor_plant' AND (plant_id IS NULL OR plant_id = '');

-- Update user_roles table: set plant_id = 'plant1' for supervisor_plant with null plant_id
UPDATE user_roles
SET plant_id = 'plant1'
WHERE role = 'supervisor_plant' AND (plant_id IS NULL OR plant_id = '');

-- Verify
SELECT id, email, name, role, plant_id, stock_point_id FROM users WHERE role = 'supervisor_plant';
