-- SIMPLE FIX - Manual Continuous Numbering
-- This will create the exact numbering you want

-- Step 1: First, let's see what we have
SELECT 
  id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at ASC, procurement_date ASC;

-- Step 2: Update each record manually with correct numbering
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0001'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 0);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0002'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 1);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0003'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 2);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20260127-0004'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 3);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20260127-0005'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 4);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0006'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 5);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0007'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 6);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20260127-0008'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 7);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20260127-0009'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 8);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20260127-0010'
WHERE id = (SELECT id FROM raw_biomass_procurement ORDER BY created_at ASC, procurement_date ASC LIMIT 1 OFFSET 9);

-- Step 3: Show the result
SELECT 
  'UPDATED PROCUREMENT IDs' as info,
  procurement_id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at ASC, procurement_date ASC;

SELECT '✅ Manual continuous numbering completed!' as status;
