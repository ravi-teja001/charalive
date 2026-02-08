/**
 * Run schema migrations automatically on server startup.
 * Uses CREATE TABLE IF NOT EXISTS so re-runs are safe.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Pool } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolve path to repo database folder (works when cwd is server/ or repo root). */
function getDatabasePath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'database'),
    join(cwd, '..', 'database'),
    join(__dirname, '..', '..', 'database'), // from server/dist -> repo root
  ];
  for (const p of candidates) {
    if (existsSync(join(p, 'railway-schema.sql'))) return p;
  }
  return null;
}

const MIGRATIONS = [
  { file: 'railway-schema.sql', name: 'Main schema' },
  { file: 'ADD_USER_ROLES.sql', name: 'User roles' },
  { file: 'ADD_VEHICLE_TYPES.sql', name: 'Vehicle types' },
  { file: 'ADD_ADMIN_ROLE.sql', name: 'Admin role' },
];

export async function runMigrationsAutomatically(pool: Pool): Promise<void> {
  const dbPath = getDatabasePath();
  if (!dbPath) {
    console.warn('⚠️ database/ folder not found (migrations skipped). Set DATABASE_URL and run apply-schema manually if needed.');
    return;
  }

  try {
    for (const { file, name } of MIGRATIONS) {
      const filePath = join(dbPath, file);
      if (!existsSync(filePath)) continue;

      const sql = readFileSync(filePath, 'utf8');
      try {
        await pool.query(sql);
        console.log(`   ✅ Auto-migration: ${name} (${file})`);
      } catch (err: any) {
        if (err?.message?.includes('already exists') || err?.code === '42P07') {
          console.log(`   ⏭️  Auto-migration: ${name} - already applied`);
        } else {
          throw err;
        }
      }
    }
    console.log('✅ Auto-migrations completed');
  } catch (e: any) {
    console.error('❌ Auto-migration failed:', e?.message || e);
    // Don't exit - server can still run; admin can fix DB and restart
  }
}
