#!/usr/bin/env node
/**
 * Apply all required migrations to Railway Postgres.
 * Usage: DATABASE_URL="postgresql://..." node scripts/apply-all-migrations.js
 *    Or: npm run setup-db (loads DATABASE_URL from server/.env)
 */

import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dbDir = join(root, 'database');

function loadEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      const key = m[1].trim();
      if (!(key in process.env)) {
        process.env[key] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}
loadEnv(join(root, 'server', '.env'));
loadEnv(join(root, '.env'));

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ DATABASE_URL is required');
  console.error('   Run: DATABASE_URL="your-railway-url" npm run setup-db');
  console.error('   Or set it in server/.env');
  process.exit(1);
}

const maskedConnectionString = connectionString.replace(
  /(postgresql:\/\/[^:]+):[^@]+@/,
  (_, prefix) => `${prefix}:***@`
);
console.log(`🔗 Using database connection: ${maskedConnectionString}`);

const migrations = [
  { file: 'railway-schema.sql', name: 'Main schema' },
  { file: 'ADD_USER_ROLES.sql', name: 'User roles' },
  { file: 'ADD_VEHICLE_TYPES.sql', name: 'Vehicle types' },
];

async function apply() {
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('railway') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('📦 Applying migrations...\n');

    for (const { file, name } of migrations) {
      const path = join(dbDir, file);
      try {
        const sql = readFileSync(path, 'utf8');
        await client.query(sql);
        console.log(`   ✅ ${name} (${file})`);
      } catch (err) {
        if (err.message?.includes('already exists') || err.code === '42P07') {
          console.log(`   ⏭️  ${name} (${file}) - already applied`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ All migrations applied successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

apply();
