-- Update existing records with proper procurement_ids
-- This script assigns procurement_ids to existing records that don't have them

-- First, let's see how many records need updating
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;

-- Update existing records with sequential procurement_ids
-- This will assign IDs in order of creation date

-- Update cotton stalks records
WITH cotton_records AS (
    SELECT 
        id,
        procurement_date,
        created_at,
        ROW_NUMBER() OVER (ORDER BY created_at, id) as seq_num
    FROM raw_biomass_procurement 
    WHERE source = 'cotton_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
),
cotton_with_ids AS (
    SELECT 
        id,
        TO_CHAR(procurement_date, 'YYYY-MM-DD') as date_str,
        LPAD(seq_num::text, 4, '0') as seq_str,
        'BMP-COT-' || TO_CHAR(procurement_date, 'YYYY-MM-DD') || '-' || LPAD(seq_num::text, 4, '0') as new_procurement_id
    FROM cotton_records
)
UPDATE raw_biomass_procurement 
SET procurement_id = cotton_with_ids.new_procurement_id
FROM cotton_with_ids
WHERE raw_biomass_procurement.id = cotton_with_ids.id;

-- Update chilli stalks records
WITH chilli_records AS (
    SELECT 
        id,
        procurement_date,
        created_at,
        ROW_NUMBER() OVER (ORDER BY created_at, id) as seq_num
    FROM raw_biomass_procurement 
    WHERE source = 'chilli_stalks' 
    AND (procurement_id IS NULL OR procurement_id = '')
),
chilli_with_ids AS (
    SELECT 
        id,
        TO_CHAR(procurement_date, 'YYYY-MM-DD') as date_str,
        LPAD(seq_num::text, 4, '0') as seq_str,
        'BMP-CHL-' || TO_CHAR(procurement_date, 'YYYY-MM-DD') || '-' || LPAD(seq_num::text, 4, '0') as new_procurement_id
    FROM chilli_records
)
UPDATE raw_biomass_procurement 
SET procurement_id = chilli_with_ids.new_procurement_id
FROM chilli_with_ids
WHERE raw_biomass_procurement.id = chilli_with_ids.id;

-- Verify the updates
SELECT 
    id,
    procurement_id,
    source,
    procurement_date,
    created_at
FROM raw_biomass_procurement 
WHERE procurement_id IS NOT NULL 
ORDER BY source, created_at
LIMIT 20;

-- Show final count
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN procurement_id IS NULL OR procurement_id = '' THEN 1 END) as records_without_id,
    COUNT(CASE WHEN procurement_id IS NOT NULL AND procurement_id != '' THEN 1 END) as records_with_id
FROM raw_biomass_procurement;
