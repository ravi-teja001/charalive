# Database Setup Instructions

## IMPORTANT: Run These SQL Scripts in Supabase

You need to run the SQL scripts in your Supabase dashboard to create the tables. Follow these steps:

### Step 1: Create the Main Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the ENTIRE contents of `database/schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
8. Wait for it to complete successfully

### Step 2: Add Location Fields (Optional but Recommended)

1. In the SQL Editor, click **New Query** again
2. Copy the contents of `database/add_location_fields.sql`
3. Paste it into the SQL Editor
4. Click **Run**

### Step 3: Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `stock_points`
   - `plants`
   - `vehicles`
   - `raw_biomass_procurement`
   - `expenses`
   - `processed_biomass_procurement`
   - `biochar_deployment`

### Troubleshooting

If you get an error saying "table already exists":
- That's okay! The `IF NOT EXISTS` clauses will skip creating tables that already exist
- You can continue with the next step

If you get permission errors:
- Make sure you're logged in to Supabase
- Make sure you're using the correct project

### What These Scripts Do

1. **schema.sql**: Creates all the main tables with indexes, RLS policies, and seed data
2. **add_location_fields.sql**: Adds location and GeoJSON columns to the `raw_biomass_procurement` table

After running these scripts, refresh your browser and the application should work!
