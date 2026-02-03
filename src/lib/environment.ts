export const environment = {
  production: import.meta.env.PROD,
  /** @deprecated Use apiBaseUrl for Railway Postgres migration */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY || '',
  /** In dev: use '' so Vite proxies /api to API server. In prod: always use production API, never localhost */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://charalive-production.up.railway.app'),
  /** Use Railway by default; set VITE_USE_RAILWAY=false to use Supabase */
  useRailway: import.meta.env.VITE_USE_RAILWAY !== 'false',
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  // AWS S3 Configuration
  awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  awsAccessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  s3BucketName: import.meta.env.VITE_S3_BUCKET_NAME || 'biochar-photos',
};
