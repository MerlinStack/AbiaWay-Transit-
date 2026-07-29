import { z } from 'zod';

export const cardPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .min(100, 'Minimum amount is ₦100')
    .max(500000, 'Maximum amount is ₦500,000'),
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
  expiry: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter expiry date (MM/YY)'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'Please enter a valid CVV'),
  holder: z
    .string()
    .min(1, 'Cardholder name is required'),
});

export const ussdPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .min(100, 'Minimum amount is ₦100')
    .max(200000, 'Maximum amount is ₦200,000'),
  bank: z.string().min(1, 'Please select your bank'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{11}$/, 'Please enter a valid 11-digit phone number'),
});

export const transferPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .min(500, 'Minimum amount is ₦500')
    .max(1000000, 'Maximum amount is ₦1,000,000'),
});

export const absinPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .min(50, 'Minimum amount is ₦50')
    .max(1000000, 'Maximum amount is ₦1,000,000'),
  cardNumber: z
    .string()
    .min(1, 'ABSIN card number is required')
    .regex(/^\d{16}$/, 'Please enter a valid 16-digit ABSIN card number'),
  pin: z
    .string()
    .min(1, 'PIN is required')
    .regex(/^\d{4}$/, 'Please enter your 4-digit PIN'),
});

export const linkCardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
  pin: z
    .string()
    .min(1, 'PIN is required')
    .regex(/^\d{4}$/, 'Please enter your 4-digit PIN'),
});

export const topupSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .min(50, 'Minimum top-up amount is ₦50'),
});

export const nfcPaymentSchema = z.object({
  routeSelected: z.boolean().refine((val) => val === true, 'Please select a route first'),
  sufficientBalance: z.boolean().refine((val) => val === true, 'Insufficient balance'),
});

type ValidationResult = { success: true } | { success: false; error: { message: string } };

export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: { message: firstError?.message || 'Validation failed' } };
  }
  return { success: true };
}
