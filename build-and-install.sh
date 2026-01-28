#!/bin/bash

# Build and Install APK Script
# This script builds the React app, syncs with Capacitor, builds the APK, and installs it on a connected device

set -e  # Exit on error

echo "🚀 Starting APK build and install process..."
echo ""

# Step 1: Build React app
echo "📦 Step 1/4: Building React app..."
npm run build
echo "✅ React app built successfully"
echo ""

# Step 2: Sync with Capacitor
echo "🔄 Step 2/4: Syncing with Capacitor..."
npx cap sync android
echo "✅ Capacitor sync completed"
echo ""

# Step 3: Build Android APK
echo "🔨 Step 3/4: Building Android APK..."
cd android
./gradlew assembleRelease
cd ..
echo "✅ APK built successfully"
echo ""

# Step 4: Check for connected devices
echo "📱 Step 4/4: Checking for connected devices..."
if ! command -v adb &> /dev/null; then
    echo "⚠️  ADB not found. Installing APK to connected device requires Android SDK platform-tools."
    echo "   Please install Android SDK platform-tools or copy the APK manually."
    echo ""
    echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
    exit 0
fi

DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq 0 ]; then
    echo "⚠️  No Android devices found!"
    echo "   Please:"
    echo "   1. Connect your Android device via USB"
    echo "   2. Enable USB debugging on your device"
    echo "   3. Run 'adb devices' to verify connection"
    echo ""
    echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo "   You can manually copy this file to your device"
    exit 0
fi

echo "✅ Found $DEVICES connected device(s)"
echo ""

# Step 5: Copy APK to distribution folder
echo "📋 Copying APK to distribution folder..."
cp android/app/build/outputs/apk/release/app-release.apk APK_DISTRIBUTION/Biochar-Management-System.apk
echo "✅ APK copied to APK_DISTRIBUTION/Biochar-Management-System.apk"
echo ""

# Step 6: Install APK on connected device
echo "📲 Installing APK on connected device..."
adb install -r APK_DISTRIBUTION/Biochar-Management-System.apk

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! APK installed on your device!"
    echo ""
    echo "You can now open the app on your device."
else
    echo ""
    echo "⚠️  Installation failed. Please try manually:"
    echo "   adb install -r APK_DISTRIBUTION/Biochar-Management-System.apk"
    exit 1
fi
