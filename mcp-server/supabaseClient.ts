import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://pwifzztuubxkyrqljtyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWZ6enR1dWJ4a3lycWxqdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjY2MjcsImV4cCI6MjA4MzYwMjYyN30.VGH7XehNnKNCbYFprOBPHbqdqZ3ptTML_t-Dakf4E4c';

export const supabase = createClient(supabaseUrl, supabaseKey);
