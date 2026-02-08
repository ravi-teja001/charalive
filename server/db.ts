import pg from 'pg';

const { Pool } = pg;

// For local dev: use DATABASE_PUBLIC_URL (connects from outside Railway)
// On Railway: DATABASE_URL is private and works within their network
const connectionString =
  process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL or DATABASE_PUBLIC_URL not set. API will fail without database.');
}

// Parse URL and pass config explicitly to ensure password is always a string (fixes SASL error)
const isRailway = (s: string) => s.includes('railway') || s.includes('rlwy');

function getPoolConfig() {
  if (!connectionString) {
    return { connectionString: '', ssl: undefined };
  }
  const ssl = isRailway(connectionString) ? { rejectUnauthorized: false } : undefined;
  const base = {
    ssl,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 20000,
    keepAlive: true,
    allowExitOnIdle: false,
  };
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      user: decodeURIComponent(url.username || 'postgres'),
      password: String(decodeURIComponent(url.password || '')),
      database: url.pathname?.slice(1) || 'railway',
      ...base,
    };
  } catch {
    return {
      connectionString,
      ...base,
    };
  }
}

const rawPool = new Pool(getPoolConfig());

rawPool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

/** Retry on connection errors (e.g. ETIMEDOUT, connection terminated) */
async function queryWithRetry<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: pg.QueryConfig | string,
  values?: unknown[]
): Promise<pg.QueryResult<T>> {
  const config = typeof text === 'string' ? { text, values } : text;
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await rawPool.query<T>(config);
      return result as pg.QueryResult<T>;
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      const isConnError =
        msg.includes('etimedout') ||
        msg.includes('econnreset') ||
        msg.includes('terminated') ||
        msg.includes('connection refused') ||
        msg.includes('connection ended') ||
        msg.includes('read econnreset');
      if (isConnError && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unreachable');
}

export const pool = {
  query: queryWithRetry,
  connect: rawPool.connect.bind(rawPool),
  end: rawPool.end.bind(rawPool),
  on: rawPool.on.bind(rawPool),
} as pg.Pool;
