-- ADD SUB_DISTRICT COLUMN TO VEHICLES TABLE
-- Run this in Supabase SQL Editor to add the sub_district column

DO $$ 
BEGIN
  -- Add sub_district column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'vehicles' 
                 AND column_name = 'sub_district') THEN
    ALTER TABLE vehicles ADD COLUMN sub_district TEXT;
    RAISE NOTICE '✅ sub_district column added successfully';
  ELSE
    RAISE NOTICE 'ℹ️ sub_district column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vehicles'
  AND column_name = 'sub_district';

SELECT '✅ Sub District column migration completed!' as status;
