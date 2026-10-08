export async function dispatchEnquiry(body, env = process.env) {
  const fail = (status, error) => ({status, data:{stored:false,error}});
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400,'Invalid request');
  if (body.website) return fail(400,'Invalid request');
  const clean = key => typeof body[key] === 'string' ? body[key].trim() : '';
  const payload = {name:clean('name'), mobile:clean('mobile'), program:clean('program'), mode:clean('mode'), message:clean('message'), requestId:clean('requestId')};
  if (!payload.name || payload.name.length > 100 || !/^[+\d ()-]{10,20}$/.test(payload.mobile) || payload.mobile.replace(/\D/g,'').length < 10 || !['HARVVEST Trading Program','Advanced Mastery Program','Help me choose'].includes(payload.program) || !['Offline','Online'].includes(payload.mode) || payload.message.length > 1500 || !/^[a-zA-Z0-9-]{16,80}$/.test(payload.requestId)) return fail(400,'Check required fields');
  const webhook = env.ENQUIRY_DISPATCH_WEBHOOK_URL;
  const token = env.ENQUIRY_DISPATCH_TOKEN;
  if (!webhook || !token) return fail(503,'Enquiry service unavailable');
  let url;
  try { url = new URL(webhook); } catch { return fail(503,'Enquiry service unavailable'); }
  if (url.protocol !== 'https:') return fail(503,'Enquiry service unavailable');
  try {
    const response = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,token}),signal:AbortSignal.timeout(12000),redirect:'follow'});
    const result = await response.json();
    if (!response.ok || result.stored !== true) return fail(502,'Unable to confirm storage');
    return {status:200,data:{stored:true}};
  } catch { return fail(502,'Unable to confirm storage'); }
}
