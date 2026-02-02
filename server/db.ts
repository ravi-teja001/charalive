import pg from 'pg';

const { Pool } = pg;

// Railway provides DATABASE_URL automatically when you add Postgres
const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL or PG_CONNECTION_STRING not set. API will fail without database.');
}

// Parse URL and pass config explicitly to ensure password is always a string (fixes SASL error)
function getPoolConfig() {
  if (!connectionString) {
    return { connectionString: '', ssl: undefined };
  }
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      user: decodeURIComponent(url.username || 'postgres'),
      password: String(decodeURIComponent(url.password || '')),
      database: url.pathname?.slice(1) || 'railway',
      ssl: connectionString.includes('railway') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  } catch {
    return {
      connectionString,
      ssl: connectionString.includes('railway') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
}

export const pool = new Pool(getPoolConfig());
