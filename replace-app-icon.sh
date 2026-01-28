#!/bin/bash

# Script to replace Android app icon with SOW & REAP logo
# Usage: Place your logo as 'logo.png' in the project root (1024x1024px recommended)
# Then run: ./replace-app-icon.sh

echo "🔄 Replacing Android app icon with SOW & REAP logo..."

# Check if logo.png exists
if [ ! -f "logo.png" ]; then
    echo "❌ Error: logo.png not found in project root!"
    echo "Please place your SOW & REAP logo as 'logo.png' (1024x1024px recommended) in the project root."
    exit 1
fi

# Check if ImageMagick is installed (for resizing)
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Please install it first:"
    echo "   macOS: brew install imagemagick"
    echo "   Linux: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

echo "✅ Logo file found, generating icon sizes..."

# Icon sizes for different densities
declare -A sizes=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Working in temporary directory: $TEMP_DIR"

# Generate all sizes
for density in "${!sizes[@]}"; do
    size=${sizes[$density]}
    echo "  Generating ${density} (${size}x${size}px)..."
    
    # Create square icon
    convert logo.png -resize ${size}x${size} -gravity center -background none -extent ${size}x${size} "$TEMP_DIR/ic_launcher_${density}.png"
    
    # Create round icon (with rounded corners)
    convert logo.png -resize ${size}x${size} -gravity center -background none \( +clone -alpha extract -draw 'fill black polygon 0,0 0,10 10,0 fill white circle 10,10 10,0' \( +clone -flip \) -compose Multiply -composite \( +clone -flop \) -compose Multiply -composite \) -alpha off -compose CopyOpacity -composite "$TEMP_DIR/ic_launcher_round_${density}.png"
    
    # Create foreground (same as square for now)
    convert logo.png -resize ${size}x${size} -gravity center -background transparent -extent ${size}x${size} "$TEMP_DIR/ic_launcher_foreground_${density}.png"
done

echo "✅ Icon sizes generated, copying to Android resources..."

# Copy to Android resources
for density in "${!sizes[@]}"; do
    target_dir="android/app/src/main/res/mipmap-${density}"
    
    # Create directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Backup original icons
    if [ -f "$target_dir/ic_launcher.png" ]; then
        cp "$target_dir/ic_launcher.png" "$target_dir/ic_launcher.png.backup" 2>/dev/null || true
    fi
    
    # Copy new icons
    cp "$TEMP_DIR/ic_launcher_${density}.png" "$target_dir/ic_launcher.png"
    cp "$TEMP_DIR/ic_launcher_round_${density}.png" "$target_dir/ic_launcher_round.png"
    cp "$TEMP_DIR/ic_launcher_foreground_${density}.png" "$target_dir/ic_launcher_foreground.png"
    
    echo "  ✅ Updated $target_dir"
done

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ App icon replacement complete!"
echo "📱 Next steps:"
echo "   1. Run: npm run build"
echo "   2. Run: npx cap sync android"
echo "   3. Run: cd android && ./gradlew assembleRelease"
echo "   4. Install the new APK from: android/app/build/outputs/apk/release/app-release.apk"
