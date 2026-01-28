# SQL Execution Instructions

## Quick Setup (Recommended)

Run the automated script:
```bash
./run-sql.sh
```

## Manual Execution

If you prefer to run SQL files manually:

### 1. Install Supabase CLI
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Execute SQL Files in Order

**Core Schema:**
```bash
supabase db push --file database/schema.sql
```

**Authentication Setup:**
```bash
supabase db push --file database/AUTO_FIX_ALL.sql
```

**Additional Columns:**
```bash
supabase db push --file database/ADD_MOISTURE_COLUMN.sql
supabase db push --file database/ADD_PROCUREMENT_ID_COLUMN.sql
supabase db push --file database/ADD_SUB_DISTRICT_COLUMN.sql
supabase db push --file database/ADD_EMAIL_FIELD_TO_PROCUREMENT.sql
supabase db push --file database/ADD_USER_EMAIL_COLUMN.sql
```

## What These Scripts Do

1. **schema.sql** - Creates all database tables (users, stock_points, plants, vehicles, etc.)
2. **AUTO_FIX_ALL.sql** - Sets up authentication profiles and triggers
3. **Additional scripts** - Add extra columns for enhanced functionality

## Verification

After execution, verify your database:
```bash
supabase db shell
# Then run:
\dt
SELECT * FROM profiles LIMIT 5;
```

## MCP Server Status

Your MCP server is running at `http://localhost:3001` and ready to connect to your configured database.
