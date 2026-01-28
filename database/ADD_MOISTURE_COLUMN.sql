-- Add Moisture column to raw_biomass_procurement table
-- This script adds a new column to store moisture percentage values

-- Add the moisture column as a numeric field with decimal precision
ALTER TABLE raw_biomass_procurement 
ADD COLUMN moisture DECIMAL(5,2);

-- Add comment to describe the column
COMMENT ON COLUMN raw_biomass_procurement.moisture IS 'Moisture percentage value (e.g., 12.50 for 12.50%)';

-- Optional: Add index if you plan to query by moisture values frequently
-- CREATE INDEX idx_raw_biomass_procurement_moisture ON raw_biomass_procurement(moisture);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
AND column_name = 'moisture';
