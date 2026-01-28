# Fix User Roles in Database

This guide will help you check and fix role issues in your Supabase database.

## Step 1: Check Current Roles

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run `check_profiles_roles.sql` to see all profiles and their current roles
3. This will show you which users have which roles

## Step 2: Fix the Database Trigger

1. In **SQL Editor**, run `fix_trigger_role.sql`
2. This updates the trigger so new signups save roles correctly
3. **This is important** - it prevents future role issues

## Step 3: Update Existing Profiles (if needed)

If you find profiles with wrong roles, you can fix them:

### Option A: Update by Email (Recommended)
1. Open `update_profiles_by_email.sql`
2. Uncomment the UPDATE statements
3. Replace `'user@example.com'` with actual email addresses
4. Replace `'supervisor_plant'` with the correct role
5. Run the SQL

### Option B: Bulk Update from Metadata
1. Open `fix_all_default_roles.sql`
2. Uncomment STEP 1 first to check what needs fixing
3. If needed, uncomment STEP 2 to update from auth metadata
4. For specific cases, use STEP 3

## Step 4: Verify the Fix

1. Run `verify_profiles_table.sql` to verify the table structure
2. Run `check_profiles_roles.sql` again to confirm roles are correct
3. Try signing up a new user with Plant Supervisor or Incharge role
4. Try logging in with the correct role

## Valid Role Values

- `'supervisor_stockpoint'` - Stock Point Supervisor
- `'incharge'` - Incharge
- `'supervisor_plant'` - Plant Supervisor

## Important Notes

- Always backup your database before making bulk updates
- Test with one user first before updating all profiles
- After fixing, new signups should work correctly with the updated trigger
- The `profiles` table stores all three roles - no need for separate tables

## Quick Fix for One User

If you just need to fix one user's role quickly:

```sql
UPDATE public.profiles 
SET role = 'supervisor_plant'  -- or 'incharge' or 'supervisor_stockpoint'
WHERE email = 'user@example.com';  -- replace with actual email
```
