#!/usr/bin/env node
/**
 * Automatically apply the Railway schema to the database.
 * Usage: DATABASE_URL="postgresql://..." node apply-schema.js
 *    or: npm run apply-schema (loads from server/.env if present)
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ DATABASE_URL or PG_CONNECTION_STRING is required');
  console.error('   Set it in .env or run: DATABASE_URL="your-url" npm run apply-schema');
  process.exit(1);
}

const schemaPath = join(__dirname, '..', 'database', 'railway-schema.sql');
const sql = readFileSync(schemaPath, 'utf8');

async function apply() {
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('railway') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ Schema applied successfully!');
  } catch (err) {
    console.error('❌ Schema application failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

apply();
