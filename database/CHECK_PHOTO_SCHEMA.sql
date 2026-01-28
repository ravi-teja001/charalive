-- CHECK DATABASE SCHEMA FOR MOISTURE PHOTO
-- This will show us what columns exist for photos

-- Show all columns in raw_biomass_procurement table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to see what photo fields exist
SELECT 
  'Sample photo data' as info,
  id,
  vehicle_photo,
  weight_record_photo,
  moisture,
  procurement_date,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at DESC 
LIMIT 3;
