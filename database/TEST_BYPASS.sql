-- TEST BYPASS - Show All Records Without Filtering
-- This will help identify if filtering is the issue

-- Temporarily disable RLS completely
ALTER TABLE raw_biomass_procurement DISABLE ROW LEVEL SECURITY;

-- Show all records with user info
SELECT 
  'ALL RECORDS (No RLS)' as info,
  id,
  created_by,
  created_by_email,
  vehicle_number,
  procurement_date,
  source
FROM raw_biomass_procurement 
ORDER BY created_at DESC;

-- Re-enable RLS after testing
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Keep permissive policy
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;
CREATE POLICY "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement 
  FOR ALL USING (true) WITH CHECK (true);
