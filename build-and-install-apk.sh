#!/bin/bash

# Automatic APK Build and Install Script
# This script builds the APK and installs it on a connected Android device

set -e  # Exit on any error

echo "🚀 Starting automatic APK build and install process..."
echo ""

# Step 1: Build React app
echo "📦 Step 1: Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

echo "✅ React build completed!"
echo ""

# Step 2: Sync Capacitor
echo "🔄 Step 2: Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

echo "✅ Capacitor sync completed!"
echo ""

# Step 3: Build Android APK
echo "🔨 Step 3: Building Android release APK..."
cd android
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo "❌ Android build failed!"
    exit 1
fi

echo "✅ Android APK build completed!"
cd ..

# Step 4: Copy APK to distribution folder
echo "📁 Step 4: Copying APK to distribution folder..."
mkdir -p APK_DISTRIBUTION
cp -f android/app/build/outputs/apk/release/app-release.apk APK_DISTRIBUTION/Biochar-Management-System.apk

APK_SIZE=$(ls -lh APK_DISTRIBUTION/Biochar-Management-System.apk | awk '{print $5}')
echo "✅ APK copied! Size: $APK_SIZE"
echo ""

# Step 5: Check for connected devices
echo "📱 Step 5: Checking for connected Android devices..."
DEVICE_COUNT=$(adb devices | grep -w "device" | wc -l | tr -d ' ')

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "⚠️  No Android device detected."
    echo "   Please connect your device via USB and:"
    echo "   1. Enable Developer Options"
    echo "   2. Enable USB Debugging"
    echo "   3. Accept the USB debugging authorization"
    echo ""
    echo "   APK is ready at: APK_DISTRIBUTION/Biochar-Management-System.apk"
    echo "   You can install it manually or run this script again after connecting the device."
    exit 0
fi

echo "✅ Found $DEVICE_COUNT device(s)"
echo ""

# Step 6: Install APK on device
echo "📲 Step 6: Installing APK on connected device(s)..."
adb install -r APK_DISTRIBUTION/Biochar-Management-System.apk

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! APK installed successfully!"
    echo ""
    echo "🎉 The Biochar Management System app has been installed on your device."
    echo "   You can now open it and start testing!"
else
    echo "❌ Installation failed!"
    echo "   Please check the error message above."
    exit 1
fi
