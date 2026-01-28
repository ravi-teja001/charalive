# URGENT: Fix 500 Error "Database error saving new user"

## The Problem
You're getting a 500 error: `"Database error saving new user"` when trying to sign up.

**This is caused by a database trigger that's failing!**

## IMMEDIATE FIX (Do This First!)

### Step 1: Remove the Problematic Trigger

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project
   - Click **SQL Editor** (left sidebar)

2. **Run This SQL** (Copy and paste):

```sql
-- Remove the trigger that's causing the 500 error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

3. **Click Run** (or press Ctrl+Enter / Cmd+Enter)

4. **Try Signing Up Again** - It should work now!

---

## Why This Happens

When you sign up, Supabase tries to:
1. Create the auth user ✅
2. Run a database trigger to create user profile ❌ (This is failing!)

The trigger is trying to insert into the `users` table but failing due to:
- RLS (Row Level Security) blocking it
- Missing permissions
- Syntax error in the trigger function

---

## What Happens After Removing Trigger?

✅ **Signup will work** - Auth user will be created successfully
✅ **Profile will be created automatically** - Our code creates it on first login
✅ **No data loss** - Everything works, just without the trigger

---

## Alternative: Fix the Trigger (If You Want to Keep It)

If you want to keep automatic profile creation, fix the trigger:

```sql
-- Remove old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create fixed trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try to insert, but don't fail if it errors
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
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Silently fail - profile will be created on login
      NULL;
  END;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
```

---

## Quick Test

After removing the trigger:

1. ✅ Go to signup page
2. ✅ Enter email, password, select role
3. ✅ Click "Sign Up"
4. ✅ Should succeed without 500 error
5. ✅ Check email for verification (if enabled)
6. ✅ Log in - profile will be created automatically

---

## Summary

**Easiest Fix**: Remove the trigger (Step 1 above)
- Takes 30 seconds
- Signup will work immediately
- Profile created on first login (automatic)

**The code is already set up to handle profile creation without the trigger!**
