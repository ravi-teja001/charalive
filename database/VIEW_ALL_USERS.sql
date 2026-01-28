-- VIEW ALL USERS
-- This script helps you view and manage all users in the system

-- ============================================
-- 1. VIEW ALL USER PROFILES
-- ============================================
-- Shows all registered users with their details
SELECT 
    id,
    email,
    role,
    stock_point_id,
    plant_id,
    created_at,
    updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- ============================================
-- 2. COUNT USERS BY ROLE
-- ============================================
-- See how many users are in each role
SELECT 
    role,
    COUNT(*) as user_count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- ============================================
-- 3. SEARCH USER BY EMAIL
-- ============================================
-- Replace 'user@example.com' with the email you're looking for
SELECT 
    id,
    email,
    role,
    stock_point_id,
    plant_id,
    created_at
FROM public.profiles
WHERE email = 'user@example.com';

-- ============================================
-- 4. SEARCH USER BY ROLE
-- ============================================
-- Find all users with a specific role
-- Options: 'supervisor_stockpoint', 'incharge', 'supervisor_plant'
SELECT 
    id,
    email,
    role,
    stock_point_id,
    created_at
FROM public.profiles
WHERE role = 'supervisor_stockpoint'  -- Change role as needed
ORDER BY created_at DESC;

-- ============================================
-- 5. VIEW RECENT USERS (Last 10)
-- ============================================
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 6. VIEW USERS WITH AUTH DETAILS
-- ============================================
-- Shows users from auth.users table (if you have access)
-- Note: This may require admin access
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    p.role,
    p.stock_point_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- 7. FIND USERS BY STOCK POINT
-- ============================================
-- Replace 'stock-point-id' with actual stock point ID
SELECT 
    id,
    email,
    role,
    stock_point_id,
    created_at
FROM public.profiles
WHERE stock_point_id = 'stock-point-id'
ORDER BY created_at DESC;

-- ============================================
-- 8. VIEW USER ACTIVITY (with trip count)
-- ============================================
-- See how many procurement records each user has created
SELECT 
    p.id,
    p.email,
    p.role,
    COUNT(r.id) as total_trips,
    SUM(r.net_weight) as total_weight_kg,
    MAX(r.procurement_date) as last_trip_date
FROM public.profiles p
LEFT JOIN public.raw_biomass_procurement r ON p.id = r.created_by
GROUP BY p.id, p.email, p.role
ORDER BY total_trips DESC;

-- ============================================
-- 9. FIND DUPLICATE EMAILS
-- ============================================
-- Check if there are duplicate email addresses
SELECT 
    email,
    COUNT(*) as count,
    array_agg(id) as user_ids
FROM public.profiles
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================
-- 10. VIEW USERS WITHOUT RECORDS
-- ============================================
-- Find users who haven't created any procurement records
SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at
FROM public.profiles p
LEFT JOIN public.raw_biomass_procurement r ON p.id = r.created_by
WHERE r.id IS NULL
ORDER BY p.created_at DESC;
