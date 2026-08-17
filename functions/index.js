const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const WALLET_CREDIT_PURPOSE = 'AbiaWay Wallet Top-up';

/**
 * Verifies a Paystack transaction server-side before crediting the wallet.
 * Callable from the client after a successful Paystack popup callback.
 * Idempotent: a reference can only ever be credited once.
 */
exports.verifyPaystack = onCall(async (request) => {
  const { reference, amount } = request.data || {};
  if (!reference || typeof reference !== 'string') {
    throw new HttpsError('invalid-argument', 'reference is required');
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new HttpsError('invalid-argument', 'amount must be a positive integer');
  }
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in is required to fund your wallet');
  }
  const uid = request.auth.uid;
  const email = request.auth.token.email || '';

  if (!PAYSTACK_SECRET_KEY) {
    throw new HttpsError('failed-precondition', 'Paystack is not configured on the server');
  }

  const db = admin.firestore();

  // Idempotency — the same reference can never be credited twice.
  const creditRef = db.collection('walletCredits').doc(reference);
  const existing = await creditRef.get();
  if (existing.exists) {
    const data = existing.data();
    if (data.uid !== uid) {
      throw new HttpsError('permission-denied', 'This reference belongs to another account');
    }
    return { success: true, alreadyCredited: true, amount: data.amount };
  }

  // Verify the transaction with Paystack using the secret key.
  let response;
  try {
    response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
  } catch {
    throw new HttpsError('unavailable', 'Could not reach Paystack. Try again shortly.');
  }
  const body = await response.json();

  if (!body.status || body.data?.status !== 'success') {
    throw new HttpsError('failed-precondition', 'Paystack reports this transaction as not successful');
  }
  const txn = body.data;

  // Server-side integrity checks — never trust the client amount.
  if (txn.amount !== amount * 100) {
    throw new HttpsError('failed-precondition', 'Transaction amount does not match request');
  }
  if (txn.currency !== 'NGN') {
    throw new HttpsError('failed-precondition', 'Unexpected currency');
  }
  if (txn.metadata?.purpose !== WALLET_CREDIT_PURPOSE) {
    throw new HttpsError('failed-precondition', 'Unexpected transaction purpose');
  }
  if (email && txn.customer?.email && txn.customer.email.toLowerCase() !== email.toLowerCase()) {
    throw new HttpsError('failed-precondition', 'Transaction email does not match account');
  }

  // Credit the wallet (server-side, bypasses client rules) and record the transaction.
  const batch = db.batch();
  batch.set(creditRef, {
    uid,
    amount,
    reference,
    email,
    status: 'credited',
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.set(
    db.collection('wallets').doc(uid),
    { balance: admin.firestore.FieldValue.increment(amount) },
    { merge: true }
  );
  batch.set(db.collection('transactions').doc(reference), {
    uid,
    type: 'credit',
    method: 'paystack',
    amount,
    description: 'Wallet top-up (Paystack)',
    reference,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return { success: true, alreadyCredited: false, amount };
});
