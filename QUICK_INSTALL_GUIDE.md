# Quick APK Build and Install Guide

## 🚀 Automatic Build & Install (Recommended)

Simply connect your Android device and run:

```bash
npm run quick-install
```

Or:

```bash
./build-and-install.sh
```

This will:
1. ✅ Build the React app
2. ✅ Sync with Capacitor
3. ✅ Build the Android APK
4. ✅ Automatically install on your connected device
5. ✅ Copy APK to `APK_DISTRIBUTION` folder

## 📱 Prerequisites

Before using automatic install, ensure:

1. **Android Device Connected via USB**
   - Connect your Android phone/tablet to your computer via USB

2. **Enable USB Debugging**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. **Verify Connection**
   ```bash
   adb devices
   ```
   You should see your device listed

4. **Trust Computer** (First time only)
   - When you connect, your phone will show "Allow USB debugging?"
   - Check "Always allow from this computer" and tap "OK"

## 🔧 Manual Install (If automatic fails)

If automatic install doesn't work:

1. **Build APK only:**
   ```bash
   npm run build:apk
   ```

2. **Install manually:**
   ```bash
   npm run install:apk
   ```

3. **Or copy APK manually:**
   - Find APK at: `APK_DISTRIBUTION/Biochar-Management-System.apk`
   - Transfer to your device
   - Open on device and install

## ⚡ Quick Tips

- **First time setup:** Install Android SDK Platform Tools (ADB)
- **Check connection:** Run `adb devices` to see connected devices
- **No device?** The script will still build the APK and save it to `APK_DISTRIBUTION/`

## 🐛 Troubleshooting

**"adb: command not found"**
- Install Android SDK Platform Tools
- Or use manual copy method

**"No devices found"**
- Check USB cable
- Enable USB Debugging
- Run `adb devices` to verify

**"Installation failed"**
- Uninstall old version first: `adb uninstall com.biochar.management`
- Or manually uninstall from device
