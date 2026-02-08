# Deploy Frontend on Railway

Deploy the frontend as a separate Railway service (API and frontend both on Railway).

## Prerequisites

- API already live on Railway (e.g. `https://charalive-production.up.railway.app`)
- Railway account connected to your GitHub repo

## Steps

### 1. Create a new service for the frontend

1. Go to [railway.app](https://railway.app) → Your project
2. Click **+ New** → **GitHub Repo**
3. Select your repo (same repo as API)

### 2. Configure the frontend service

In the new service → **Settings**:

| Setting | Value |
|---------|-------|
| **Root Directory** | Leave empty (project root) |
| **Build Command** | `npm run build:frontend` |
| **Start Command** | `npm run start` |
| **Watch Paths** | `src/`, `public/`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `package.json` (optional – for rebuild triggers) |

### 3. Environment variables

Add these in the frontend service → **Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://charalive-production.up.railway.app` (your API URL) |
| `VITE_USE_RAILWAY` | `true` |
| `NODE_ENV` | `production` |

### 4. Generate domain

1. Go to **Settings** → **Networking**
2. Click **Generate Domain**
3. Use this URL as your live frontend (e.g. `https://charalive-frontend.up.railway.app`)

### 5. Deploy

Push to GitHub; Railway will build and deploy the frontend.

---

## Summary

- **API service**: Root = `server`, runs the Node.js API
- **Frontend service**: Root = `.`, builds with `npm run build:frontend`, serves with `npm run start` (static files)

Both services run on Railway from the same repo.
