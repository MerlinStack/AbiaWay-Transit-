export interface DynamicQrPayload {
  abssin: string;
  walletBalance: number;
  timestamp: number;
  nonce: string;
}

export function generateRollingTicketQr(abssin: string, currentBalance: number): string {
  const payload: DynamicQrPayload = {
    abssin,
    walletBalance: currentBalance,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15),
  };
  return btoa(JSON.stringify(payload));
}

export function verifyRollingTicketQr(
  scannedBase64: string,
  maxValiditySeconds: number = 30,
): { isValid: boolean; payload?: DynamicQrPayload; error?: 'EXPIRED' | 'MALFORMED' } {
  try {
    const decodedString = atob(scannedBase64);
    const payload: DynamicQrPayload = JSON.parse(decodedString);
    const diffSeconds = (Date.now() - payload.timestamp) / 1000;
    if (diffSeconds > maxValiditySeconds || diffSeconds < -5) {
      return { isValid: false, error: 'EXPIRED' };
    }
    return { isValid: true, payload };
  } catch {
    return { isValid: false, error: 'MALFORMED' };
  }
}

export function verifyRollingTicketQrWithSkew(
  scannedBase64: string,
  maxValiditySeconds: number = 30,
  allowedSkewWindows: number = 1,
): { isValid: boolean; payload?: DynamicQrPayload; error?: 'EXPIRED' | 'MALFORMED' } {
  try {
    const decodedString = atob(scannedBase64);
    const payload: DynamicQrPayload = JSON.parse(decodedString);
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
