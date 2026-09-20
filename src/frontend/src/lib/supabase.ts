import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfcmtterczcpwpelhupg.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY210dGVyY3pjcHdwZWxodXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MzAwMTcsImV4cCI6MjEwNTQwNjAxN30.9pNvu5mQmaPWgmX2QbBWs0i1nS7ftGek710SrjUlrcw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
