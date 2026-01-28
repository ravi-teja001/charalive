import { createClient } from '@supabase/supabase-js';
import { environment } from './environment';

// Validate environment variables
if (!environment.supabaseUrl || !environment.supabaseKey) {
  console.error('❌ Supabase environment variables are not set!');
  console.error('🔧 Required: VITE_SUPABASE_URL and VITE_SUPABASE_KEY');
  console.error('🔧 Please check your .env.local file');
  console.error('🔧 Current values:', {
    supabaseUrl: environment.supabaseUrl ? 'SET' : 'MISSING',
    supabaseKey: environment.supabaseKey ? 'SET' : 'MISSING'
  });
}

export const supabase = createClient(
  environment.supabaseUrl || 'https://placeholder.supabase.co',
  environment.supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'biochar-management-system'
      }
    }
  }
);

// Test connection
console.log('🔍 Supabase client initialized');
console.log('🔗 URL:', environment.supabaseUrl ? 'SET' : 'MISSING');
console.log('🔑 Key:', environment.supabaseKey ? 'SET' : 'MISSING');
