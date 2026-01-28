-- Add procurement_id column to raw_biomass_procurement table
-- This script adds a new column to store human-readable procurement IDs

-- Add the procurement_id column as a text field
ALTER TABLE raw_biomass_procurement 
ADD COLUMN procurement_id TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN raw_biomass_procurement.procurement_id IS 'Human-readable procurement ID (e.g., PROC-20250127-143045-123)';

-- Create index for faster queries on procurement_id
CREATE INDEX idx_raw_biomass_procurement_procurement_id ON raw_biomass_procurement(procurement_id);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
AND column_name = 'procurement_id';
