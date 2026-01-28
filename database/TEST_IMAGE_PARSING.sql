-- TEST IMAGE PARSING
-- Check how vehicle photos are stored in the database

-- Show sample vehicle_photo data
SELECT 
  'Vehicle Photo Data Analysis' as info,
  id,
  vehicle_photo,
  CASE 
    WHEN vehicle_photo LIKE '[%]' THEN 'JSON Array'
    WHEN vehicle_photo LIKE 'data:image%' THEN 'Single Base64 Image'
    WHEN vehicle_photo LIKE 'http%' THEN 'Single URL Image'
    ELSE 'Other/Empty'
  END as photo_type,
  LENGTH(vehicle_photo) as photo_length
FROM raw_biomass_procurement 
ORDER BY created_at DESC 
LIMIT 3;

-- Test JSON parsing on existing data
SELECT 
  'JSON Parsing Test' as info,
  vehicle_photo,
  CASE 
    WHEN vehicle_photo LIKE '[%' THEN 'Can Parse JSON'
    ELSE 'Not JSON'
  END as can_parse
FROM raw_biomass_procurement 
WHERE vehicle_photo IS NOT NULL
LIMIT 3;
