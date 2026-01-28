-- Quick fix for signup 500 error
-- Run this in your Supabase SQL Editor

-- Step 1: Disable the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the problematic function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Make sure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Add simple policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Step 6: Test result
SELECT 'Signup fix applied - trigger disabled' as status;
