# Deploy API to Railway – Step by Step

## 1. One-Click Start

1. Go to **https://railway.app/new**
2. Click **"Deploy from GitHub repo"**
3. Select **ravi-teja001/charalive** (branch: **Dev**)
4. Click **Deploy**

## 2. Add PostgreSQL

1. In your project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Wait for it to provision (~30 sec)
4. Click the Postgres service → **Variables** → copy **`DATABASE_PUBLIC_URL`** (use this, not the internal one)

## 3. Configure the API Service

1. Click your **web service** (the one from GitHub, not Postgres)
2. Go to **Settings**
3. Under **Source**, set **Root Directory** to: `server`
4. Click **Variables** → **Add Variable**
5. Add:
   - **Name:** `DATABASE_URL`  
   - **Value:** Click "Add Reference" → select Postgres → `DATABASE_PUBLIC_URL`
6. Add another variable:
   - **Name:** `JWT_SECRET`  
   - **Value:** Run locally: `openssl rand -hex 32` and paste the output
7. Go to **Settings** → **Networking** → **Generate Domain**
8. Copy the URL (e.g. `https://xxx.up.railway.app`)

## 4. Apply Database Schema

From your project folder:

```bash
# Put DATABASE_URL in server/.env first (the PUBLIC URL from step 2), then:
npm run setup-db
```

Or paste the SQL in Railway: Postgres service → **Data** → **Query** tab:

1. Contents of `database/railway-schema.sql`
2. Contents of `database/ADD_USER_ROLES.sql`
3. Contents of `database/ADD_VEHICLE_TYPES.sql`

## 5. Done

Your API is live. Use the generated URL as `VITE_API_BASE_URL` when deploying the frontend.

---

**Summary of settings:**
- Root Directory: `server`
- Variables: `DATABASE_URL` (from Postgres), `JWT_SECRET`
