-- QUICK FIX FOR DASHBOARD STATS
-- Check if there are any procurement records for today

-- Check today's records
SELECT 
  'TODAY RECORDS' as info,
  COUNT(*) as today_count,
  SUM(net_weight) as today_weight,
  TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') as today_date
FROM raw_biomass_procurement 
WHERE procurement_date = CURRENT_DATE;

-- Check all records
SELECT 
  'ALL RECORDS' as info,
  COUNT(*) as total_count,
  SUM(net_weight) as total_weight,
  created_by,
  created_by_email
FROM raw_biomass_procurement 
GROUP BY created_by, created_by_email
ORDER BY total_count DESC;
