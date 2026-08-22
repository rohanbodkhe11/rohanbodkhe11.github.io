import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.SUPABASE_CONFIG || {};
export const supabase = config.url && config.publishableKey
  ? createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
export function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured. Add SUPABASE_CONFIG in js/supabase-config.js.');
  return supabase;
}
export async function requireAdmin() {
  const client = requireSupabase();
  const { data: { session } } = await client.auth.getSession();
  if (!session) { location.href = '../login/'; return null; }
  const { data: admin, error } = await client.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (error || !admin) { await client.auth.signOut(); location.href = '../login/'; return null; }
  return session;
}
