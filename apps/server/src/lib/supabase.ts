import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Debug: Log whether env vars are set
console.log('[Supabase] Config check - URL set:', !!config.supabaseUrl, 'ServiceKey set:', !!config.supabaseServiceRoleKey);
console.log('[Supabase] URL length:', config.supabaseUrl?.length || 0, 'ServiceKey length:', config.supabaseServiceRoleKey?.length || 0);

// Admin client with service role key for JWT verification and user management
export const supabaseAdmin = config.supabaseUrl && config.supabaseServiceRoleKey
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Verify a Supabase JWT token and return the user
 */
export async function verifyToken(token: string) {
  if (!supabaseAdmin) {
    console.log('[Auth] supabaseAdmin is null - missing SUPABASE_URL or SERVICE_ROLE_KEY');
    return null;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    console.log('[Auth] Token verification error:', error.message);
  }

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
  };
}
