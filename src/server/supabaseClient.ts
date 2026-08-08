import { createClient } from '@supabase/supabase-js';

// SUPABASE_SERVICE_ROLE_KEY is a secret key — it must NEVER be used in frontend code.
// It is only ever read here, on the server (local Express dev server / Netlify Function).
let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as environment variables. ' +
        'Locally: put them in .env.local. On Netlify: Site settings -> Environment variables.'
    );
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
