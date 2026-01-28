-- MINIMAL FIX - Only Procurement Records
-- This fixes ONLY the procurement records display issue

-- Drop existing procurement policies (safe)
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;

-- Create simple permissive policy
CREATE POLICY "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement 
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS (safe)
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Show results
SELECT '✅ MINIMAL FIX APPLIED!' as status;
SELECT COUNT(*) as total_records FROM raw_biomass_procurement;
