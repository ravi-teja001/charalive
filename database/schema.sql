-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Points table
CREATE TABLE IF NOT EXISTS stock_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  vehicle_number TEXT UNIQUE NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registered', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw Biomass Procurement table
CREATE TABLE IF NOT EXISTS raw_biomass_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_point_id TEXT NOT NULL REFERENCES stock_points(id),
  source TEXT NOT NULL CHECK (source IN ('own', 'vendor')),
  vehicle_number TEXT NOT NULL,
  vehicle_weight DECIMAL(10, 2) NOT NULL,
  vehicle_photo TEXT,
  gross_weight DECIMAL(10, 2) NOT NULL,
  weight_record_photo TEXT,
  net_weight DECIMAL(10, 2) NOT NULL,
  procurement_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  geojson_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_point_id TEXT NOT NULL REFERENCES stock_points(id),
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fuel', 'cash_advance', 'other')),
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi')),
  receipt_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processed Biomass Procurement table
CREATE TABLE IF NOT EXISTS processed_biomass_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id TEXT NOT NULL REFERENCES plants(id),
  source_stock_point_id TEXT NOT NULL REFERENCES stock_points(id),
  vehicle_number TEXT NOT NULL,
  vehicle_weight DECIMAL(10, 2) NOT NULL,
  vehicle_photo TEXT,
  gross_weight DECIMAL(10, 2) NOT NULL,
  weight_record_photo TEXT,
  net_weight DECIMAL(10, 2) NOT NULL,
  procurement_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biochar Deployment table
CREATE TABLE IF NOT EXISTS biochar_deployment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id TEXT NOT NULL REFERENCES plants(id),
  farmer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  village TEXT NOT NULL,
  mandal TEXT NOT NULL,
  district TEXT NOT NULL,
  land_area DECIMAL(10, 2) NOT NULL,
  biochar_weight DECIMAL(10, 2) NOT NULL,
  number_of_bags INTEGER NOT NULL,
  kml_data TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_biomass_stock_point ON raw_biomass_procurement(stock_point_id);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_date ON raw_biomass_procurement(procurement_date);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_location ON raw_biomass_procurement(location_latitude, location_longitude);
CREATE INDEX IF NOT EXISTS idx_expenses_stock_point ON expenses(stock_point_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_processed_biomass_plant ON processed_biomass_procurement(plant_id);
CREATE INDEX IF NOT EXISTS idx_processed_biomass_date ON processed_biomass_procurement(procurement_date);
CREATE INDEX IF NOT EXISTS idx_biochar_deployment_plant ON biochar_deployment(plant_id);
CREATE INDEX IF NOT EXISTS idx_biochar_deployment_date ON biochar_deployment(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_biomass_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE biochar_deployment ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - you can customize based on your needs)
CREATE POLICY "Allow all operations on stock_points" ON stock_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on plants" ON plants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on processed_biomass_procurement" ON processed_biomass_procurement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on biochar_deployment" ON biochar_deployment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Insert seed data
INSERT INTO stock_points (id, name, location) VALUES
  ('sp1', 'Stock Point - Warangal', 'Warangal, Telangana'),
  ('sp2', 'Stock Point - Karimnagar', 'Karimnagar, Telangana'),
  ('sp3', 'Stock Point - Nizamabad', 'Nizamabad, Telangana'),
  ('sp4', 'Stock Point - Khammam', 'Khammam, Telangana'),
  ('sp5', 'Stock Point - Adilabad', 'Adilabad, Telangana')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plants (id, name, location) VALUES
  ('plant1', 'Biochar Processing Plant - Hyderabad', 'Hyderabad, Telangana'),
  ('plant2', 'Biochar Processing Plant - Vijayawada', 'Vijayawada, Andhra Pradesh')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, vehicle_number, weight, type) VALUES
  ('v1', 'TS09AB1234', 2500, 'registered'),
  ('v2', 'TS09CD5678', 3000, 'registered'),
  ('v3', 'AP07EF9012', 2800, 'registered'),
  ('v4', 'TS10GH3456', 3500, 'registered'),
  ('v5', 'AP05IJ7890', 2200, 'registered')
ON CONFLICT (id) DO NOTHING;
