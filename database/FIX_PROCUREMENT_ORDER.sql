-- FIX PROCUREMENT ID ORDERING
-- Update existing procurement IDs to be in proper sequential order

-- Step 1: Show current procurement IDs to see the issue
SELECT 
  'CURRENT PROCUREMENT IDs (Before Fix)' as info,
  procurement_id,
  created_at,
  procurement_date,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at ASC;

-- Step 2: Create a function to generate proper sequential IDs
CREATE OR REPLACE FUNCTION public.fix_procurement_ids()
RETURNS VOID AS $$
DECLARE
  procurement_record RECORD;
  counter INTEGER := 1;
  last_date DATE := NULL;
  last_source TEXT := NULL;
  source_counter INTEGER := 1;
BEGIN
  -- Drop existing IDs and recreate them in proper order
  FOR procurement_record IN 
    SELECT * FROM raw_biomass_procurement 
    ORDER BY procurement_date ASC, created_at ASC
  LOOP
    -- Reset counter for new date
    IF last_date IS NULL OR procurement_record.procurement_date != last_date THEN
      counter := 1;
      source_counter := 1;
      last_date := procurement_record.procurement_date;
    END IF;
    
    -- Reset source counter for new source
    IF last_source IS NULL OR 
       (procurement_record.source = 'cotton_stalks' AND last_source != 'cotton_stalks') OR
       (procurement_record.source = 'chilli_stalks' AND last_source != 'chilli_stalks') THEN
      source_counter := 1;
      last_source := procurement_record.source;
    END IF;
    
    -- Generate new procurement ID
    DECLARE new_procurement_id TEXT;
    DECLARE source_prefix TEXT;
    
    IF procurement_record.source = 'cotton_stalks' THEN
      source_prefix := 'COT';
    ELSE
      source_prefix := 'CHL';
    END IF;
    
    -- Format date as YYYYMMDD
    DECLARE date_str TEXT;
    date_str := TO_CHAR(procurement_record.procurement_date, 'YYYYMMDD');
    
    -- Create sequential ID
    new_procurement_id := 'BMP-' || source_prefix || '-' || date_str || '-' || LPAD(source_counter::TEXT, 4, '0');
    
    -- Update the record
    UPDATE raw_biomass_procurement 
    SET procurement_id = new_procurement_id
    WHERE id = procurement_record.id;
    
    -- Increment counter
    source_counter := source_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Run the fix
SELECT public.fix_procurement_ids();

-- Step 4: Show the fixed procurement IDs
SELECT 
  'FIXED PROCUREMENT IDs (After Fix)' as info,
  procurement_id,
  created_at,
  procurement_date,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY procurement_date ASC, created_at ASC;

-- Step 5: Clean up
DROP FUNCTION IF EXISTS public.fix_procurement_ids();

SELECT '✅ Procurement IDs are now in proper order!' as status;
