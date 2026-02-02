-- Railway Postgres Schema - Clean migration from Supabase
-- Run this in Railway PostgreSQL after creating your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces Supabase auth.users + profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number TEXT NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('registered', 'tractor', 'truck', 'trailer', 'tempo', 'auto', 'other')),
  name TEXT,
  district TEXT,
  sub_district TEXT,
  village TEXT,
  state TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON vehicles(created_by);

-- Raw Biomass Procurement table
CREATE TABLE IF NOT EXISTS raw_biomass_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  procurement_id TEXT,
  stock_point_id TEXT REFERENCES stock_points(id),
  source TEXT NOT NULL CHECK (source IN ('cotton_stalks', 'chickpea_hulls', 'chilli_stalks', 'own', 'vendor')),
  vehicle_number TEXT NOT NULL,
  vehicle_weight DECIMAL(10, 2) NOT NULL,
  vehicle_photo TEXT,
  gross_weight DECIMAL(10, 2) NOT NULL,
  weight_record_photo TEXT,
  net_weight DECIMAL(10, 2) NOT NULL,
  procurement_date DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_by_email TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  geojson_data JSONB,
  name TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  vehicle_type TEXT,
  moisture DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_biomass_stock_point ON raw_biomass_procurement(stock_point_id);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_date ON raw_biomass_procurement(procurement_date);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_created_by ON raw_biomass_procurement(created_by);
CREATE INDEX IF NOT EXISTS idx_raw_biomass_created_by_email ON raw_biomass_procurement(created_by_email);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_point_id TEXT NOT NULL REFERENCES stock_points(id),
  expense_date DATE NOT NULL,
  expense_amount DECIMAL(10, 2) NOT NULL,
  expense_type TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  receipt_url TEXT,
  incharge_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_stock_point ON expenses(stock_point_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Processed Biomass Procurement table
CREATE TABLE IF NOT EXISTS processed_biomass_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id TEXT NOT NULL REFERENCES plants(id),
  source_stock_point_id TEXT NOT NULL REFERENCES stock_points(id),
  vehicle_number TEXT NOT NULL,
  vehicle_weight DECIMAL(10, 2) NOT NULL,
  vehicle_photo TEXT,
  vehicle_photo_latitude DECIMAL(10, 8),
  vehicle_photo_longitude DECIMAL(11, 8),
  gross_weight DECIMAL(10, 2) NOT NULL,
  weight_record_photo TEXT,
  weight_photo_latitude DECIMAL(10, 8),
  weight_photo_longitude DECIMAL(11, 8),
  net_weight DECIMAL(10, 2) NOT NULL,
  procurement_date DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processed_biomass_plant ON processed_biomass_procurement(plant_id);

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
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biochar_deployment_plant ON biochar_deployment(plant_id);

-- Seed data
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
