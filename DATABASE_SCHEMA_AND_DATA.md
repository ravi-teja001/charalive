# Database Schema and Sample Data

## Overview
This document contains the complete database schema with column headers and sample data from all tables in the Supabase database.

---

## 1. **profiles** Table
**Rows:** 9 | **RLS:** Disabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | - | Primary key (references auth.users.id) |
| email | text | YES | - | User email address |
| phone | text | YES | - | User phone number |
| role | text | YES | 'supervisor' | User role (supervisor_stockpoint, incharge, supervisor_plant) |
| created_at | timestamptz | YES | now() | Account creation timestamp |
| stock_point_id | uuid | YES | - | Foreign key to stock_points.id |
| phase | text | YES | 'phase1' | Phase (phase1 or phase2) |
| updated_at | timestamptz | YES | timezone('utc', now()) | Last update timestamp |

### Foreign Keys:
- `id` → `auth.users.id`
- `stock_point_id` → `stock_points.id`

---

## 2. **stock_points** Table
**Rows:** 3 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Stock point name (unique) |
| location | text | YES | - | Stock point location |
| is_active | boolean | YES | true | Active status |
| created_at | timestamptz | NO | timezone('utc', now()) | Creation timestamp |
| updated_at | timestamptz | NO | timezone('utc', now()) | Last update timestamp |

---

## 3. **processing_plants** Table
**Rows:** 2 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Plant name (unique) |
| location | text | YES | - | Plant location |
| is_active | boolean | YES | true | Active status |
| created_at | timestamptz | NO | timezone('utc', now()) | Creation timestamp |
| updated_at | timestamptz | NO | timezone('utc', now()) | Last update timestamp |

---

## 4. **vehicles** Table
**Rows:** 13 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vehicle_number | text | NO | - | Vehicle number (unique) |
| vehicle_type | text | NO | - | Type of vehicle |
| weight_kg | numeric | NO | - | Vehicle weight in kg |
| created_at | timestamptz | YES | now() | Creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |
| created_by | uuid | YES | - | Foreign key to auth.users.id |
| name | text | YES | - | Vehicle name/description |
| district | text | YES | - | District |
| village | text | YES | - | Village |
| state | text | YES | - | State |

### Foreign Keys:
- `created_by` → `auth.users.id`

---

## 5. **raw_biomass_procurement** Table
**Rows:** 64 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| stock_point_id | uuid | NO | - | Foreign key to stock_points.id |
| source | text | NO | - | Source type (cotton_stalks or chilli_stalks) |
| vehicle_number | text | NO | - | Vehicle number |
| vehicle_weight | numeric | NO | - | Vehicle weight in kg |
| vehicle_photo | text | YES | - | Vehicle photo URL |
| gross_weight | numeric | NO | - | Gross weight in kg |
| weight_record_photo | text | YES | - | Weight record photo URL |
| net_weight | numeric | NO | - | Net weight in kg |
| procurement_date | date | NO | - | Procurement date |
| created_by | uuid | YES | - | Foreign key to auth.users.id |
| location_latitude | numeric | YES | - | GPS latitude |
| location_longitude | numeric | YES | - | GPS longitude |
| geojson_data | jsonb | YES | - | GeoJSON location data |
| created_at | timestamptz | YES | now() | Creation timestamp |
| name | text | YES | - | Note/name field |
| state | text | YES | - | State |
| district | text | YES | - | District |
| village | text | YES | - | Village |
| vehicle_type | text | YES | - | Vehicle type |

### Foreign Keys:
- `stock_point_id` → `stock_points.id`

---

## 6. **expenses** Table
**Rows:** 3 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| stock_point_id | uuid | NO | - | Foreign key to stock_points.id |
| incharge_id | uuid | NO | - | Foreign key to auth.users.id |
| expense_date | date | NO | - | Expense date |
| expense_amount | numeric | NO | - | Amount (>= 0) |
| expense_type | text | NO | - | Type: 'Fuel Expenses', 'Cash Advance', or 'Other Expenses' |
| payment_mode | text | NO | - | Payment mode: 'Cash' or 'UPI' |
| receipt_url | text | YES | - | Receipt photo URL |
| receipt_file_name | text | YES | - | Receipt file name |
| description | text | YES | - | Expense description |
| created_at | timestamptz | NO | timezone('utc', now()) | Creation timestamp |
| updated_at | timestamptz | NO | timezone('utc', now()) | Last update timestamp |

### Foreign Keys:
- `stock_point_id` → `stock_points.id`
- `incharge_id` → `auth.users.id`

### Constraints:
- `expense_amount >= 0`
- `expense_type` IN ('Fuel Expenses', 'Cash Advance', 'Other Expenses')
- `payment_mode` IN ('Cash', 'UPI')

---

