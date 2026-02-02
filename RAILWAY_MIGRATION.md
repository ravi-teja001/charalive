# Railway Postgres Migration Guide

This guide walks you through migrating from Supabase to Railway Postgres.

## Overview

The application now supports two backends:
- **Supabase** (legacy) – direct PostgREST + Auth
- **Railway Postgres** (new) – custom Express API + JWT auth

## Step 1: Create Railway Postgres Database

1. Go to [Railway](https://railway.app) and create a new project
2. Click **+ New** → **Database** → **PostgreSQL**
3. Railway will provision a Postgres instance and provide `DATABASE_URL`
4. Copy the `DATABASE_URL` (or use Railway's variable reference)

## Step 2: Run the Schema

Connect to your Railway Postgres and run the schema:

```bash
# Using psql (Railway provides connection details in the Variables tab)
psql $DATABASE_URL -f database/railway-schema.sql
```

Or use Railway's "Query" tab in the dashboard to paste and run `database/railway-schema.sql`.

## Step 3: Deploy the API Server

### Option A: Deploy to Railway

1. In your Railway project, click **+ New** → **GitHub Repo** (or upload the `server/` folder)
2. Set the root directory to `server` (or create a new service from the server folder)
3. Add environment variables:
   - `DATABASE_URL` – auto-injected when you link the Postgres service
   - `JWT_SECRET` – generate a strong secret: `openssl rand -hex 32`
   - `PORT` – Railway sets this automatically
4. Deploy

### Option B: Run Locally

```bash
cd server
npm install
# Set DATABASE_URL in .env or export it
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
npm run dev
```

The API runs on port 3001 by default.

## Step 4: Configure the Frontend

Create or update `.env.local`:

```env
VITE_USE_RAILWAY=true
VITE_API_BASE_URL=http://localhost:3001
```

For production, set `VITE_API_BASE_URL` to your deployed API URL (e.g. `https://your-app.railway.app`).

## Step 5: Create First User

Since Railway uses a custom `users` table (not Supabase Auth), you need to create the first user via signup in the app, or directly in the database:

```sql
-- Generate a bcrypt hash for password "changeme" (use an online bcrypt tool or Node):
-- bcrypt.hashSync('changeme', 10)
INSERT INTO users (email, name, password_hash, role)
VALUES ('admin@example.com', 'Admin', '$2a$10$...', 'supervisor_stockpoint');
```

Or simply use the app's **Signup** page – it will create users in the `users` table.

## Step 6: Data Migration (Optional)

If you have existing data in Supabase, you'll need to:

1. Export data from Supabase (Tables → Export)
2. Transform the schema (Supabase uses `auth.users`; Railway uses `users` with `password_hash`)
3. Import into Railway Postgres

The `users` table structure differs: Railway stores `password_hash`; Supabase uses `auth.users`. You'll need to set placeholder hashes for migrated users and have them reset passwords.

## Environment Variables Summary

| Variable | Frontend | Backend |
|----------|----------|---------|
| `VITE_USE_RAILWAY` | `true` to use Railway | – |
| `VITE_API_BASE_URL` | API URL | – |
| `DATABASE_URL` | – | Railway Postgres connection string |
| `JWT_SECRET` | – | Secret for signing JWTs |
| `PORT` | – | Server port (Railway sets automatically) |

## Switching Back to Supabase

Set `VITE_USE_RAILWAY=false` and ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are set.
