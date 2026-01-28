-- PERMANENT USER ISOLATION FIX - Works for ALL Users
-- This creates a universal system that works for any user who logs in

-- Step 1: Create a function to handle user identification
CREATE OR REPLACE FUNCTION public.get_current_user_identifier()
RETURNS TEXT AS $$
BEGIN
  -- Try to get the authenticated user's email first
  DECLARE
    user_email TEXT;
    user_id TEXT;
  BEGIN
    SELECT auth.email() INTO user_email;
    SELECT auth.uid() INTO user_id;
  EXCEPTION WHEN OTHERS THEN
    -- If auth fails, return null
    RETURN NULL;
  END;
  
  -- Return email if available, otherwise user ID
  RETURN COALESCE(user_email, user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Allow teja user records" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Allow insert for teja" ON raw_biomass_procurement;

-- Step 3: Create universal policies that work for ALL users
CREATE POLICY "Users can view own procurement records" ON raw_biomass_procurement
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email OR
    auth.email() = created_by OR  -- Handle cases where created_by stores email
    public.get_current_user_identifier() = created_by_email
  );

CREATE POLICY "Users can insert own procurement records" ON raw_biomass_procurement
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR 
    auth.email() = created_by_email OR
    auth.email() = created_by OR
    public.get_current_user_identifier() = created_by_email
  );

CREATE POLICY "Users can update own procurement records" ON raw_biomass_procurement
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email OR
    auth.email() = created_by OR
    public.get_current_user_identifier() = created_by_email
  );

-- Step 4: Enable RLS
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Step 5: Update existing records to ensure they have proper email fields
UPDATE raw_biomass_procurement 
SET created_by_email = CASE 
  WHEN created_by_email IS NULL AND created_by LIKE '%@%' THEN created_by
  WHEN created_by_email IS NULL THEN 'unknown@example.com'
  ELSE created_by_email
END;

-- Step 6: Create trigger to automatically set created_by_email for new records
CREATE OR REPLACE FUNCTION public.set_user_context()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set the created_by_email based on authenticated user
  IF NEW.created_by_email IS NULL THEN
    NEW.created_by_email := COALESCE(auth.email(), 'unknown@example.com');
  END IF;
  
  -- Also set created_by if not provided
  IF NEW.created_by IS NULL THEN
    NEW.created_by := COALESCE(auth.uid(), auth.email(), 'unknown');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS set_user_context_trigger ON raw_biomass_procurement;
CREATE TRIGGER set_user_context_trigger
  BEFORE INSERT ON raw_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_context();

-- Step 7: Verification - Show records by user
SELECT 
  'RECORDS BY USER (Universal Fix Applied)' as info,
  created_by_email,
  COUNT(*) as record_count,
  STRING_AGG(vehicle_number, ', ') as vehicles
FROM raw_biomass_procurement 
WHERE created_by_email IS NOT NULL
GROUP BY created_by_email
ORDER BY record_count DESC;

SELECT '✅ Universal user isolation system is now active!' as status;
