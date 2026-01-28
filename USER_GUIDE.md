# Biochar Management System - User Guide

## 📱 Table of Contents
1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Add Vendor](#add-vendor)
5. [Raw Biomass Procurement](#raw-biomass-procurement)
6. [Log Expenses](#log-expenses)
7. [View Procurement Records](#view-procurement-records)
8. [Tips & Troubleshooting](#tips--troubleshooting)

---

## 📲 Installation

### Step 1: Download the APK
- Download `Biochar-Management-System.apk` from the provided link or file
- The APK file size is approximately 3.9 MB

### Step 2: Enable Installation from Unknown Sources
1. Open **Settings** on your Android device
2. Go to **Security** or **Privacy** (varies by device)
3. Enable **"Install apps from unknown sources"** or **"Allow installation from unknown sources"**
4. You may see a warning - click **"Allow"** or **"OK"**

### Step 3: Install the APK
1. Open the downloaded APK file from your device's Downloads folder
2. Tap **"Install"** when prompted
3. Wait for installation to complete
4. Tap **"Open"** or find the app icon in your app drawer

### Step 4: Grant Permissions
When you first open the app, you may be asked for permissions:
- **Location Permission**: Required for automatic GPS capture in photos
  - Tap **"Allow"** or **"Allow while using app"**
  - This enables automatic capture of latitude and longitude when taking photos

---

## 🚀 Getting Started

### Step 1: Sign Up (New Users)

1. Open the app
2. On the landing page, click **"Sign Up"** or navigate to the Sign Up page
3. Fill in the registration form:
   - **Full Name**: Enter your full name
   - **Email**: Enter a valid email address
   - **Password**: Create a strong password (minimum 8 characters)
   - **Confirm Password**: Re-enter your password
   - **Role**: Select your role from the dropdown:
     - **Stock Point Supervisor** - For managing stock point operations
     - **Incharge** - For overseeing multiple stock points
     - **Plant Supervisor** - For plant-level management
4. Click **"Sign Up"**
5. You will be redirected to the Login page

### Step 2: Log In

1. Enter your **Email** address
2. Enter your **Password**
3. Select your **Role** from the dropdown (must match your signup role)
4. Click **"Sign In"**
5. You will be taken to the Dashboard

**Note**: If you see "Access denied" error, ensure you select the correct role that matches your account registration.

---

## 📊 Dashboard Overview

The Dashboard shows key metrics:

### For Stock Point Supervisor:
- **Total Trips Today**: Number of procurement trips recorded today
- **Net Weight Collected**: Total net weight collected today (in tons)
- **Pending Uploads**: Number of trips missing photos

### Quick Navigation:
- Use the **sidebar menu** (left side) to navigate between different sections
- Click the **collapse/expand** button (☰) to minimize or expand the sidebar

---

## 🚚 Add Vendor

**Purpose**: Register vendor vehicles for quick selection during procurement.

### Step 1: Navigate to Add Vendor
1. Click **"Add Vendor"** from the sidebar menu

### Step 2: Fill Vehicle Details
1. **Vehicle Number**: Enter the vehicle registration number
2. **Vehicle Weight (kg)**: Enter the empty weight of the vehicle
3. **Vehicle Type**: Select from dropdown (Truck, Trailer, Tempo, Auto, Other)
4. **Name**: Enter the vendor/owner name
5. **State**: Select state (Telangana or Andhra Pradesh)
6. **District**: Select district (auto-populated based on state)
7. **Village**: Select village (auto-populated based on district)
8. Click **"Add Vehicle"**

### Step 3: View Registered Vehicles
- All vehicles you add will appear in the **"Registered Vehicles"** table below
- You can see: Vehicle Number, Name, State, District, Village, Weight, Type, and Added Date
- **Note**: You can only see vehicles you added yourself

---

## 📝 Raw Biomass Procurement

**Purpose**: Record biomass procurement trips with photos, GPS, and weight details.

### Step 1: Navigate to Raw Biomass Procurement
1. Click **"Raw Biomass Procurement"** from the sidebar menu

### Step 2: Fill Trip Details

#### Source of Biomass & Name
- **Source of Biomass**: Select from dropdown:
  - Cotton stalks
  - Chilli stalks
- **Name**: Enter name (vendor name or contact person)

#### Vehicle Information
- **Vehicle Type**: Select **"Own"** or **"Vendor"**
  - **If "Own"**: Enter Vehicle Number and Vehicle Weight manually
  - **If "Vendor"**: Select from dropdown of registered vehicles (automatically fills Vehicle Number and Weight)

#### Location Details
- **State**: Select state (Telangana or Andhra Pradesh)
- **District**: Select district (auto-populated based on state)
- **Village**: Select village (auto-populated based on district)

#### Vehicle Photo with Biomass
1. Click the photo upload area or **"Upload Vehicle Image"** button
2. Choose **"Take Photo"** or **"Choose from Gallery"**
3. **Important**: When taking a photo, the app will automatically:
   - Request location permission (if not already granted)
   - Capture GPS coordinates (Latitude and Longitude)
   - Auto-fill the Latitude and Longitude fields
   - Lock the location fields (you can unlock if needed)
4. After capture, you'll see:
   - **"Photo captured"** message
   - **"Upload Vehicle Image"** button (to change photo)
   - **"Preview"** button (to view photo with GPS metadata)
   - **Remove (X)** button (to delete photo)

### Step 3: Fill Weight Details

#### Weight Information
- **Vehicle Weight**: Automatically filled if you selected a registered vehicle
- **Gross Weight**: Enter the gross weight (vehicle + biomass) in kg
- **Net Weight**: Will be calculated automatically (Gross Weight - Vehicle Weight)

#### Weight Record Photo
1. Click **"Upload Weight Record Photo"**
2. Take a photo of the weight receipt or scale reading
3. **Automatic NET WT Extraction**: 
   - The app will try to automatically extract "NET WT" from the receipt image
   - If found, Gross Weight and Net Weight will be calculated automatically
   - You can manually adjust if needed
4. After capture, preview will show GPS metadata (if available)

### Step 4: Location (Auto-filled)
- **Latitude** and **Longitude**: Automatically filled when you capture Vehicle Photo
- **Show Map**: Click to view location on a map in a dialog

### Step 5: Save Procurement Data
1. Review all entered information
2. Click **"Save Procurement Data"** button
3. Wait for confirmation message: **"Procurement data saved successfully!"**
4. The form will reset automatically
5. Your record will appear in the **"Procurement Records"** table below

---

## 💰 Log Expenses (For Incharge Role Only)

**Purpose**: Record expenses related to operations.

### Step 1: Navigate to Expenses
1. Click **"Log Expenses"** from the sidebar menu (visible only for Incharge role)

### Step 2: Fill Expense Details
1. **Stock Point**: Select stock point from dropdown
2. **Expense Date**: Select date
3. **Amount**: Enter expense amount
4. **Expense Type**: Select from:
   - Fuel
   - Cash Advance
   - Other
5. **Payment Mode**: Select:
   - Cash
   - UPI
6. **Receipt**: Upload receipt image (optional)
7. Click **"Log Expense"**

### Step 3: View Expense Records
- Use filters to view expenses:
  - **Stock Point**: Filter by specific stock point
  - **Expense Type**: Filter by type
  - **Date Range**: Select from date and to date
- View totals: Total expenses count and total amount

---

## 📋 View Procurement Records

### Accessing Records
1. Scroll down on the **"Raw Biomass Procurement"** page
2. You'll see the **"Procurement Records"** section

### Record Information
Each record shows:
- **Date**: Procurement date
- **Source**: Source of biomass (Cotton stalks/Chilli stalks)
- **Vehicle Type**: Own/Vendor
- **Vehicle Number**: Registration number
- **Vehicle Weight**: Weight in kg
- **Name**: Vendor/contact name
- **State, District, Village**: Location details
- **Gross Weight, Net Weight**: Weight information
- **Photos**: Click photo icons to view full-size images with GPS metadata
- **Location**: Click location icon to view coordinates

### Photo Preview
- Click any photo in the table to view:
  - Full-size image
  - GPS metadata overlay showing:
    - Latitude
    - Longitude
    - Date & Time
    - Name (Note)

### Export & Refresh
- **Export Excel**: Download all records as Excel file
- **Refresh**: Reload records from server

### Pagination
- Use **Previous** and **Next** buttons to navigate between pages
- Page numbers show current page and total pages
- Each page shows multiple records

**Note**: You can only see records you created yourself (Stock Point Supervisors see only their own records).

---

## 💡 Tips & Troubleshooting

### GPS Not Capturing on Mobile?
1. **Check Permissions**: 
   - Go to device Settings → Apps → Biochar Management System → Permissions
   - Ensure **Location** permission is enabled
2. **Enable GPS**: 
   - Enable Location/GPS on your device
   - For best results, enable "High Accuracy" mode
3. **Retry**: 
   - Close and reopen the app
   - Try capturing the photo again

### Photos Not Showing?
- Ensure you have granted **Storage** permissions
- Check internet connection if viewing records
- Try refreshing the records table

### Can't Log In?
- Verify your **email** and **password** are correct
- Ensure you select the **correct role** (must match your signup role)
- Try resetting your password or contact support

### Form Not Saving?
- Check all required fields are filled
- Ensure you have internet connection
- Wait for the success message before closing the form
- Try refreshing and submitting again

### NET WT Not Extracting from Photo?
- Ensure the receipt/scale photo is clear and well-lit
- Make sure "NET WT" text is visible in the image
- You can manually enter the values if automatic extraction fails

### Location Fields Locked?
- Location fields are automatically locked after GPS capture to prevent accidental changes
- Click the **unlock icon** (if available) or refresh the page to unlock

### Can't See Vendor Vehicles?
- Ensure you're logged in with the correct account
- You can only see vehicles you added yourself
- Check if you've added any vehicles in the "Add Vendor" section

### Export Excel Not Working?
- Ensure you have internet connection
- Check if there are records to export
- Try refreshing the page and exporting again

---

## 🔒 Security & Privacy

- All data is securely stored in the cloud
- Each user can only access their own records
- GPS coordinates are automatically captured but not shared publicly
- Photos are stored securely and only visible to authorized users

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Try the troubleshooting steps above
3. Contact your administrator or support team
4. Provide details: error messages, device model, Android version

---

## 📱 System Requirements

- **Android**: 6.0 (Marshmallow) or higher
- **Storage**: At least 50 MB free space
- **Internet**: Required for data synchronization
- **GPS**: Required for automatic location capture
- **Camera**: Required for photo capture

---

## ✅ Quick Reference Checklist

**For Stock Point Supervisors:**
- [ ] Install APK and grant permissions
- [ ] Sign up or log in
- [ ] Add vendor vehicles (if needed)
- [ ] Record procurement trips with photos
- [ ] Verify GPS is captured automatically
- [ ] Check records in Procurement Records table

**For Incharge:**
- [ ] Install APK and grant permissions
- [ ] Sign up or log in
- [ ] View dashboard with stats
- [ ] Log expenses as needed
- [ ] Monitor stock point activities

---

**Version**: 1.0  
**Last Updated**: January 2025  
**All rights reserved © Sowandreap 2026**
