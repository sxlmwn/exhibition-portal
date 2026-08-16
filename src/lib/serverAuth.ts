import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Validates the Authorization Bearer token from an incoming Next.js API Request.
 * Returns the authenticated Supabase user, or null if unauthorized.
 */
export async function verifyAuthUser(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return null;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key missing in environment variables');
      return null;
    }

    const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await serverClient.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return user;
  } catch (err) {
    console.error('Error verifying auth user in API route:', err);
    return null;
  }
}