## 7. **processed_biomass_procurement** Table
**Rows:** 0 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| supervisor_id | uuid | NO | - | Foreign key to auth.users.id |
| plant_id | uuid | NO | - | Foreign key to processing_plants.id |
| source_stock_point_id | uuid | NO | - | Foreign key to stock_points.id |
| vehicle_number | text | NO | - | Vehicle number |
| vehicle_type | text | NO | - | Vehicle type |
| vehicle_weight_kg | numeric | NO | - | Vehicle weight in kg |
| is_custom_vehicle | boolean | YES | false | Custom vehicle flag |
| vehicle_photo_url | text | YES | - | Vehicle photo URL |
| vehicle_photo_latitude | numeric | YES | - | Vehicle photo GPS latitude |
| vehicle_photo_longitude | numeric | YES | - | Vehicle photo GPS longitude |
| gross_weight_kg | numeric | NO | - | Gross weight in kg |
| weight_record_photo_url | text | YES | - | Weight record photo URL |
| weight_record_photo_latitude | numeric | YES | - | Weight record photo GPS latitude |
| weight_record_photo_longitude | numeric | YES | - | Weight record photo GPS longitude |
| net_weight_kg | numeric | NO | - | Net weight in kg |
| procurement_date | timestamptz | NO | - | Procurement date |
| submitted_at | timestamptz | NO | timezone('utc', now()) | Submission timestamp |
| created_at | timestamptz | NO | timezone('utc', now()) | Creation timestamp |

### Foreign Keys:
- `supervisor_id` → `auth.users.id`
- `plant_id` → `processing_plants.id`
- `source_stock_point_id` → `stock_points.id`

---

## 8. **biochar_deployment** Table
**Rows:** 0 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| supervisor_id | uuid | NO | - | Foreign key to auth.users.id |
| plant_id | uuid | NO | - | Foreign key to processing_plants.id |
| farmer_name | text | NO | - | Farmer name |
| mobile_number | text | YES | - | Mobile number |
| aadhaar_number | text | YES | - | Aadhaar number |
| village | text | NO | - | Village |
| mandal | text | NO | - | Mandal |
| district | text | NO | - | District |
| land_area_acres | numeric | NO | - | Land area in acres |
| biochar_weight_kg | numeric | NO | - | Biochar weight in kg |
| number_of_bags | integer | NO | - | Number of bags (> 0) |
| kml_data | text | YES | - | KML location data |
| deployment_date | timestamptz | NO | timezone('utc', now()) | Deployment date |
| created_at | timestamptz | NO | timezone('utc', now()) | Creation timestamp |
| updated_at | timestamptz | NO | timezone('utc', now()) | Last update timestamp |

### Foreign Keys:
- `supervisor_id` → `auth.users.id`
- `plant_id` → `processing_plants.id`

### Constraints:
- `number_of_bags > 0`

---

## 9. **procurement_records** Table
**Rows:** 0 | **RLS:** Enabled

### Column Headers:
| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| supervisor_id | uuid | YES | - | Foreign key to auth.users.id |
| source_of_biomass | text | NO | - | Source: 'Own' or 'Vendor' |
| vehicle_number | text | YES | - | Vehicle number |
| vehicle_type | text | YES | - | Vehicle type |
| vehicle_weight_kg | numeric | YES | - | Vehicle weight in kg |
| is_custom_vehicle | boolean | YES | false | Custom vehicle flag |
| vehicle_photo_url | text | YES | - | Vehicle photo URL |
| vehicle_photo_latitude | numeric | YES | - | Vehicle photo GPS latitude |
| vehicle_photo_longitude | numeric | YES | - | Vehicle photo GPS longitude |
| gross_weight_kg | numeric | NO | - | Gross weight in kg |
| weight_record_photo_url | text | YES | - | Weight record photo URL |
| weight_record_photo_latitude | numeric | YES | - | Weight record photo GPS latitude |
| weight_record_photo_longitude | numeric | YES | - | Weight record photo GPS longitude |
| net_weight_kg | numeric | NO | - | Net weight in kg |
| procurement_date | timestamptz | YES | now() | Procurement date |
| submitted_at | timestamptz | YES | now() | Submission timestamp |
| created_at | timestamptz | YES | now() | Creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |
| stock_point_id | uuid | YES | - | Foreign key to stock_points.id |
| phase | text | YES | 'phase1' | Phase (phase1 or phase2) |

### Foreign Keys:
- `supervisor_id` → `auth.users.id`
- `stock_point_id` → `stock_points.id`

### Constraints:
- `source_of_biomass` IN ('Own', 'Vendor')
- `phase` IN ('phase1', 'phase2')

---

## Summary Statistics

| Table Name | Total Rows | RLS Enabled |
|-----------|------------|------------|
| profiles | 9 | No |
| stock_points | 3 | Yes |
| processing_plants | 2 | Yes |
| vehicles | 13 | Yes |
| raw_biomass_procurement | 64 | Yes |
| expenses | 3 | Yes |
| processed_biomass_procurement | 0 | Yes |
| biochar_deployment | 0 | Yes |
| procurement_records | 0 | Yes |

---

## Notes

1. **RLS (Row Level Security):** Most tables have RLS enabled except `profiles`.
2. **Primary Keys:** All tables use UUID primary keys generated with `gen_random_uuid()`.
3. **Timestamps:** Most tables have `created_at` and `updated_at` timestamps with UTC timezone.
4. **Foreign Keys:** All user references point to `auth.users.id` (Supabase Auth).
5. **Data Types:** 
   - Weights are stored as `numeric` (supports decimals)
   - Dates use `date` or `timestamptz` depending on precision needed
   - Photos are stored as text URLs (likely Supabase Storage URLs)

---

*Generated: January 19, 2026*
