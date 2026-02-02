import { createClient } from '@supabase/supabase-js';
import { environment } from './environment';

// When using Railway, use placeholder to avoid Supabase auth/CORS errors
const usePlaceholder = environment.useRailway;

export const supabase = createClient(
  usePlaceholder ? 'https://placeholder.supabase.co' : (environment.supabaseUrl || 'https://placeholder.supabase.co'),
  usePlaceholder ? 'placeholder-key' : (environment.supabaseKey || 'placeholder-key'),
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
