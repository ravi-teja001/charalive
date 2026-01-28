# User Management Guide

## 📋 How to Find and Manage Users

This guide explains how to view, search, and manage users in the Biochar Management System.

---

## 🔍 Methods to Find Users

### Method 1: Using Supabase Dashboard (Easiest)

1. **Login to Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **Table Editor** → **profiles** table

2. **View All Users**
   - All users will be displayed in the table
   - Columns show: `id`, `email`, `role`, `stock_point_id`, `created_at`

3. **Search/Filter Users**
   - Use the search box to filter by email
   - Click column headers to sort
   - Use filters to search by role

---

### Method 2: Using SQL Editor (Advanced)

1. **Open SQL Editor in Supabase**
   - Go to your Supabase project
   - Click **SQL Editor** from the sidebar
   - Create a new query

2. **Run Pre-built Queries**
   - Use the queries from `database/VIEW_ALL_USERS.sql`
   - Copy and paste queries as needed

**Common Queries:**

#### View All Users:
```sql
SELECT 
    id,
    email,
    role,
    stock_point_id,
    created_at
FROM public.profiles
ORDER BY created_at DESC;
```

#### Find User by Email:
```sql
SELECT * FROM public.profiles
WHERE email = 'user@example.com';
```

#### Find Users by Role:
```sql
SELECT * FROM public.profiles
WHERE role = 'supervisor_stockpoint';
```

#### Count Users by Role:
```sql
SELECT role, COUNT(*) as count
FROM public.profiles
GROUP BY role;
```

---

## 👥 User Identification

### User Fields Explained:

| Field | Description | Example |
|-------|-------------|---------|
| **id** | Unique user ID (UUID) | `123e4567-e89b-12d3-a456-426614174000` |
| **email** | User's email address | `user@example.com` |
| **role** | User's role in system | `supervisor_stockpoint`, `incharge`, `supervisor_plant` |
| **stock_point_id** | Assigned stock point (if any) | `stock-point-001` |
| **plant_id** | Assigned plant (if any) | `plant-001` |
| **created_at** | Account creation date | `2025-01-18 10:30:00` |

### Role Types:

- **`supervisor_stockpoint`** - Stock Point Supervisor
  - Can add vendors, record procurement trips
  - Sees only their own records

- **`incharge`** - Incharge
  - Can log expenses
  - Oversees multiple stock points

- **`supervisor_plant`** - Plant Supervisor
  - Plant-level management
  - Views plant-wide statistics

---

## 🔎 Finding Specific Users

### By Email Address:
```sql
SELECT * FROM public.profiles
WHERE email LIKE '%@gmail.com%';  -- Find all Gmail users
```

### By Creation Date:
```sql
SELECT * FROM public.profiles
WHERE created_at >= '2025-01-01';  -- Users created after Jan 1, 2025
```

### By Stock Point:
```sql
SELECT * FROM public.profiles
WHERE stock_point_id = 'your-stock-point-id';
```

### Active Users (with recent activity):
```sql
SELECT DISTINCT p.*
FROM public.profiles p
INNER JOIN public.raw_biomass_procurement r ON p.id = r.created_by
WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 📊 User Statistics

### Get User Activity Summary:
```sql
SELECT 
    p.email,
    p.role,
    COUNT(r.id) as total_trips,
    SUM(r.net_weight) as total_weight_kg,
    MAX(r.created_at) as last_activity
FROM public.profiles p
LEFT JOIN public.raw_biomass_procurement r ON p.id = r.created_by
GROUP BY p.id, p.email, p.role
ORDER BY total_trips DESC;
```

### Users by Role Count:
```sql
SELECT 
    role,
    COUNT(*) as user_count
FROM public.profiles
GROUP BY role;
```

---

## 🗑️ Managing Users

### Delete a User (Complete Removal):
Use the script in `database/DELETE_USER_COMPLETE.sql`:

```sql
-- Replace 'user@example.com' with the email to delete
DO $$
DECLARE
  user_email TEXT := 'user@example.com';
  user_id UUID;
BEGIN
  -- Find user ID
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User not found';
  ELSE
    -- Delete from profiles
    DELETE FROM public.profiles WHERE id = user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = user_id;
    
    RAISE NOTICE 'User deleted: %', user_email;
  END IF;
END $$;
```

### Update User Role:
```sql
UPDATE public.profiles
SET role = 'incharge'  -- New role
WHERE email = 'user@example.com';
```

### Update User Stock Point:
```sql
UPDATE public.profiles
SET stock_point_id = 'new-stock-point-id'
WHERE email = 'user@example.com';
```

---

## 🔐 Security Notes

- **Never share user passwords** - They are encrypted and cannot be retrieved
- **Backup before deletion** - Always export user data before deleting
- **Verify before updates** - Double-check email addresses before making changes
- **Use transactions** - Wrap deletion operations in transactions for safety

---

## 📝 Quick Reference

### Common Tasks:

| Task | SQL Query Location |
|------|-------------------|
| View all users | `database/VIEW_ALL_USERS.sql` - Query #1 |
| Find user by email | `database/VIEW_ALL_USERS.sql` - Query #3 |
| Count by role | `database/VIEW_ALL_USERS.sql` - Query #2 |
| Delete user | `database/DELETE_USER_COMPLETE.sql` |
| View user activity | `database/VIEW_ALL_USERS.sql` - Query #8 |

---

## 🆘 Troubleshooting

### Can't see users?
- Check if you have proper permissions in Supabase
- Verify you're looking at the correct project
- Ensure RLS policies allow viewing

### User not found?
- Check for typos in email address
- Try searching by partial email: `WHERE email LIKE '%partial%'`
- Check `auth.users` table if user exists but no profile

### Need to find inactive users?
```sql
SELECT * FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.raw_biomass_procurement r 
    WHERE r.created_by = p.id
);
```

---

**Need Help?** Refer to `database/VIEW_ALL_USERS.sql` for ready-to-use queries!
