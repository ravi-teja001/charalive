# 🚀 Quick Start - Automated Deployment

This guide shows you how to deploy everything with a single command.

## Prerequisites

- Node.js 18+ installed
- Git configured
- Android Studio (for APK builds)
- Railway account with project set up

## One-Command Deployment

```bash
npm run deploy:all
```

This will automatically:
1. ✅ Check for uncommitted changes and commit them
2. ✅ Push code to GitHub
3. ✅ Verify Railway API is running
4. ✅ Build production frontend
5. ✅ Generate signed Android APK
6. ✅ Copy APK to `APK_DISTRIBUTION/` folder

## What You Get

After running the command, you'll have:

- **APK File**: `APK_DISTRIBUTION/Biochar-Management-System-LATEST.apk`
- **Timestamped APK**: `APK_DISTRIBUTION/Biochar-Management-System-v[timestamp].apk`
- **Railway API**: Auto-deployed via GitHub integration
- **Git**: All changes committed and pushed

## Manual Steps (if needed)

### Build APK Only
```bash
npm run build:apk
```

### Deploy to Railway Only
```bash
npm run deploy:railway
```

### Setup Database
```bash
npm run setup-db
```

## Sharing the APK

The APK is located at:
```
APK_DISTRIBUTION/Biochar-Management-System-LATEST.apk
```

Share it with your team via:
- Google Drive / Dropbox
- WhatsApp / Telegram
- Email

## Troubleshooting

### "Railway API not responding"
- Check your Railway dashboard
- Verify the API URL in `.env.production`
- Update the URL when prompted by the script

### "APK build failed"
- Ensure Android Studio is installed
- Run `npx cap sync android` first
- Check `android/gradlew` exists

### "Git push failed"
- Verify remote is configured: `git remote -v`
- Add remote: `git remote add origin <your-repo-url>`

## Railway Setup (First Time)

If you haven't set up Railway yet:

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"

3. **Configure API Service**
   - Settings → Root Directory: `server`
   - Add environment variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=<your-secret-key>
     PORT=3001
     ```

4. **Generate Domain**
   - Settings → Networking → Generate Domain
   - Copy the URL (e.g., `https://charalive-production.up.railway.app`)

5. **Apply Database Schema**
   ```bash
   npm run setup-db
   ```

6. **Deploy**
   - Railway auto-deploys on Git push
   - Or run: `npm run deploy:railway`

## Environment Variables

### `.env.production` (for APK builds)
```env
VITE_API_BASE_URL=https://your-railway-url.up.railway.app
VITE_USE_RAILWAY=true
```

### `server/.env` (for local development)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
PORT=3001
```

## Next Steps

1. Run `npm run deploy:all`
2. Wait for APK to build (~2-3 minutes)
3. Share APK from `APK_DISTRIBUTION/` folder
4. Monitor Railway deployment at railway.app

---

**Need help?** Check the full documentation in `DEPLOYMENT.md`
