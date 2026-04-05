import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Graceful fallback if env vars missing during build
const isMissing = !supabaseUrl || !supabaseAnonKey;

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = isMissing
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
// trigger redeploy
