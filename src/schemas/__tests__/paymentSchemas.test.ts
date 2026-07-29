import { describe, it, expect } from 'vitest';
import {
  cardPaymentSchema,
  ussdPaymentSchema,
  transferPaymentSchema,
  absinPaymentSchema,
  linkCardSchema,
  topupSchema,
  validateWithSchema,
} from '../paymentSchemas';

describe('cardPaymentSchema', () => {
  it('accepts valid card payment data', () => {
    const result = cardPaymentSchema.safeParse({
      amount: 5000,
      cardNumber: '1234567890123456',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(true);
  });

  it('rejects amount below 100', () => {
    const result = cardPaymentSchema.safeParse({
      amount: 50,
      cardNumber: '1234567890123456',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(false);
  });

  it('rejects amount above 500000', () => {
    const result = cardPaymentSchema.safeParse({
      amount: 600000,
      cardNumber: '1234567890123456',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid card number length', () => {
    const result = cardPaymentSchema.safeParse({
      amount: 5000,
      cardNumber: '1234',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(false);
  });
});

describe('ussdPaymentSchema', () => {
  it('accepts valid USSD data', () => {
    const result = ussdPaymentSchema.safeParse({
      amount: 5000,
      bank: 'GTB',
      phone: '08012345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty bank', () => {
    const result = ussdPaymentSchema.safeParse({
      amount: 5000,
      bank: '',
      phone: '08012345678',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone length', () => {
    const result = ussdPaymentSchema.safeParse({
      amount: 5000,
      bank: 'GTB',
      phone: '123',
    });
    expect(result.success).toBe(false);
  });
});

describe('transferPaymentSchema', () => {
  it('accepts valid transfer amount', () => {
    const result = transferPaymentSchema.safeParse({ amount: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects amount below 500', () => {
    const result = transferPaymentSchema.safeParse({ amount: 100 });
    expect(result.success).toBe(false);
  });
});

describe('absinPaymentSchema', () => {
  it('accepts valid ABSIN data', () => {
    const result = absinPaymentSchema.safeParse({
      amount: 5000,
      cardNumber: '1234567890123456',
      pin: '1234',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid pin length', () => {
    const result = absinPaymentSchema.safeParse({
      amount: 5000,
      cardNumber: '1234567890123456',
      pin: '12',
    });
    expect(result.success).toBe(false);
  });
});

describe('linkCardSchema', () => {
  it('accepts valid card linking data', () => {
    const result = linkCardSchema.safeParse({
      cardNumber: '1234567890123456',
      pin: '1234',
    });
    expect(result.success).toBe(true);
  });
});

describe('topupSchema', () => {
  it('accepts valid topup amount', () => {
    const result = topupSchema.safeParse({ amount: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = topupSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });
});

describe('validateWithSchema', () => {
  it('returns success on valid data', () => {
    const result = validateWithSchema(cardPaymentSchema, {
      amount: 5000,
      cardNumber: '1234567890123456',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(true);
  });

  it('returns error on invalid data', () => {
    const result = validateWithSchema(cardPaymentSchema, {
      amount: 5000,
      cardNumber: 'abc',
      expiry: '12/28',
      cvv: '123',
      holder: 'ABUOMA DAVID',
    });
    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty('message');
    expect(typeof result.error.message).toBe('string');
  });
});
