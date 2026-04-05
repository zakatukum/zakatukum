import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client (uses anon key, respects RLS)
// Lazy singleton — created on first access so env vars are always available at runtime
let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = supabaseUrl || (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_URL) || '';
  const key = supabaseAnonKey || (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_ANON_KEY) || '';
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _supabase;
}

// For backward compatibility — creates client immediately if env vars available
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
