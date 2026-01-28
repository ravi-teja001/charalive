-- Add email field to raw_biomass_procurement table for development/testing
-- This allows storing email addresses alongside UUID references

ALTER TABLE raw_biomass_procurement 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_raw_biomass_procurement_created_by_email 
ON raw_biomass_procurement(created_by_email);

-- Add comment for documentation
COMMENT ON COLUMN raw_biomass_procurement.created_by_email IS 'Email address of user who created the record (for development/fallback purposes)';
