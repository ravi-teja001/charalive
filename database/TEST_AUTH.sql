-- TEST CURRENT USER AUTHENTICATION
-- This helps verify if the user authentication is working

-- Check if we can get the current authenticated user
SELECT 
  'Testing user authentication' as info,
  auth.email() as current_email,
  auth.uid() as current_uid;

-- Show existing records to see what created_by values we have
SELECT 
  'Current records in database' as info,
  COUNT(*) as total_records,
  STRING_AGG(DISTINCT created_by, ', ') as unique_created_by_values
FROM raw_biomass_procurement;

-- Show sample records with user info
SELECT 
  'Sample records' as info,
  id,
  created_by,
  created_by_email,
  vehicle_number,
  procurement_date
FROM raw_biomass_procurement 
ORDER BY created_at DESC 
LIMIT 3;
