export interface DynamicQrPayload {
  abssin: string;
  walletBalance: number;
  timestamp: number;
  nonce: string;
  sig?: string;
}

const SIGNING_SECRET = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TICKET_SIGNING_KEY) || 'abiaway-ticket-signing-key-change-me';

async function hmacSign(data: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return 'demo-sig';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`abiaway-qr:${SIGNING_SECRET}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function generateRollingTicketQr(abssin: string, currentBalance: number): Promise<string> {
  const payload: DynamicQrPayload = {
    abssin,
    walletBalance: currentBalance,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15),
  };
  const body = JSON.stringify(payload);
  payload.sig = await hmacSign(body);
  return btoa(JSON.stringify(payload));
}

async function verifySignature(payload: DynamicQrPayload): Promise<boolean> {
  if (typeof window !== 'undefined' && !window.crypto?.subtle) return true;
  const { sig, ...unsigned } = payload;
  if (!sig) return false;
  const expected = await hmacSign(JSON.stringify(unsigned));
  return sig === expected;
}

export async function verifyRollingTicketQr(
  scannedBase64: string,
  maxValiditySeconds: number = 30,
): Promise<{ isValid: boolean; payload?: DynamicQrPayload; error?: 'EXPIRED' | 'MALFORMED' | 'FORGED' }> {
  try {
    const decodedString = atob(scannedBase64);
    const payload: DynamicQrPayload = JSON.parse(decodedString);
    if (!(await verifySignature(payload))) {
      return { isValid: false, error: 'FORGED' };
    }
    const diffSeconds = (Date.now() - payload.timestamp) / 1000;
    if (diffSeconds > maxValiditySeconds || diffSeconds < -5) {
      return { isValid: false, error: 'EXPIRED' };
    }
    return { isValid: true, payload };
  } catch {
    return { isValid: false, error: 'MALFORMED' };
  }
}

export async function verifyRollingTicketQrWithSkew(
  scannedBase64: string,
  maxValiditySeconds: number = 30,
  allowedSkewWindows: number = 1,
): Promise<{ isValid: boolean; payload?: DynamicQrPayload; error?: 'EXPIRED' | 'MALFORMED' | 'FORGED' }> {
  try {
    const decodedString = atob(scannedBase64);
    const payload: DynamicQrPayload = JSON.parse(decodedString);
    if (!(await verifySignature(payload))) {
      return { isValid: false, error: 'FORGED' };
    }
    const timeDifferenceSeconds = (Date.now() - payload.timestamp) / 1000;
    const maxAllowedDrift = maxValiditySeconds * (allowedSkewWindows + 1);
    if (Math.abs(timeDifferenceSeconds) > maxAllowedDrift) {
      return { isValid: false, error: 'EXPIRED' };
    }
    return { isValid: true, payload };
  } catch {
    return { isValid: false, error: 'MALFORMED' };
  }
}