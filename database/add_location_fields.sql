-- Add location and geojson_data fields to raw_biomass_procurement table
ALTER TABLE raw_biomass_procurement 
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geojson_data JSONB;

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_raw_biomass_location ON raw_biomass_procurement(location_latitude, location_longitude);
