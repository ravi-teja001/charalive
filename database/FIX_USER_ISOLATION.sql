-- Fix User Data Isolation - Run this to ensure users only see their own data

-- ============================================
-- STEP 1: Drop existing policies that allow all access
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on raw_biomass_procurement" ON raw_biomass_procurement;
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all operations on processed_biomass_procurement" ON processed_biomass_procurement;
DROP POLICY IF EXISTS "Allow all operations on biochar_deployment" ON biochar_deployment;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- ============================================
-- STEP 2: Create proper user-specific RLS policies
-- ============================================

-- Raw Biomass Procurement - Users can only see their own records
CREATE POLICY "Users can view own procurement records" ON raw_biomass_procurement
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can insert own procurement records" ON raw_biomass_procurement
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can update own procurement records" ON raw_biomass_procurement
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

-- Expenses - Users can only see their own records
CREATE POLICY "Users can view own expense records" ON expenses
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can insert own expense records" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can update own expense records" ON expenses
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

-- Processed Biomass Procurement - Users can only see their own records
CREATE POLICY "Users can view own processed procurement records" ON processed_biomass_procurement
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can insert own processed procurement records" ON processed_biomass_procurement
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

-- Biochar Deployment - Users can only see their own records
CREATE POLICY "Users can view own deployment records" ON biochar_deployment
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

CREATE POLICY "Users can insert own deployment records" ON biochar_deployment
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR 
    auth.email() = created_by_email
  );

-- Users table - Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STEP 3: Ensure RLS is enabled on all tables
-- ============================================
ALTER TABLE raw_biomass_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_biomass_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE biochar_deployment ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Add created_by_email column if it doesn't exist
-- ============================================
ALTER TABLE raw_biomass_procurement 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

ALTER TABLE processed_biomass_procurement 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

ALTER TABLE biochar_deployment 
ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- ============================================
-- STEP 5: Create trigger to automatically set created_by_email
-- ============================================
CREATE OR REPLACE FUNCTION public.set_created_by_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by_email = auth.email();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS set_procurement_email ON raw_biomass_procurement;
CREATE TRIGGER set_procurement_email
  BEFORE INSERT ON raw_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by_email();

DROP TRIGGER IF EXISTS set_expense_email ON expenses;
CREATE TRIGGER set_expense_email
  BEFORE INSERT ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by_email();

DROP TRIGGER IF EXISTS set_processed_procurement_email ON processed_biomass_procurement;
CREATE TRIGGER set_processed_procurement_email
  BEFORE INSERT ON processed_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by_email();

DROP TRIGGER IF EXISTS set_deployment_email ON biochar_deployment;
CREATE TRIGGER set_deployment_email
  BEFORE INSERT ON biochar_deployment
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by_email();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ User isolation policies created successfully!' as status;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('raw_biomass_procurement', 'expenses', 'processed_biomass_procurement', 'biochar_deployment', 'users')
ORDER BY tablename;
