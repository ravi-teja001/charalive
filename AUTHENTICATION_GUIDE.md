# Authentication System - How to Use Guide

## Overview
This application uses **Supabase Authentication** with email verification. When users sign up, they receive a confirmation email and must verify their account before logging in.

---

## For Administrators: Setting Up Supabase

### Step 1: Configure Supabase Email Verification

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Enable Email Confirmations**
   - Navigate to: **Authentication** → **Settings** → **Email Auth**
   - Toggle **"Enable email confirmations"** to ON
   - This ensures users must verify their email before logging in

3. **Customize Email Template (Optional)**
   - Go to: **Authentication** → **Email Templates**
   - Edit the "Confirm signup" template
   - Customize the email message users receive

4. **Set Redirect URL**
   - In **Authentication** → **URL Configuration**
   - Set **Site URL**: Your app URL (e.g., `http://localhost:8080` or your production URL)
   - Set **Redirect URLs**: Add your app URLs (e.g., `http://localhost:8080/login`)

### Step 2: Environment Variables

Make sure you have these in your `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

---

## For End Users: How to Use the System

### 📝 **Signing Up (First Time)**

1. **Go to the Signup Page**
   - Visit the landing page or navigate to `/signup`
   - You'll see the signup form

2. **Fill in the Form**
   - **Select Your Role**: Choose from:
     - Stock Point Supervisor (for raw biomass procurement)
     - Incharge (for expenses & payment tracking)
     - Plant Supervisor (for processing & deployment)
   - **Enter Your Email**: Use your Gmail or any email address
     - Example: `john@gmail.com`
   - **Create Password**: Must be at least 6 characters
   - **Confirm Password**: Enter the same password again

3. **Click "Sign Up"**
   - Your account will be created
   - You'll see a success message: **"Please check your email to verify your account"**

4. **Check Your Email**
   - Open your email inbox (check spam folder too)
   - Look for an email from Supabase
   - Subject: **"Confirm your signup"** or similar
   - Click the **verification link** in the email

5. **Account Verified!**
   - After clicking the link, your email is verified
   - You can now log in

---

### 🔐 **Logging In**

1. **Go to the Login Page**
   - Navigate to `/login` or click "Sign In" button

2. **Select Your Role**
   - Choose the same role you selected during signup:
     - Stock Point Supervisor
     - Incharge
     - Plant Supervisor

3. **Enter Your Credentials**
   - **Email**: Enter the exact email you used for signup
     - Example: `john@gmail.com`
   - **Password**: Enter the password you created

4. **Click "Sign In"**
   - If email is verified → You'll be logged in and redirected to Dashboard
   - If email is not verified → You'll see an error: "Please verify your email before logging in"

---

### ❌ **Troubleshooting**

#### **Problem: "Please verify your email" Error**
- **Solution**: 
  - Check your email inbox (and spam folder)
  - Click the verification link in the email from Supabase
  - If you didn't receive the email, check Supabase dashboard to resend

#### **Problem: "Invalid email or password" Error**
- **Solution**:
  - Double-check you're using the correct email address
  - Make sure you're using the password you created during signup
  - Check for typos in email (case-sensitive sometimes)

#### **Problem: "Email already registered"**
- **Solution**:
  - This email is already signed up
  - Try logging in instead
  - If you forgot your password, you can request a password reset (if configured)

#### **Problem: Didn't Receive Verification Email**
- **Solutions**:
  1. Check spam/junk folder
  2. Wait a few minutes (emails can be delayed)
  3. Verify email address is correct
  4. Check Supabase dashboard → Authentication → Users to see if user exists

---

## Complete User Flow Example

### Example: John signs up as Stock Point Supervisor

1. **John visits the website**
   - Lands on the homepage

2. **John clicks "Sign Up"**
   - Fills the form:
     - Role: **Stock Point Supervisor**
     - Email: **john@gmail.com**
     - Password: **mypassword123**
     - Confirm Password: **mypassword123**
   - Clicks "Sign Up"

3. **John sees success message**
   - "Please check your email to verify your account"

4. **John checks email**
   - Receives email from Supabase
   - Clicks verification link
   - Account is now verified ✅

5. **John logs in**
   - Goes to Login page
   - Selects: **Stock Point Supervisor**
   - Enters: **john@gmail.com** / **mypassword123**
   - Clicks "Sign In"
   - ✅ Successfully logged in → Redirected to Dashboard

6. **John uses the app**
   - Can now access Raw Biomass Procurement features
   - Can create procurement records
   - Can view his records

---

## Important Notes

### ✅ **What Users Need to Remember**

1. **Email and Password**: Must use the same email and password you created during signup
2. **Role**: Must select the same role you chose during signup
3. **Email Verification**: Must verify email before first login
4. **Case Sensitivity**: Email addresses might be case-sensitive

### 🔒 **Security Features**

- Passwords are encrypted and stored securely in Supabase
- Email verification prevents fake accounts
- Sessions are managed securely
- User roles are stored in the database

### 📧 **Email Verification Settings**

**If email verification is ENABLED** (recommended):
- Users must verify email before logging in
- More secure, prevents fake accounts

**If email verification is DISABLED**:
- Users can log in immediately after signup
- Less secure, but faster onboarding

---

## Quick Reference

### Signup Process
```
1. Select Role
2. Enter Email (e.g., user@gmail.com)
3. Create Password (min 6 characters)
4. Confirm Password
5. Click Sign Up
6. Check Email & Click Verification Link
7. ✅ Account Ready
```

### Login Process
```
1. Select Role
2. Enter Email (same as signup)
3. Enter Password (same as signup)
4. Click Sign In
5. ✅ Logged In → Dashboard
```

---

## Need Help?

If you encounter issues:
1. Check this guide first
2. Verify your email is correct
3. Check spam folder for verification email
4. Make sure you verified your email before logging in
5. Contact your administrator if problems persist

---

## Summary

**For New Users:**
1. Sign up with email, password, and role
2. Check email and verify account
3. Log in with same email and password
4. Start using the app!

**Remember:** 
- ✅ Same email for signup and login
- ✅ Same password for signup and login
- ✅ Must verify email before first login
- ✅ Must select correct role
