import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getAuthClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getAccessTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim();
}

export async function requireAuthenticatedUser(request) {
  const token = getAccessTokenFromRequest(request);
  const authClient = getAuthClient();

  if (!token || !authClient) {
    return {
      user: null,
      error: 'No autorizado.',
      status: 401,
    };
  }

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      error: 'Sesion invalida o expirada.',
      status: 401,
    };
  }

  return {
    user: data.user,
    error: null,
    status: 200,
  };
}
