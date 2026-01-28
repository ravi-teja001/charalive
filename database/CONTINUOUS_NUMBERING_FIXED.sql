-- FIX PROCUREMENT IDs - CONTINUOUS NUMBERING (Fixed Syntax)
-- Update procurement IDs to have continuous numbering across all sources

-- Step 1: Show current procurement IDs
SELECT 
  'CURRENT PROCUREMENT IDs (Before Fix)' as info,
  procurement_id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY created_at ASC;

-- Step 2: Create function to generate continuous sequential IDs
CREATE OR REPLACE FUNCTION public.fix_continuous_procurement_ids()
RETURNS VOID AS $$
DECLARE
  procurement_record RECORD;
  counter INTEGER := 1;
  last_date DATE := NULL;
  new_procurement_id TEXT;
  source_prefix TEXT;
  date_str TEXT;
BEGIN
  -- Drop existing IDs and recreate them in proper order
  FOR procurement_record IN 
    SELECT * FROM raw_biomass_procurement 
    ORDER BY procurement_date ASC, created_at ASC
  LOOP
    -- Reset counter for new date
    IF last_date IS NULL OR procurement_record.procurement_date != last_date THEN
      counter := 1;
      last_date := procurement_record.procurement_date;
    END IF;
    
    -- Get source prefix
    IF procurement_record.source = 'cotton_stalks' THEN
      source_prefix := 'COT';
    ELSE
      source_prefix := 'CHL';
    END IF;
    
    -- Format date as YYYYMMDD
    date_str := TO_CHAR(procurement_record.procurement_date, 'YYYYMMDD');
    
    -- Create continuous sequential ID
    new_procurement_id := 'BMP-' || source_prefix || '-' || date_str || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- Update the record
    UPDATE raw_biomass_procurement 
    SET procurement_id = new_procurement_id
    WHERE id = procurement_record.id;
    
    -- Increment counter for next record (continuous across all sources)
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Run the fix
SELECT public.fix_continuous_procurement_ids();

-- Step 4: Show the fixed procurement IDs
SELECT 
  'FIXED PROCUREMENT IDs (Continuous Numbering)' as info,
  procurement_id,
  created_at,
  procurement_date,
  source,
  vehicle_number
FROM raw_biomass_procurement 
ORDER BY procurement_date ASC, created_at ASC;

-- Step 5: Clean up
DROP FUNCTION IF EXISTS public.fix_continuous_procurement_ids();

SELECT '✅ Procurement IDs now have continuous numbering across all sources!' as status;
