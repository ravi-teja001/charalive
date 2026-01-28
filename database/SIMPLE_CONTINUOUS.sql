-- FIX PROCUREMENT IDs - CONTINUOUS NUMBERING (Simple Approach)
-- Update procurement IDs to have continuous numbering across all sources

-- Step 1: Show current procurement IDs
SELECT 
  'CURRENT PROCUREMENT IDs (Before Fix)' as info,
  procurement_id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at ASC;

-- Step 2: Create temporary table with row numbers
CREATE TEMPORARY TABLE temp_procurement_order AS
SELECT 
  id,
  procurement_date,
  source,
  ROW_NUMBER() OVER (ORDER BY procurement_date ASC, created_at ASC) as row_num,
  ROW_NUMBER() OVER (PARTITION BY procurement_date ORDER BY created_at ASC) as daily_num
FROM raw_biomass_procurement;

-- Step 3: Update procurement IDs with continuous numbering
UPDATE raw_biomass_procurement p
SET procurement_id = 
  'BMP-' || 
  CASE WHEN p.source = 'cotton_stalks' THEN 'COT' ELSE 'CHL' END || 
  '-' || TO_CHAR(p.procurement_date, 'YYYYMMDD') || 
  '-' || LPAD(
    (SELECT daily_num FROM temp_procurement_order t 
     WHERE t.id = p.id)::TEXT, 4, '0'
  )
FROM temp_procurement_order t
WHERE t.id = p.id;

-- Step 4: Show the fixed procurement IDs
SELECT 
  'FIXED PROCUREMENT IDs (Continuous Numbering)' as info,
  procurement_id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY procurement_date ASC, created_at ASC;

-- Step 5: Clean up
DROP TABLE IF EXISTS temp_procurement_order;

SELECT '✅ Procurement IDs now have continuous numbering across all sources!' as status;
