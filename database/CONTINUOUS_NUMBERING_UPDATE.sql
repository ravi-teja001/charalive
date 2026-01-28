-- Update existing records with continuous numbering across all sources
-- BMP-COT-0001, BMP-COT-0002, BMP-CHL-0003, BMP-CHL-0004, etc.

-- Step 1: Check current state
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id
FROM raw_biomass_procurement;

-- Step 2: Show records that need updating
SELECT 
    id,
    source,
    procurement_date,
    created_at,
    procurement_id
FROM raw_biomass_procurement 
WHERE procurement_id IS NULL OR procurement_id = ''
ORDER BY created_at, id;

-- Step 3: Update records with continuous numbering
-- Update first record (could be cotton or chilli)
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0001' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update second record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0002' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update third record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0003' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update fourth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0004' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update fifth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0005' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update sixth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0006' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update seventh record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0007' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update eighth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0008' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update ninth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0009' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
    ORDER BY created_at, id 
    LIMIT 1
);

-- Update tenth record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0010' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE procurement_id IS NULL OR procurement_id = ''
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
ORDER BY created_at, id;

-- Step 5: Final count
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;
