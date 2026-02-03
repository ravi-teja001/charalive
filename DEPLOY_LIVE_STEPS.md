# Deploy Frontend Live (2 minutes)

Your code is **pushed to GitHub**. Deploy the web app:

---

## Option 1: Vercel (recommended)

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import **ravi-teja001/charalive** (select the repo)
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** leave empty (project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables** (Add):
     - `VITE_API_BASE_URL` = `https://charalive-production.up.railway.app`
     - `VITE_USE_RAILWAY` = `true`
5. Click **Deploy**
6. Your live URL: `https://charalive-xxx.vercel.app` (or your custom domain)

---

## Option 2: Netlify

1. Go to **https://netlify.com** → Sign in with GitHub
2. **Add new site** → **Import an existing project**
3. Choose **ravi-teja001/charalive**
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables** (Add):
     - `VITE_API_BASE_URL` = `https://charalive-production.up.railway.app`
     - `VITE_USE_RAILWAY` = `true`
5. Deploy

---

## What's Already Live

- **API:** https://charalive-production.up.railway.app (Railway)
- **GitHub:** Code pushed to `Dev` branch
- **Railway:** Auto-deploys on push (API is live)

---

## After Deploy

Your web app will:
- Work in the browser (desktop & mobile)
- Connect to Railway API
- Support login, dashboard, and all features
