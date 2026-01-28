export const environment = {
  production: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY || '',
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  // AWS S3 Configuration
  awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  awsAccessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  s3BucketName: import.meta.env.VITE_S3_BUCKET_NAME || 'biochar-photos',
};
