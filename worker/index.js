// AbiaWay Paystack verification worker.
// Free Cloudflare Worker that replaces the Firebase Cloud Function on Spark.
// Env (set via `wrangler secret put`): PAYSTACK_SECRET_KEY, FIREBASE_PROJECT_ID,
// FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (service account, PKCS#8 PEM).

const BASE = (projectId) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore';

let cachedToken = null;
let cachedTokenExpiry = 0;

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });

const base64url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;

  const pem = env.FIREBASE_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);

  const enc = (o) => base64url(new TextEncoder().encode(JSON.stringify(o)));
  const signingInput = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: FIREBASE_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${base64url(new Uint8Array(sig))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  cachedToken = data.access_token;
  cachedTokenExpiry = now + (data.expires_in || 3600) - 60;
  return cachedToken;
}

async function firestoreFetch(env, path, init) {
  const token = await getAccessToken(env);
  return fetch(`${BASE(env.FIREBASE_PROJECT_ID)}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

const docName = (env, path) =>
  `${BASE(env.FIREBASE_PROJECT_ID)}/${path}`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ success: false, message: 'Invalid JSON' }, 400); }
    const { reference, amount, email, uid } = body;
    if (!reference || typeof amount !== 'number' || !uid) {
      return json({ success: false, message: 'reference, amount and uid required' }, 400);
    }

    // 1. Verify with Paystack (server-to-server, secret stays here)
    let vdata;
    try {
      const vres = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
      });
      vdata = await vres.json();
    } catch (e) {
      return json({ success: false, message: 'Paystack unreachable' }, 502);
    }
    if (!vdata.status || vdata.data?.status !== 'success') {
      return json({ success: false, message: 'Paystack verification failed' });
    }
    const pay = vdata.data;
    if (Math.round(amount * 100) !== pay.amount) return json({ success: false, message: 'Amount mismatch' });
    if (pay.currency !== 'NGN') return json({ success: false, message: 'Currency mismatch' });

    // 2. Confirm the paying customer owns the target wallet
    const userRes = await firestoreFetch(env, `users/${encodeURIComponent(uid)}`, {});
    if (userRes.status !== 200) return json({ success: false, message: 'User not found' }, 404);
    const userData = await userRes.json();
    const userEmail = userData?.fields?.email?.stringValue;
    if (!userEmail || userEmail !== pay.customer?.email) {
      return json({ success: false, message: 'Email mismatch' }, 403);
    }

    // 3. Idempotency: never credit the same reference twice
    const existing = await firestoreFetch(env, `walletCredits/${encodeURIComponent(reference)}`, {});
    if (existing.status === 200) return json({ success: true, alreadyCredited: true, amount });
    if (existing.status !== 404) return json({ success: false, message: 'Ledger check failed' }, 502);

    const walletRes = await firestoreFetch(env, `wallets/${encodeURIComponent(uid)}`, {});
    const walletExists = walletRes.status === 200;
    if (walletRes.status !== 200 && walletRes.status !== 404) {
      return json({ success: false, message: 'Wallet check failed' }, 502);
    }

    // 4. Atomic commit: increment/create wallet + ledger entry + transaction record
    const amountKobo = String(pay.amount);
    const now = new Date().toISOString();
    const writes = [];
    if (walletExists) {
      writes.push({
        update: { name: docName(env, `wallets/${encodeURIComponent(uid)}`), fields: { updatedAt: { timestampValue: now } } },
        updateTransforms: [{ fieldPath: 'balance', increment: { integerValue: amountKobo } }],
      });
    } else {
      writes.push({
        update: {
          name: docName(env, `wallets/${encodeURIComponent(uid)}`),
          fields: { balance: { integerValue: amountKobo }, updatedAt: { timestampValue: now } },
        },
      });
    }
    writes.push({
      update: {
        name: docName(env, `walletCredits/${encodeURIComponent(reference)}`),
        fields: {
          reference: { stringValue: reference },
          uid: { stringValue: uid },
          amount: { integerValue: amountKobo },
          email: { stringValue: pay.customer?.email || '' },
          status: { stringValue: 'credited' },
          createdAt: { timestampValue: now },
        },
      },
    });
    writes.push({
      update: {
        name: docName(env, `transactions/${encodeURIComponent(reference)}`),
        fields: {
          id: { stringValue: reference },
          uid: { stringValue: uid },
          type: { stringValue: 'wallet_topup' },
          amount: { integerValue: amountKobo },
          description: { stringValue: `Wallet top-up (${reference})` },
          status: { stringValue: 'completed' },
          createdAt: { timestampValue: now },
        },
      },
    });

    const commit = await firestoreFetch(env, ':commit', { method: 'POST', body: JSON.stringify({ writes }) });
    if (commit.status !== 200) {
      const text = await commit.text();
      if (text.includes('ALREADY_EXISTS')) return json({ success: true, alreadyCredited: true, amount });
      return json({ success: false, message: `Credit failed: ${text.slice(0, 160)}` }, 502);
    }

    return json({ success: true, amount });
  },
};