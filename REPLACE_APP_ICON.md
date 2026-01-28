# How to Replace App Icon with Sow&Reap Logo

## Step 1: Prepare Your Logo Image

You need a square logo image (PNG format, transparent background recommended) with the "SOW & REAP" logo.

## Step 2: Generate Icon Sizes

Android requires multiple icon sizes. Use an online tool like:
- **https://icon.kitchen/** (Recommended - upload once, get all sizes)
- **https://appicon.co/** 
- **https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html**

Upload your logo and download the Android icon pack.

## Step 3: Replace Icon Files

Replace the icon files in these folders:

### Required Sizes:
- **mipmap-mdpi**: 48x48 px
- **mipmap-hdpi**: 72x72 px  
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px

### Files to Replace:
1. `ic_launcher.png` - Square icon
2. `ic_launcher_round.png` - Round icon  
3. `ic_launcher_foreground.png` - Foreground layer (for adaptive icons)

### Locations:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-xhdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-xxhdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
└── mipmap-xxxhdpi/
    ├── ic_launcher.png
    ├── ic_launcher_round.png
    └── ic_launcher_foreground.png
```

## Step 4: Update Background Color (Optional)

Edit `android/app/src/main/res/values/ic_launcher_background.xml`:
```xml
<color name="ic_launcher_background">#FFFFFF</color>
```
Change `#FFFFFF` to your preferred background color.

## Step 5: Rebuild APK

After replacing the icons, rebuild the APK:
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

## Quick Method (If you have the logo file):

1. Go to https://icon.kitchen/
2. Upload your "SOW & REAP" logo image
3. Select "Android" 
4. Download the generated icon pack
5. Extract and replace all files in the `mipmap-*` folders
6. Rebuild APK

---

**Note**: If you provide the logo image file, I can help automate this process!
