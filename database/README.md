# Database Setup Instructions

## Setting up Supabase Database

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project (or create a new one)

2. **Run the SQL Schema**
   - Navigate to SQL Editor in the Supabase dashboard
   - Copy the contents of `schema.sql`
   - Paste and execute it in the SQL Editor
   - This will create all the necessary tables, indexes, and seed data

3. **Verify Tables Created**
   - Go to Table Editor in Supabase dashboard
   - You should see the following tables:
     - users
     - stock_points
     - plants
     - vehicles
     - raw_biomass_procurement
     - expenses
     - processed_biomass_procurement
     - biochar_deployment

4. **Check Seed Data**
   - The schema includes seed data for:
     - 5 Stock Points
     - 2 Plants
     - 5 Vehicles
   - You can verify these in the Table Editor

## Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## Notes

- Row Level Security (RLS) is enabled on all tables
- Currently, policies allow all operations for development
- You may want to customize RLS policies for production based on user roles
- All timestamps are stored in UTC (TIMESTAMPTZ)
