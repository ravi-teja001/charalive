-- Add chilli_stalks to raw_biomass_procurement source constraint
ALTER TABLE raw_biomass_procurement DROP CONSTRAINT IF EXISTS raw_biomass_procurement_source_check;
ALTER TABLE raw_biomass_procurement ADD CONSTRAINT raw_biomass_procurement_source_check
  CHECK (source IN ('cotton_stalks', 'chickpea_hulls', 'chilli_stalks', 'own', 'vendor'));
