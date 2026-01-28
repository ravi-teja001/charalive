-- Fix user filtering by ensuring all records have email
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_by_email IS NOT NULL THEN 1 END) as records_with_email,
  COUNT(CASE WHEN created_by_email IS NULL THEN 1 END) as records_without_email
FROM raw_biomass_procurement;

-- Step 2: Update all records to include user email
UPDATE raw_biomass_procurement 
SET created_by_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = raw_biomass_procurement.created_by
)
WHERE created_by_email IS NULL;

-- Step 3: Verify the update
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_by_email IS NOT NULL THEN 1 END) as records_with_email,
  COUNT(CASE WHEN created_by_email IS NULL THEN 1 END) as records_without_email
FROM raw_biomass_procurement;

-- Step 4: Show sample data
SELECT 
  rp.id,
  rp.created_by,
  rp.created_by_email,
  au.email as auth_email,
  rp.procurement_date
FROM raw_biomass_procurement rp
LEFT JOIN auth.users au ON au.id = rp.created_by
ORDER BY rp.procurement_date DESC
LIMIT 5;
