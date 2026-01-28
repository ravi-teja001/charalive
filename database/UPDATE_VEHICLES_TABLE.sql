-- UPDATE VEHICLES TABLE SCHEMA
-- Add missing columns for vehicle management
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add created_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'created_by') THEN
    ALTER TABLE vehicles ADD COLUMN created_by UUID REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON vehicles(created_by);
  END IF;

  -- Add name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'name') THEN
    ALTER TABLE vehicles ADD COLUMN name TEXT;
  END IF;

  -- Add state column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'state') THEN
    ALTER TABLE vehicles ADD COLUMN state TEXT;
  END IF;

  -- Add district column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'district') THEN
    ALTER TABLE vehicles ADD COLUMN district TEXT;
  END IF;

  -- Add sub_district column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'sub_district') THEN
    ALTER TABLE vehicles ADD COLUMN sub_district TEXT;
  END IF;

  -- Add village column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'village') THEN
    ALTER TABLE vehicles ADD COLUMN village TEXT;
  END IF;

  -- Change id from TEXT to UUID if needed (optional, only if using UUID)
  -- Check if id is TEXT, if so keep it (don't change as it might break existing data)
  
  -- Update weight column name if it exists as 'weight' instead of 'weight_kg'
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'weight') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'weight_kg') THEN
    ALTER TABLE vehicles RENAME COLUMN weight TO weight_kg;
  END IF;

  -- Update type column check constraint to allow more vehicle types
  -- Drop old constraint if it exists
  ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_type_check;
  -- Add new constraint allowing more types
  ALTER TABLE vehicles ADD CONSTRAINT vehicles_type_check 
    CHECK (type IN ('Truck', 'Trailer', 'Tempo', 'Auto', 'Other', 'registered', 'other'));
END $$;

-- Step 2: Verify columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vehicles'
ORDER BY ordinal_position;

-- Step 3: Fix RLS policies (run FIX_VEHICLES_RLS.sql separately if needed)

SELECT '✅ Vehicles table updated!' as status;
