# 🎨 Replace App Icon with SOW & REAP Logo

## Option 1: Automated Script (Easiest)

1. **Place your logo file** as `logo.png` in the project root directory
   - Recommended size: 1024x1024 pixels
   - Format: PNG with transparent background (if needed)
   - Square aspect ratio (1:1)

2. **Run the script**:
   ```bash
   ./replace-app-icon.sh
   ```

3. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease
   ```

The script will automatically:
- Generate all required icon sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Create square, round, and foreground versions
- Replace all icon files in Android resources

---

## Option 2: Manual Replacement (Using Online Tools)

### Step 1: Generate Icons
1. Go to **https://icon.kitchen/** or **https://www.appicon.co/**
2. Upload your "SOW & REAP" logo image
3. Select **"Android"** platform
4. Download the generated icon pack

### Step 2: Replace Files
Extract the downloaded icon pack and replace files in:
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

### Step 3: Rebuild APK
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

---

## Option 3: Using Capacitor Assets (If you have Node.js)

1. **Install Capacitor Assets**:
   ```bash
   npm install -g @capacitor/assets
   ```

2. **Place your logo** as `icon.png` in project root (1024x1024px)

3. **Generate icons**:
   ```bash
   npx @capacitor/assets generate --iconPath icon.png --splashPath icon.png
   ```

4. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease
   ```

---

## Required Icon Sizes

| Density | Size | Folder |
|---------|------|--------|
| mdpi | 48x48 px | `mipmap-mdpi/` |
| hdpi | 72x72 px | `mipmap-hdpi/` |
| xhdpi | 96x96 px | `mipmap-xhdpi/` |
| xxhdpi | 144x144 px | `mipmap-xxhdpi/` |
| xxxhdpi | 192x192 px | `mipmap-xxxhdpi/` |

---

## Logo File Requirements

- **Format**: PNG
- **Background**: Transparent (recommended) or solid color
- **Aspect Ratio**: 1:1 (square)
- **Minimum Size**: 1024x1024 pixels (for best quality)
- **Content**: Your "SOW & REAP" logo centered

---

## Troubleshooting

### Script fails with "ImageMagick not found"
**macOS**:
```bash
brew install imagemagick
```

**Linux**:
```bash
sudo apt-get install imagemagick
```

**Windows**: Download from https://imagemagick.org/script/download.php

### Icons look blurry after replacement
- Ensure source logo is at least 1024x1024 pixels
- Use PNG format (not JPEG)
- Make sure icons are exactly the specified sizes

### Icons don't change after rebuilding
- Clear Android build cache: `cd android && ./gradlew clean`
- Uninstall old APK from device first
- Rebuild: `./gradlew assembleRelease`

---

## Need Help?

If you provide the logo file, I can help you:
1. Generate all required icon sizes
2. Replace the files automatically
3. Rebuild the APK

Just place your logo as `logo.png` in the project root and let me know!
