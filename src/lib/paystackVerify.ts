export interface VerifyResult {
  success: boolean;
  message?: string;
  alreadyCredited?: boolean;
  amount?: number;
}

const VERIFY_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_VERIFY_URL) || '';

export async function verifyPaystackCredit(
  reference: string,
  amount: number,
  email?: string,
  uid?: string,
): Promise<VerifyResult> {
  if (!VERIFY_URL) {
    return { success: false, message: 'VITE_PAYSTACK_VERIFY_URL not configured' };
  }
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amount, email, uid }),
    });
    const data = (await res.json()) as VerifyResult;
    return {
      success: data.success !== false,
      alreadyCredited: data.alreadyCredited,
      amount: data.amount,
      message: data.message,
    };
  } catch (error: unknown) {
    const e = error as { message?: string };
    return { success: false, message: e.message || 'Wallet verification failed' };
  }
}