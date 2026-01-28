# Quick Setup Guide

## ⚠️ IMPORTANT: Database Tables Must Be Created First!

The error "Could not find the table 'public.raw_biomass_procurement'" means the database tables don't exist yet.

## ✅ Step-by-Step Fix:

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Login to your account
- Select your project (or create a new one)

### 2. Open SQL Editor
- Click **SQL Editor** in the left sidebar
- Click **New Query** button

### 3. Run the Schema
- Open the file: `database/schema.sql` in your project
- **Copy the ENTIRE contents** of `database/schema.sql`
- Paste it into the SQL Editor in Supabase
- Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

### 4. Verify Tables Created
- Click **Table Editor** in the left sidebar
- You should see these tables:
  - ✅ `users`
  - ✅ `stock_points`
  - ✅ `plants`
  - ✅ `vehicles`
  - ✅ `raw_biomass_procurement` ← **This is the one you need!**
  - ✅ `expenses`
  - ✅ `processed_biomass_procurement`
  - ✅ `biochar_deployment`

### 5. Refresh Your Browser
- Go back to your application
- Refresh the page (F5 or Cmd+R)
- The table should now work!

## 🎯 What the Schema Does:
- Creates all database tables
- Adds indexes for better performance
- Sets up Row Level Security (RLS) policies
- Inserts seed data (5 stock points, 2 plants, 5 vehicles)

## ❓ If You Still Get Errors:
- Make sure you copied the **ENTIRE** schema.sql file
- Check that all SQL statements ran successfully
- Verify you're using the correct Supabase project
- Make sure your `.env.local` file has the correct Supabase URL and key

After running the SQL, your Raw Biomass Procurement page will show the table with all saved records!
