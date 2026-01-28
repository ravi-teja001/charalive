# ⚠️ URGENT: Fix "Table Not Found" Error

## The Error You're Seeing:
```
Could not find the table 'public.raw_biomass_procurement' in the schema cache
```

## ✅ Quick Fix (2 Steps):

### Step 1: Go to Supabase SQL Editor
1. Open: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Run This SQL

**Option A: Create just the missing table (QUICKEST)**
- Copy the ENTIRE contents of `database/create_raw_biomass_table.sql`
- Paste into SQL Editor
- Click **Run**

**Option B: Create all tables (RECOMMENDED)**
- Copy the ENTIRE contents of `database/schema.sql` (158 lines)
- Paste into SQL Editor  
- Click **Run**

### Step 3: Verify It Worked
1. Click **Table Editor** in left sidebar
2. You should see `raw_biomass_procurement` in the list
3. Refresh your browser (F5)
4. Try submitting the form again

## 🔍 Why This Happened:
The database tables haven't been created yet. Supabase is a fresh database and needs the SQL schema to be run manually.

## ⚡ Fastest Solution:
1. Open `database/create_raw_biomass_table.sql` 
2. Copy ALL of it
3. Paste in Supabase SQL Editor
4. Click Run
5. Refresh browser

That's it! The table will be created and the error will go away.
