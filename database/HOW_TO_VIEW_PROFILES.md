# How to View Profiles in Supabase Database

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open your Supabase project dashboard
   - URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

2. **Navigate to Table Editor**
   - Click on **"Table Editor"** in the left sidebar
   - Select **"profiles"** table from the list

3. **View All Profiles**
   - You'll see all profiles with columns: `id`, `email`, `role`, `created_at`, `updated_at`, etc.
   - You can sort by any column by clicking the column header
   - Use the search box to filter by email or role

## Method 2: Using SQL Editor

1. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

2. **Run These Queries**

   **View all profiles:**
   ```sql
   SELECT 
     id,
     email,
     role,
     created_at,
     updated_at
   FROM public.profiles
   ORDER BY created_at DESC;
   ```

   **View profile by email:**
   ```sql
   SELECT 
     id,
     email,
     role,
     created_at
   FROM public.profiles
   WHERE email = 'your-email@example.com';
   ```

   **View profile by user ID:**
   ```sql
   SELECT 
     id,
     email,
     role,
     created_at
   FROM public.profiles
   WHERE id = 'ab375707-fa6c-4053-88b4-ddee39c5a441';
   ```

   **Count profiles by role:**
   ```sql
   SELECT 
     role,
     COUNT(*) as count
   FROM public.profiles
   GROUP BY role
   ORDER BY role;
   ```

## Method 3: Check Auth Users

To see both auth users and their profiles:

```sql
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as metadata_role,
  au.created_at as auth_created_at,
  p.role as profile_role,
  p.created_at as profile_created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 20;
```

## Troubleshooting

If you don't see a profile after signup:

1. **Check if auth user exists:**
   ```sql
   SELECT id, email, created_at
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

2. **Check trigger status:**
   ```sql
   SELECT 
     tgname as trigger_name,
     CASE 
       WHEN tgenabled = 'O' THEN 'Enabled'
       WHEN tgenabled = 'D' THEN 'Disabled'
       ELSE 'Unknown'
     END as status
   FROM pg_trigger
   WHERE tgname = 'on_auth_user_created';
   ```

3. **Check trigger logs** (if available):
   - Go to **Logs** → **Postgres Logs** in Supabase Dashboard
   - Look for messages from the `handle_new_user` function
