# How to Build and Share Android APK

This guide will help you build an APK file that you can share with others.

## Prerequisites

1. **Node.js** installed (version 18+)
2. **Android Studio** installed (for Android SDK)
3. **Java Development Kit (JDK)** installed (version 17+)

## Step 1: Build the Web Application

First, build your React application:

```bash
npm run build
```

This creates the production build in the `dist/` folder.

## Step 2: Sync with Capacitor

Sync the web build with Capacitor:

```bash
npx cap sync android
```

This copies the web build to the Android project and updates native dependencies.

## Step 3: Build the APK

You have two options:

### Option A: Build APK using Gradle (Command Line) - **Recommended for sharing**

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Option B: Build using Android Studio

1. Open Android Studio
2. File → Open → Select the `android` folder in your project
3. Wait for Gradle sync to complete
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. Wait for the build to finish
6. Click "locate" in the notification or navigate to:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Step 4: Sign the APK (For Release)

**Important**: For production/release APK, you need to sign it.

1. Create a keystore (if you don't have one):
```bash
keytool -genkey -v -keystore biochar-release-key.keystore -alias biochar -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('biochar-release-key.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'biochar'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

3. Build signed APK:
```bash
cd android
./gradlew assembleRelease
```

## Step 5: Share the APK

1. **Find the APK file:**
   - Release APK: `android/app/build/outputs/apk/release/app-release.apk`
   - Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Share via:**
   - **Email**: Attach the APK file
   - **Cloud Storage**: Upload to Google Drive, Dropbox, etc. and share the link
   - **File Transfer**: Use WhatsApp, Telegram, or any file sharing service
   - **USB/Bluetooth**: Transfer directly to the device

## Step 6: Install on Device

The recipient needs to:
1. Enable "Install from Unknown Sources" in Android settings
2. Download the APK file
3. Open the APK file
4. Tap "Install"

## Quick Commands Summary

```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK (Release)
cd android && ./gradlew assembleRelease

# Find your APK
# Release: android/app/build/outputs/apk/release/app-release.apk
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

- **"Command not found: gradlew"**: Run `chmod +x android/gradlew` first
- **"SDK location not found"**: Set `ANDROID_HOME` environment variable or configure in `local.properties`
- **Build errors**: Make sure Android SDK is properly installed via Android Studio

## Notes

- Debug APK is for testing (larger file size, easier to build)
- Release APK is optimized and smaller (requires signing for production)
- File size will be around 20-50 MB depending on dependencies
