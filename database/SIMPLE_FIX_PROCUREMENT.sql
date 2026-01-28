-- Simple Fix for Procurement Records Display (No Conflicts)
-- This fixes only the procurement records issue without touching existing tables

-- Step 1: Drop only procurement-related policies (safe)
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Users can view own procurement records" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Users can insert own procurement records" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Users can update own procurement records" ON raw_biomass_procurement;

-- Step 2: Create simple permissive policy for procurement only
CREATE POLICY "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement 
  FOR ALL USING (true) WITH CHECK (true);

-- Step 3: Ensure RLS is enabled (safe)
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Step 4: Fix null created_by_email fields (safe)
UPDATE raw_biomass_procurement 
SET created_by_email = COALESCE(created_by_email, 'user@example.com')
WHERE created_by_email IS NULL;

-- Step 5: Verification
SELECT '✅ Simple fix applied!' as status;
SELECT COUNT(*) as total_records FROM raw_biomass_procurement;
SELECT 
  id,
  created_by,
  created_by_email,
  procurement_date,
  vehicle_number,
  source
FROM raw_biomass_procurement 
ORDER BY created_at DESC 
LIMIT 3;
