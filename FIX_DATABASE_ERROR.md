# Fix: "Database error saving new user"

## Problem
When users sign up, they get an error: `"Database error saving new user"`. This happens because Row Level Security (RLS) policies might be blocking the insert into the `users` table.

## Solution: Use Database Trigger (Recommended)

The best solution is to create a database trigger that automatically creates a user profile when a new auth user signs up.

### Step 1: Run the Trigger SQL

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project
   - Go to **SQL Editor**

2. **Run the Trigger Script**
   - Click **New Query**
   - Copy the entire contents of `database/create_user_profile_trigger.sql`
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

3. **Verify It Works**
   - The trigger will automatically create user profiles when users sign up
   - No more manual insert needed!

### What This Does

- Creates a function that automatically inserts into `users` table when auth user is created
- Uses `SECURITY DEFINER` to bypass RLS (since it runs as the database owner)
- Handles conflicts gracefully (won't fail if profile already exists)
- Gets role from user metadata (set during signup)

---

## Alternative Solution: Update RLS Policy

If you prefer not to use a trigger, you can update the RLS policy to allow inserts:

### Option 1: Allow Authenticated Inserts Only

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Create new policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
```

### Option 2: Allow Service Role Inserts (Less Secure)

```sql
-- Allow service role to insert (for backend operations)
CREATE POLICY "Service role can insert users" 
ON users FOR INSERT 
TO service_role 
WITH CHECK (true);
```

---

## Current Code Behavior

The code has been updated to:

1. **Try to create profile during signup** (may fail due to RLS)
2. **If profile creation fails**, continue anyway (auth user is created)
3. **On first login**, automatically create profile if it doesn't exist
4. **Use trigger** (if installed) to automatically create profiles

---

## Testing

After running the trigger SQL:

1. **Try signing up a new user**
   - Go to signup page
   - Enter email, password, select role
   - Click "Sign Up"
   - Should succeed without database error

2. **Check Supabase Dashboard**
   - Go to **Table Editor** → **users**
   - You should see the new user profile created automatically

3. **Try logging in**
   - Use the same email and password
   - Should work without issues

---

## Troubleshooting

### Error: "permission denied for table users"
- **Solution**: Make sure you ran the trigger SQL script
- The trigger uses `SECURITY DEFINER` which bypasses RLS

### Error: "function does not exist"
- **Solution**: Make sure you ran the entire trigger SQL script
- Check that the function `handle_new_user()` exists in Supabase

### Profile still not created
- **Solution**: Check Supabase logs for errors
- Verify the trigger is enabled: Go to Database → Triggers
- You should see `on_auth_user_created` trigger

### Users table doesn't exist
- **Solution**: Run `database/schema.sql` first to create all tables
- Then run the trigger script

---

## Summary

**Best Solution**: Run `database/create_user_profile_trigger.sql` in Supabase SQL Editor

This will:
- ✅ Automatically create user profiles on signup
- ✅ Bypass RLS issues
- ✅ Handle role assignment from metadata
- ✅ Work seamlessly with the existing code

The code has been updated to handle errors gracefully, but the trigger is the cleanest solution!
