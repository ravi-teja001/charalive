-- CHECK IMAGE STORAGE
-- See how vehicle photos are actually stored

SELECT 
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
