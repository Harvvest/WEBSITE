// Vercel Serverless Function: /api/admin/session
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-only Admin Allowlist (ADMIN_ALLOWED_UIDS preferred, ADMIN_USER_IDS accepted as fallback)
const rawAdminUids = process.env.ADMIN_ALLOWED_UIDS || process.env.ADMIN_USER_IDS || '';
const ADMIN_ALLOWED_UIDS = rawAdminUids
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.error('[Supabase Init Error]:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No Bearer token provided.'
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token is empty.'
    });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      success: false,
      error: 'Supabase server configuration is missing. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured on the server.'
    });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: error ? error.message : 'Invalid or expired session token.'
      });
    }

    if (ADMIN_ALLOWED_UIDS.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No administrator user IDs configured in server allowlist (ADMIN_ALLOWED_UIDS). Access denied.'
      });
    }

    if (!ADMIN_ALLOWED_UIDS.includes(user.id)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. User (${user.email || user.id}) is not an authorized administrator.`
      });
    }

    return res.status(200).json({
      success: true,
      authorized: true,
      admin: {
        id: user.id,
        email: user.email,
        lastSignInAt: user.last_sign_in_at,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[Vercel Serverless Admin Auth Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server authentication error.'
    });
  }
}
