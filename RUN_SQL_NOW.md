# 🚀 Automatic SQL Execution Guide

## Quick Setup - 3 Options

### Option 1: Use NPX Script (Recommended)
```bash
cd /Users/hamsi/Downloads/biochar-bloom-main
./run-sql-npx.sh
```

### Option 2: Manual NPX Commands
```bash
cd /Users/hamsi/Downloads/biochar-bloom-main

# Login to Supabase first
npx supabase login

# Execute SQL files in order
npx supabase db push --file database/schema.sql
npx supabase db push --file database/AUTO_FIX_ALL.sql
npx supabase db push --file database/FIX_USER_ISOLATION.sql
npx supabase db push --file database/ADD_MOISTURE_COLUMN.sql
npx supabase db push --file database/ADD_PROCUREMENT_ID_COLUMN.sql
npx supabase db push --file database/ADD_SUB_DISTRICT_COLUMN.sql
npx supabase db push --file database/ADD_EMAIL_FIELD_TO_PROCUREMENT.sql
npx supabase db push --file database/ADD_USER_EMAIL_COLUMN.sql
```

### Option 3: Install Supabase CLI Once
```bash
# Install with npm (requires sudo)
sudo npm install -g supabase

# Or install with brew (if you have it)
brew install supabase/tap/supabase

# Then run the original script
./run-sql.sh
```

## 🔑 What These Scripts Do

1. **schema.sql** - Creates all database tables
2. **AUTO_FIX_ALL.sql** - Sets up authentication and profiles
3. **FIX_USER_ISOLATION.sql** - 🔒 **CRITICAL**: Ensures users only see their own data
4. **Additional scripts** - Add extra columns for enhanced features

## ✅ Verification

After running, check that user isolation is working:
```bash
npx supabase db shell
> SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

You should see `rls_enabled = true` for all data tables.

## 🎯 Expected Result

After execution:
- ✅ Database schema created
- ✅ User authentication working
- ✅ **Each user sees ONLY their own data**
- ✅ All columns and triggers set up

## 🚨 Important

The **FIX_USER_ISOLATION.sql** file is the most critical - it fixes the security issue where users were seeing other users' data!

Run any of these options now to automatically execute all SQL files.
