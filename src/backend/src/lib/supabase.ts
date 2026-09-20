import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'FATAL: Supabase configuration missing. Both SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be provided in the environment. Silent mock fallback is strictly disabled.'
  );
}

// Base Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to create or scope client with a user's JWT
export function getSupabaseClient(token?: string): SupabaseClient {
  if (!token) return supabase;

  return createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// Health check function for database connectivity verification
export async function verifySupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('jurisdiction_zones').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Supabase query failed: ${error.message}` };
    }
    return { ok: true, message: 'Connected to Supabase PostgreSQL' };
  } catch (err: any) {
    return { ok: false, message: `Supabase connection error: ${err.message}` };
  }
}
