# App Icon Update Instructions

## Replace Android App Icon with Sow&Reap Logo

To update the app icon with the "Sow&Reap" logo, you need to replace the launcher icon files in the following directories:

### Icon File Locations

The Android launcher icons are located in:
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

Each directory contains:
- `ic_launcher.png` (square icon)
- `ic_launcher_round.png` (round icon)
- `ic_launcher_foreground.png` (foreground layer for adaptive icons)

### Required Icon Sizes

1. **mdpi**: 48x48 px
2. **hdpi**: 72x72 px
3. **xhdpi**: 96x96 px
4. **xxhdpi**: 144x144 px
5. **xxxhdpi**: 192x192 px

### Steps to Replace Icons

1. **Prepare Your Logo Image**
   - Use the "SOW & REAP" logo image you have
   - Create square versions (1:1 aspect ratio) for each size
   - Ensure the logo is centered and has transparent background (PNG format)

2. **Create Icon Files**
   - For each size (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi):
     - Create `ic_launcher.png` (square, full size)
     - Create `ic_launcher_round.png` (round, same size)
     - Create `ic_launcher_foreground.png` (foreground only, for adaptive icons)

3. **Replace Files**
   - Replace the files in each `mipmap-*` directory
   - Keep the same filenames

4. **Rebuild APK**
   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease
   ```

### Quick Method (Using Online Tools)

1. Go to https://icon.kitchen/ or https://www.appicon.co/
2. Upload your "SOW & REAP" logo image
3. Select "Android" platform
4. Download the generated icon pack
5. Extract and replace files in the `mipmap-*` directories

### Alternative: Use Capacitor Icon Generator

If you have the logo as a high-resolution image (at least 1024x1024px):

```bash
# Install capacitor icon generator (if not already installed)
npm install -g @capacitor/assets

# Place your logo as 'icon.png' in the project root (1024x1024px recommended)
# Then run:
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#000000'
```

This will automatically generate all required icon sizes.

### Note

The app name "Sow&Reap Biochar" is already updated in the configuration files. The icon visual needs to be replaced manually as described above.
