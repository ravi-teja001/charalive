-- Update biomass source constraint to allow cotton_stalks and chilli_stalks
-- Run this in Supabase SQL Editor

-- Step 1: Drop the old constraint
ALTER TABLE raw_biomass_procurement 
DROP CONSTRAINT IF EXISTS raw_biomass_procurement_source_check;

-- Step 2: Update existing data
UPDATE raw_biomass_procurement 
SET source = 'cotton_stalks' 
WHERE source = 'own';

UPDATE raw_biomass_procurement 
SET source = 'chilli_stalks' 
WHERE source = 'vendor';

-- Step 3: Add new constraint with new values
ALTER TABLE raw_biomass_procurement 
ADD CONSTRAINT raw_biomass_procurement_source_check 
CHECK (source IN ('cotton_stalks', 'chilli_stalks'));
