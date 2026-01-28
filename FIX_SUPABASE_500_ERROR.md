# Fix: Supabase 500 Error on Signup

## Problem
Getting a 500 error from Supabase when trying to sign up:
```
Failed to load resource: the server responded with a status of 500
```

## Common Causes & Solutions

### 1. Database Trigger Error (Most Common)

If you ran the `create_user_profile_trigger.sql` script and it has an error, it will cause 500 errors.

**Solution:**
1. Go to Supabase Dashboard → **Database** → **Functions**
2. Check if `handle_new_user` function exists
3. If it exists, check for errors in **Database** → **Logs**
4. Fix or remove the trigger:

```sql
-- Remove the trigger temporarily to test
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

5. Try signing up again - if it works, the trigger was the issue
6. Re-create the trigger with correct syntax (see below)

### 2. Redirect URL Not Whitelisted

Supabase requires redirect URLs to be whitelisted.

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:8080/login`
   - `http://localhost:8080/**`
   - `http://127.0.0.1:8080/login`
3. Under **Site URL**, set: `http://localhost:8080`
4. Save changes
5. Try signing up again

### 3. Email Confirmation Settings

Email confirmation might be misconfigured.

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Settings** → **Email Auth**
2. Check **"Enable email confirmations"** setting
3. If enabled, make sure email templates are configured
4. Try disabling temporarily to test:
   - Uncheck **"Enable email confirmations"**
   - Save
   - Try signing up
   - If it works, re-enable and configure email templates properly

### 4. Database Trigger Syntax Error

If the trigger function has a syntax error, it will cause 500 errors.

**Solution: Check and Fix Trigger**

Run this in Supabase SQL Editor to check:

```sql
-- Check if function exists and is valid
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

If there's an error, recreate it correctly:

```sql
-- Drop existing (if any)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function (fixed version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'incharge')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 5. RLS Policy Issue

Row Level Security might be blocking the trigger.

**Solution:**
Make sure the trigger function has proper permissions:

```sql
-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Ensure the function can insert
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
```

---

## Quick Diagnostic Steps

1. **Check Supabase Logs**
   - Go to **Logs** → **Postgres Logs** or **API Logs**
   - Look for errors around the time of signup attempt
   - This will show the exact error

2. **Test Without Trigger**
   ```sql
   -- Temporarily disable trigger
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   ```
   - Try signing up
   - If it works → trigger is the issue
   - If it still fails → check redirect URLs and email settings

3. **Test With Simple Signup**
   - Try signing up with a simple email/password
   - Check browser console for detailed error
   - Check Network tab → see the exact Supabase API response

---

## Recommended Fix Order

1. ✅ **First**: Check and fix redirect URLs in Supabase dashboard
2. ✅ **Second**: Temporarily disable email confirmation to test
3. ✅ **Third**: Check/remove database trigger if it exists
4. ✅ **Fourth**: Check Supabase logs for exact error
5. ✅ **Fifth**: Re-create trigger with correct syntax (if needed)

---

## Test After Fixes

1. Clear browser cache
2. Try signing up with a new email
3. Check browser console for errors
4. Check Supabase Dashboard → **Authentication** → **Users** to see if user was created

---

## Still Not Working?

If none of the above works:

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Project Settings**: Make sure project is active and not paused
3. **Check API Keys**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are correct
4. **Contact Support**: Use Supabase support or check their Discord

---

## Most Likely Fix

Based on the 500 error, it's most likely:
1. **Database trigger error** - Remove it temporarily and test
2. **Redirect URL not whitelisted** - Add localhost URLs to Supabase settings

Try these two first!
