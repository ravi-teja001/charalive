-- Complete fix for procurement_id issues
-- Run this entire script step by step

-- Step 1: Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'raw_biomass_procurement' 
        AND column_name = 'procurement_id'
    ) THEN
        ALTER TABLE raw_biomass_procurement ADD COLUMN procurement_id TEXT;
        RAISE NOTICE 'Added procurement_id column';
    ELSE
        RAISE NOTICE 'procurement_id column already exists';
    END IF;
END $$;

-- Step 2: Check current state
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;

-- Step 3: Show records that need updating
SELECT 
    id,
    source,
    procurement_date,
    created_at,
    procurement_id
FROM raw_biomass_procurement 
WHERE procurement_id IS NULL OR procurement_id = ''
ORDER BY source, created_at
LIMIT 10;

-- Step 4: Manual update approach - update one record at a time
-- First cotton record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0001' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- First chilli record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0001' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- Step 5: Check if updates worked
SELECT 
    id,
    procurement_id,
    source,
    procurement_date,
    created_at
FROM raw_biomass_procurement 
WHERE procurement_id IS NOT NULL 
ORDER BY source, created_at;

-- Step 6: If you have more records, run these additional updates
-- Second cotton record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-COT-20250127-0002' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- Second chilli record
UPDATE raw_biomass_procurement 
SET procurement_id = 'BMP-CHL-20250127-0002' 
WHERE id = (
    SELECT id FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
    ORDER BY created_at, id 
    LIMIT 1
);

-- Step 7: Final verification
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;

-- Step 8: Show all updated records
SELECT 
    id,
    procurement_id,
    source,
    procurement_date,
    created_at
FROM raw_biomass_procurement 
WHERE procurement_id IS NOT NULL 
ORDER BY source, created_at;
