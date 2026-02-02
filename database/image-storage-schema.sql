-- Alternative schema for storing images directly in database
-- Add these columns to existing tables if you want to store base64 image data

-- For raw_biomass_procurement table
ALTER TABLE raw_biomass_procurement 
ADD COLUMN vehicle_photo_data TEXT,  -- Base64 encoded vehicle photo
ADD COLUMN weight_photo_data TEXT,   -- Base64 encoded weight photo
ADD COLUMN moisture_photo_data TEXT; -- Base64 encoded moisture photo

-- For expenses table  
ALTER TABLE expenses
ADD COLUMN receipt_data TEXT;       -- Base64 encoded receipt

-- For processed_biomass_procurement table
ALTER TABLE processed_biomass_procurement
ADD COLUMN vehicle_photo_data TEXT,
ADD COLUMN weight_photo_data TEXT;

-- Note: Storing images directly in database has pros/cons:
-- PROS: All data in one place, no external dependencies
-- CONS: Larger database size, slower queries, backup complexity
