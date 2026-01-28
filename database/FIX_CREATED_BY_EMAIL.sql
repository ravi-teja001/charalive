-- FIX created_by FIELD TO USE EMAIL IDs
-- Update existing records and ensure new records use emails instead of UUIDs

-- Step 1: Update existing records to use email in created_by field
UPDATE raw_biomass_procurement 
SET created_by = created_by_email
WHERE created_by_email IS NOT NULL AND created_by_email LIKE '%@%';

-- Step 2: For records where created_by_email is null but created_by looks like email, copy it
UPDATE raw_biomass_procurement 
SET created_by_email = created_by
WHERE created_by_email IS NULL AND created_by LIKE '%@%';

-- Step 3: Update the app's record creation logic to use email instead of UUID
-- (This will be handled in the API code)

-- Step 4: Create trigger to ensure created_by always contains email
CREATE OR REPLACE FUNCTION public.set_email_as_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Always use email for created_by field
  IF NEW.created_by_email IS NOT NULL AND NEW.created_by_email LIKE '%@%' THEN
    NEW.created_by := NEW.created_by_email;
  ELSIF auth.email() IS NOT NULL THEN
    NEW.created_by := auth.email();
    NEW.created_by_email := auth.email();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS set_email_trigger ON raw_biomass_procurement;
CREATE TRIGGER set_email_trigger
  BEFORE INSERT ON raw_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_as_created_by();

-- Step 5: Update RLS policies to use email filtering
DROP POLICY IF EXISTS "Users can view own procurement records" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Users can insert own procurement records" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Users can update own procurement records" ON raw_biomass_procurement;

CREATE POLICY "Users can view own procurement records" ON raw_biomass_procurement
  FOR SELECT USING (
    created_by = auth.email() OR 
    created_by_email = auth.email()
  );

CREATE POLICY "Users can insert own procurement records" ON raw_biomass_procurement
  FOR INSERT WITH CHECK (
    created_by = auth.email() OR 
    created_by_email = auth.email()
  );

CREATE POLICY "Users can update own procurement records" ON raw_biomass_procurement
  FOR UPDATE USING (
    created_by = auth.email() OR 
    created_by_email = auth.email()
  );

-- Step 6: Verification - Show updated records
SELECT 
  'UPDATED RECORDS (created_by now contains emails)' as info,
  id,
  created_by,
  created_by_email,
  vehicle_number,
  procurement_date
FROM raw_biomass_procurement 
ORDER BY created_at DESC;

SELECT '✅ created_by field now uses email IDs!' as status;
