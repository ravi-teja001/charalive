-- USER FILTERING FIX - Match teja.uideveloper01@gmail.com records
-- This fixes the user ID/email mismatch for the specific user

-- First, let's see all records with their user info
SELECT 
  'RECORDS BY USER' as info,
  id,
  created_by,
  created_by_email,
  vehicle_number,
  procurement_date,
  source,
  CASE 
    WHEN created_by_email = 'teja.uideveloper01@gmail.com' THEN 'THIS USERS RECORDS'
    ELSE 'Other user records'
  END as record_type
FROM raw_biomass_procurement 
ORDER BY created_at DESC;

-- Now, let's create a policy that allows teja.uideveloper01@gmail.com to see their records
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;

-- Create policy that matches the actual user email in the database
CREATE POLICY "Allow teja user records" ON raw_biomass_procurement
  FOR SELECT USING (
    created_by_email = 'teja.uideveloper01@gmail.com' OR
    auth.email() = 'teja.uideveloper01@gmail.com' OR
    auth.uid() = created_by
  );

CREATE POLICY "Allow insert for teja" ON raw_biomass_procurement
  FOR INSERT WITH CHECK (
    auth.email() = 'teja.uideveloper01@gmail.com' OR
    created_by_email = 'teja.uideveloper01@gmail.com'
  );

-- Enable RLS
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;

-- Test the policy by simulating the user's view
SELECT 
  'TEJA USER VIEW (Should show 3 records)' as info,
  COUNT(*) as record_count
FROM raw_biomass_procurement 
WHERE created_by_email = 'teja.uideveloper01@gmail.com';
