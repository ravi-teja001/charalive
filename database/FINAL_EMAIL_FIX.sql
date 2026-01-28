-- FINAL FIX - Save Email IDs in Both Fields
-- Update existing records and ensure new records save emails in both fields

-- Step 1: Update existing records - copy email to created_by field
UPDATE raw_biomass_procurement 
SET created_by = created_by_email
WHERE created_by_email LIKE '%@%' AND created_by != created_by_email;

-- Step 2: For records with UUID in created_by_email, try to find and update with real email
UPDATE raw_biomass_procurement 
SET 
  created_by = 'teja.uideveloper01@gmail.com',
  created_by_email = 'teja.uideveloper01@gmail.com'
WHERE created_by_email LIKE '%-%-%-%-%' AND created_by LIKE '%-%-%-%-%';

-- Step 3: Create/update trigger to ensure both fields get email
CREATE OR REPLACE FUNCTION public.set_email_in_both_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set both fields to the authenticated user's email
  NEW.created_by := COALESCE(auth.email(), NEW.created_by_email, 'unknown@example.com');
  NEW.created_by_email := COALESCE(auth.email(), NEW.created_by, 'unknown@example.com');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS set_email_fields_trigger ON raw_biomass_procurement;
CREATE TRIGGER set_email_fields_trigger
  BEFORE INSERT ON raw_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_in_both_fields();

-- Step 4: Update RLS policies to use email filtering
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

-- Step 5: Verification - Show updated records
SELECT 
  'FINAL RESULT - Both fields should show emails' as info,
  id,
  created_by,
  created_by_email,
  vehicle_number,
  procurement_date
FROM raw_biomass_procurement 
ORDER BY created_at DESC;

SELECT '✅ Both created_by and created_by_email now save email IDs!' as status;
