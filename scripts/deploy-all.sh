#!/bin/bash
set -e

echo "🚀 Biochar Management System - Complete Deployment Script"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📍 Project root: $PROJECT_ROOT${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print step
print_step() {
    echo ""
    echo -e "${GREEN}▶ $1${NC}"
    echo "----------------------------------------"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# ============================================
# 1. CHECK PREREQUISITES
# ============================================
print_step "Checking prerequisites"

if ! command_exists git; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git is installed"

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js $(node --version) is installed"

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm --version) is installed"

# ============================================
# 2. GIT STATUS & COMMIT
# ============================================
print_step "Checking Git status"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo ""
        read -p "Enter commit message: " commit_message
        if [[ -z "$commit_message" ]]; then
            commit_message="Update: automated deployment $(date +%Y-%m-%d)"
        fi
        git commit -m "$commit_message"
        print_success "Changes committed"
    else
        print_warning "Skipping commit. Proceeding with deployment..."
    fi
else
    print_success "No uncommitted changes"
fi

# ============================================
# 3. PUSH TO GITHUB
# ============================================
print_step "Pushing to GitHub"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_success "Current branch: $CURRENT_BRANCH"

# Check if remote exists
if git remote get-url origin >/dev/null 2>&1; then
    git push origin "$CURRENT_BRANCH"
    print_success "Pushed to GitHub (origin/$CURRENT_BRANCH)"
else
    print_warning "No remote 'origin' configured. Skipping push."
    echo "To add a remote: git remote add origin <your-repo-url>"
fi

# ============================================
# 4. RAILWAY DEPLOYMENT CHECK
# ============================================
print_step "Railway Deployment Status"

echo "Checking Railway API..."
if curl -s --max-time 5 https://charalive-production.up.railway.app/api/health | grep -q "ok"; then
    print_success "Railway API is live and healthy"
    RAILWAY_URL="https://charalive-production.up.railway.app"
else
    print_warning "Railway API is not responding or URL is incorrect"
    echo ""
    read -p "Enter your Railway API URL (or press Enter to skip): " user_railway_url
    if [[ -n "$user_railway_url" ]]; then
        RAILWAY_URL="$user_railway_url"
        # Update .env.production
        if [[ -f ".env.production" ]]; then
            sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$RAILWAY_URL|" .env.production
            rm -f .env.production.bak
            print_success "Updated .env.production with new URL"
        fi
    else
        RAILWAY_URL="https://charalive-production.up.railway.app"
        print_warning "Using default URL: $RAILWAY_URL"
    fi
fi

echo ""
echo "Railway API URL: $RAILWAY_URL"

# ============================================
# 5. BUILD ANDROID APK
# ============================================
print_step "Building Android APK"

# Check if Android SDK is available
if [[ ! -f "android/gradlew" ]]; then
    print_error "Android project not found. Run 'npx cap sync' first."
    exit 1
fi

# Ensure .env.production exists
if [[ ! -f ".env.production" ]]; then
    print_warning ".env.production not found. Creating it..."
    cat > .env.production << EOF
# Railway API URL
VITE_API_BASE_URL=$RAILWAY_URL
VITE_USE_RAILWAY=true
EOF
    print_success "Created .env.production"
fi

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Build frontend with production env
print_success "Building frontend with production environment..."
npm run build -- --mode production

# Sync Capacitor
print_success "Syncing Capacitor..."
npx cap sync android

# Build APK
print_success "Building Android APK (this may take a few minutes)..."
cd android
./gradlew clean assembleRelease
cd ..

# Copy APK to distribution folder
mkdir -p APK_DISTRIBUTION
APK_SOURCE="android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="APK_DISTRIBUTION/Biochar-Management-System-v$(date +%Y%m%d-%H%M%S).apk"

if [[ -f "$APK_SOURCE" ]]; then
    cp "$APK_SOURCE" "$APK_DEST"
    # Also create a "latest" copy
    cp "$APK_SOURCE" "APK_DISTRIBUTION/Biochar-Management-System-LATEST.apk"
    
    APK_SIZE=$(ls -lh "$APK_DEST" | awk '{print $5}')
    print_success "APK built successfully!"
    echo ""
    echo "📱 APK Location: $APK_DEST"
    echo "📦 APK Size: $APK_SIZE"
    echo ""
    echo "Latest APK: APK_DISTRIBUTION/Biochar-Management-System-LATEST.apk"
else
    print_error "APK build failed. Check the logs above."
    exit 1
fi

# ============================================
# 6. DEPLOYMENT SUMMARY
# ============================================
echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE${NC}"
echo "=========================================================="
echo ""
echo "📋 Summary:"
echo "  • Git: Committed and pushed to $CURRENT_BRANCH"
echo "  • Railway API: $RAILWAY_URL"
echo "  • APK: $APK_DEST"
echo ""
echo "📱 Share APK with your team:"
echo "  1. Upload to Google Drive/Dropbox"
echo "  2. Share via WhatsApp/Telegram"
echo "  3. Email as attachment"
echo ""
echo "🔗 Next Steps:"
echo "  • Railway will auto-deploy from GitHub push"
echo "  • Monitor deployment: https://railway.app"
echo "  • Test APK on Android device"
echo ""
echo "=========================================================="
