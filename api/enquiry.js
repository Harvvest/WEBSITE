import {dispatchEnquiry} from '../lib/enquiry.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({stored:false,error:'Method not allowed'}); }
  if (!req.headers['content-type']?.includes('application/json')) return res.status(415).json({stored:false,error:'JSON required'});
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({stored:false,error:'Invalid JSON'}); } }
  if (JSON.stringify(body || {}).length > 8192) return res.status(413).json({stored:false,error:'Request too large'});
  const result = await dispatchEnquiry(body);
  return res.status(result.status).json(result.data);
}
