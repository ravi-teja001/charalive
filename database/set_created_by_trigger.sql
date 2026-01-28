-- Create a trigger to automatically set created_by if not provided
-- This ensures created_by is always set to the authenticated user's ID

-- First, drop the trigger if it exists
DROP TRIGGER IF EXISTS set_raw_biomass_procurement_created_by ON raw_biomass_procurement;

-- Create the trigger function
CREATE OR REPLACE FUNCTION set_raw_biomass_procurement_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is NULL or empty, set it to the current authenticated user
  IF NEW.created_by IS NULL OR NEW.created_by = '' THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER set_raw_biomass_procurement_created_by
  BEFORE INSERT ON raw_biomass_procurement
  FOR EACH ROW
  EXECUTE FUNCTION set_raw_biomass_procurement_created_by();

-- Add a comment
COMMENT ON TRIGGER set_raw_biomass_procurement_created_by ON raw_biomass_procurement IS 
  'Automatically sets created_by to the authenticated user ID if not provided';
