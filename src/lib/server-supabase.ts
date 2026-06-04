import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
  );
}

/**
 * Creates an authenticated Supabase client for server components/actions.
 * Passes the Clerk session JWT so Supabase RLS policies are enforced.
 *
 * NOTE: Requires a "supabase" JWT template in Clerk Dashboard and
 * the corresponding JWT secret configured in Supabase Auth settings.
 * See: https://clerk.com/docs/integrations/supabase
 */
export async function getServerSupabase() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
