-- Add trailer, tempo, auto to vehicle_type CHECK constraint
-- Run in Railway Query tab or: psql $DATABASE_URL -f database/ADD_VEHICLE_TYPES.sql

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_type_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_type_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_vehicle_type_check
  CHECK (vehicle_type IN ('registered', 'tractor', 'truck', 'trailer', 'tempo', 'auto', 'other'));
