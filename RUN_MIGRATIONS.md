# Run migrations (fix "Database table missing")

Your production Postgres has no tables yet. Run migrations **once** from your machine.

## 1. Get the production Postgres URL from Railway

- Open **Railway** → your project → **Postgres** service
- Go to **Variables** (or **Connect**)
- Copy the **connection URL** (e.g. `DATABASE_URL` or `POSTGRES_URL`)
- It looks like: `postgresql://postgres:xxxxx@xxxxx.proxy.rlwy.net:12345/railway`

## 2. Run migrations from project root

In a terminal, from the **biochar-bloom-main** folder:

```bash
cd /Users/hamsi/Documents/PROJECT_CHARA/SU\&RA_MA/biochar-bloom-main
DATABASE_URL="PASTE_YOUR_RAILWAY_POSTGRES_URL_HERE" npm run setup-db
```

Replace `PASTE_YOUR_RAILWAY_POSTGRES_URL_HERE` with the exact URL from step 1 (keep the quotes).

You should see:

```
📦 Applying migrations...
   ✅ Main schema (railway-schema.sql)
   ✅ User roles (ADD_USER_ROLES.sql)
   ✅ Vehicle types (ADD_VEHICLE_TYPES.sql)
✅ All migrations applied successfully!
```

## 3. Try signup again

Refresh your app and sign up again. The "Database table missing" error should be gone.

---

**Option B – Use `server/.env`**

1. In `biochar-bloom-main/server/` create or edit `.env`
2. Add one line: `DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway` (your real URL)
3. From project root run: `npm run setup-db`

The script reads `DATABASE_URL` from `server/.env` automatically.
