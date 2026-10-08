// Vercel Serverless Function: /api/admin/config
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  return res.status(200).json({
    configured: isConfigured,
    supabaseUrl: supabaseUrl || null,
    supabaseAnonKey: supabaseAnonKey || null
  });
}
