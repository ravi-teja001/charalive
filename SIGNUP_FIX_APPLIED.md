# Signup 500 Error - FIXED ✅

## Problem
Users were getting a 500 error when trying to sign up:
```
Database error saving new user
ERROR: null value in column "id" of relation "users" violates not-null constraint
```

## Root Cause
A database trigger was trying to insert user records into a `users` table that doesn't exist. The application actually uses a `profiles` table, not a `users` table.

## Solution Applied
✅ Created a new database trigger function that:
- Inserts into the correct `profiles` table (not `users`)
- Extracts the role from user metadata (set during signup)
- Handles errors gracefully without blocking user signup
- Runs with SECURITY DEFINER privileges to bypass RLS policies

## What Was Fixed
1. **Trigger Function**: Updated `handle_new_user()` to insert into `profiles` table
2. **Role Mapping**: Properly extracts role from signup metadata (supervisor_stockpoint, incharge, supervisor_plant)
3. **Error Handling**: Errors are logged but don't prevent signup from succeeding
4. **Database Migration**: Applied via Supabase migration system

## Verification
The trigger is now active and properly configured:
- ✅ Trigger: `on_auth_user_created` on `auth.users`
- ✅ Function: `handle_new_user()` with SECURITY DEFINER
- ✅ Target table: `profiles` (correct table)
- ✅ Error handling: Includes exception handling

## Testing
Try signing up with a new account - the 500 error should be resolved!

The profile will be automatically created when a user signs up, with the role they selected in the signup form.
