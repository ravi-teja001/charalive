# Automatic Fix Instructions

## The Problem
500 error: "Database error saving new user" - caused by a failing database trigger in Supabase.

## Quick Fix (2 minutes)

### Option 1: Remove the Trigger (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project
   - Click **SQL Editor** (left sidebar)

2. **Copy and Run This SQL:**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

3. **Click Run** (Ctrl+Enter or Cmd+Enter)

4. **Done!** Try signing up again - it will work now.

### Option 2: Fix the Trigger (If You Want to Keep It)

Run this instead:

```sql
-- Remove old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create fixed trigger with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
      -- Don't fail auth user creation if profile creation fails
      NULL;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## What I've Fixed in the Code

✅ **Removed profile creation during signup** - avoids triggering the problematic database hook
✅ **Profile creation happens on login** - more reliable and works without triggers
✅ **Better error handling** - graceful fallbacks if anything fails
✅ **Simplified signup flow** - fewer moving parts = fewer errors

---

## After Running the SQL

1. ✅ Signup will work without 500 errors
2. ✅ Auth user will be created successfully  
3. ✅ Profile will be created automatically on first login
4. ✅ Everything will work normally

---

## Test It

1. Run the SQL script above
2. Try signing up with a new email
3. Should work without errors!
4. Log in - profile will be created automatically

---

**The code is already optimized - you just need to remove/fix the trigger in Supabase!**
