-- Fix for missing created_by_email column
-- Run this in your Supabase SQL Editor

-- Step 1: Add the missing column
ALTER TABLE raw_biomass_procurement 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_raw_biomass_procurement_created_by_email 
ON raw_biomass_procurement(created_by_email);

-- Step 3: Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
AND column_name IN ('created_by', 'created_by_email');
