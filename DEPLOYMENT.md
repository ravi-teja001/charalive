# Biochar Bloom – Deployment Guide

Deploy the API and frontend to production. Uses **Railway** for the API + Postgres, and **Vercel** or **Netlify** for the frontend.

> **Quick start:** See [RAILWAY_QUICK_DEPLOY.md](./RAILWAY_QUICK_DEPLOY.md) for a shorter API deploy guide.

---

## Prerequisites

- Railway account: [railway.app](https://railway.app)
- Vercel or Netlify account (for frontend)
- GitHub repo with your code (recommended)

---

## Part 1: Railway – Database + API

### 1.1 Create Project & Database

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. **New Project** → **Deploy from GitHub repo** (or **Empty Project**)
3. If using GitHub, connect your repo and select `biochar-bloom-main`

### 1.2 Add PostgreSQL

1. In the project, click **+ New** → **Database** → **PostgreSQL**
2. After it deploys, open it → **Variables** → copy `DATABASE_URL` (or use `DATABASE_PUBLIC_URL` if connecting from outside Railway)

### 1.3 Apply Database Schema

Use one of these options:

**Option A – One command (recommended)**

```bash
# Ensure DATABASE_URL is in server/.env, then:
npm run setup-db
```

Or with inline URL:

```bash
DATABASE_URL="postgresql://postgres:xxx@xxx.proxy.rlwy.net:xxxxx/railway" npm run setup-db
```

**Option B – Railway Query tab**

1. Open the Postgres service → **Data** → **Query**
2. Paste and run the contents of `database/railway-schema.sql`
3. Run `database/ADD_USER_ROLES.sql`
4. Run `database/ADD_VEHICLE_TYPES.sql`

**Option C – Local psql**

```bash
export DATABASE_URL="postgresql://postgres:xxx@xxx.proxy.rlwy.net:xxxxx/railway"
psql $DATABASE_URL -f database/railway-schema.sql
psql $DATABASE_URL -f database/ADD_USER_ROLES.sql
psql $DATABASE_URL -f database/ADD_VEHICLE_TYPES.sql
```

### 1.4 Deploy API Server

1. In the same Railway project, click **+ New** → **GitHub Repo**
2. Select your repo, then configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Watch Paths:** `server/**`

3. **Variables** – add:

   | Variable     | Value                                                                 |
   |-------------|-----------------------------------------------------------------------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference from Postgres service)     |
   | `JWT_SECRET`   | Generate: `openssl rand -hex 32`                                    |

4. Deploy and wait for it to finish.

5. **Generate Domain**  
   Open the API service → **Settings** → **Networking** → **Generate Domain**  
   Copy the URL (e.g. `https://biochar-api-production-xxxx.up.railway.app`).

---

## Part 2: Frontend (Vercel or Netlify)

### 2.1 Environment Variables for Build

Add this variable before building:

| Variable              | Value                                  |
|-----------------------|----------------------------------------|
| `VITE_API_BASE_URL`   | Your Railway API URL (e.g. `https://biochar-api-production-xxxx.up.railway.app`) |
| `VITE_USE_RAILWAY`    | `true`                                 |

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. **Add New** → **Project** → import your GitHub repo.
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (or leave blank)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables**:
   - `VITE_API_BASE_URL` = your Railway API URL
   - `VITE_USE_RAILWAY` = `true`

5. Deploy. Your app will be at `https://your-project.vercel.app`.

### 2.3 Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in.
2. **Add new site** → **Import an existing project** → connect GitHub.
3. Configure:
   - **Base directory:** (leave blank)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Environment variables** (Site settings → Environment variables):
   - `VITE_API_BASE_URL` = your Railway API URL
   - `VITE_USE_RAILWAY` = `true`

5. Deploy.

### 2.4 Deploy Frontend to Railway (Static Site)

1. In the same Railway project, **+ New** → **GitHub Repo**
2. Configure:
   - **Root Directory:** `.` (project root, not `server`)
   - **Build Command:** `npm install && npm run build`
   - **Output Directory:** `dist`
   - **Start Command:** Leave empty for static (Railway uses Nixpacks)

3. **Variables:**
   - `VITE_API_BASE_URL` = your API Railway URL
   - `VITE_USE_RAILWAY` = `true`

4. Deploy and generate a domain.

---

## Part 3: CORS

The API uses `cors({ origin: true })`, so it accepts requests from any origin. For stricter security, update `server/index.ts`:

```ts
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'https://your-frontend.netlify.app'],
  credentials: true,
}));
```

---

## Part 4: First User

1. Open the deployed frontend URL.
2. Go to **Sign up** and create an account.
3. Or insert directly into Postgres:

```sql
-- Use bcrypt to hash "yourpassword" at bcrypt-generator.com, then:
INSERT INTO users (email, name, password_hash, role)
VALUES ('admin@example.com', 'Admin', '$2a$10$...', 'supervisor_stockpoint');
```

---

## Checklist

- [ ] Railway Postgres created
- [ ] Schema + migrations applied
- [ ] API deployed on Railway with `DATABASE_URL` and `JWT_SECRET`
- [ ] API domain generated and URL copied
- [ ] Frontend built with `VITE_API_BASE_URL` and `VITE_USE_RAILWAY=true`
- [ ] Frontend deployed (Vercel / Netlify / Railway)
- [ ] First user created via signup or SQL

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on refresh | Ensure `VITE_API_BASE_URL` is correct and matches the deployed API URL. |
| CORS errors | Add the frontend URL to CORS in `server/index.ts`. |
| API 500 errors | Check Railway logs; ensure `DATABASE_URL` and `JWT_SECRET` are set. |
| Schema errors | Run `railway-schema.sql`, `ADD_USER_ROLES.sql`, `ADD_VEHICLE_TYPES.sql`. |
