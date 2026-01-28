-- Create raw_biomass_procurement table (if it doesn't exist)
-- Run this in Supabase SQL Editor if the table is missing

-- First, make sure stock_points table exists (required for foreign key)
CREATE TABLE IF NOT EXISTS stock_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the raw_biomass_procurement table
CREATE TABLE IF NOT EXISTS raw_biomass_procurement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_point_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('own', 'vendor')),
  vehicle_number TEXT NOT NULL,
  vehicle_weight DECIMAL(10, 2) NOT NULL,
  vehicle_photo TEXT,
  gross_weight DECIMAL(10, 2) NOT NULL,
  weight_record_photo TEXT,
  net_weight DECIMAL(10, 2) NOT NULL,
  procurement_date DATE NOT NULL,
  created_by UUID,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  geojson_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint (do this separately to avoid issues)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'raw_biomass_procurement_stock_point_id_fkey'
  ) THEN
    ALTER TABLE raw_biomass_procurement 
    ADD CONSTRAINT raw_biomass_procurement_stock_point_id_fkey 
    FOREIGN KEY (stock_point_id) REFERENCES stock_points(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_raw_biomass_stock_point ON raw_biomass_procurement(stock_point_id);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_date ON raw_biomass_procurement(procurement_date);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_location ON raw_biomass_procurement(location_latitude, location_longitude);

-- Enable Row Level Security
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (allow all for now)
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;
CREATE POLICY "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement FOR ALL USING (true) WITH CHECK (true);

-- Insert sample stock points if they don't exist
INSERT INTO stock_points (id, name, location) VALUES
  ('sp1', 'Stock Point - Warangal', 'Warangal, Telangana')
ON CONFLICT (id) DO NOTHING;
