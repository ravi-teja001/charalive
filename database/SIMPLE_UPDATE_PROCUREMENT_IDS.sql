-- Simple script to update existing records with procurement_ids
-- Run this step by step

-- Step 1: Check current state
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id
FROM raw_biomass_procurement;

-- Step 2: Update cotton records one by one (simple approach)
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0001' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0002' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0003' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0004' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0005' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- Step 3: Update chilli records one by one
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0001' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0002' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0003' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0004' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0005' 
WHERE id IN (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- Step 4: Check results
SELECT 
    id,
    procurement_id,
    source,
    procurement_date,
    created_at
FROM raw_biomass_procurement 
WHERE procurement_id IS NOT NULL 
ORDER BY source, created_at;

-- Step 5: Final count
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;
