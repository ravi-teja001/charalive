-- Add created_by_email column for user filtering
-- Run this in your Supabase SQL Editor

-- Add the email column to procurement table
ALTER TABLE raw_biomass_procurement 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_raw_biomass_procurement_created_by_email 
ON raw_biomass_procurement(created_by_email);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'raw_biomass_procurement' 
AND column_name = 'created_by_email';
