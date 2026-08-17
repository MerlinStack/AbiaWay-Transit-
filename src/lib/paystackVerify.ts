import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

export interface VerifyResult {
  success: boolean;
  message?: string;
  alreadyCredited?: boolean;
  amount?: number;
}

const functions = getFunctions(app);

export async function verifyPaystackCredit(reference: string, amount: number, email?: string): Promise<VerifyResult> {
  try {
    const callable = httpsCallable(functions, 'verifyPaystack');
    const res = await callable({ reference, amount, email });
    const data = res.data as { success: boolean; alreadyCredited?: boolean; amount?: number };
    return {
      success: data.success !== false,
      alreadyCredited: data.alreadyCredited,
      amount: data.amount,
    };
  } catch (error: unknown) {
    const e = error as { message?: string; code?: string };
    return { success: false, message: e.message || 'Wallet verification failed' };
  }
}