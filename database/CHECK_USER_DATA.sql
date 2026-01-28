-- Check what's in your procurement table
-- Run this in your Supabase SQL Editor

-- Check all procurement records with user info
SELECT 
  rp.id,
  rp.procurement_id,
  rp.created_by,
  rp.created_by_email,
  rp.procurement_date,
  rp.vehicle_number,
  au.email as auth_user_email
FROM raw_biomass_procurement rp
LEFT JOIN auth.users au ON au.id = rp.created_by
ORDER BY rp.procurement_date DESC
LIMIT 10;

-- Check if created_by_email column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
AND column_name IN ('created_by', 'created_by_email');
