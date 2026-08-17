export const CardPaymentService = {
  async validateCard(cardDetails) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const validCards = {
      '4111111111111111': { type: 'visa', balance: 25000, holder: 'ABUOMA DAVID' },
      '5111111111111111': { type: 'mastercard', balance: 45000, holder: 'ABUOMA DAVID' },
      '5061111111111111': { type: 'verve', balance: 15000, holder: 'ABUOMA DAVID' },
    };
    const cardNum = cardDetails.number?.replace(/\s/g, '') || '';
    const card = validCards[cardNum];
    if (!card) return { success: false, message: 'Invalid card number' };
    return { success: true, data: { type: card.type, holder: card.holder, balance: card.balance, lastFour: cardNum.slice(-4) } };
  },
  async processPayment(cardDetails, amount) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const cardNum = cardDetails.number?.replace(/\s/g, '') || '';
    const validCards = { '4111111111111111': { balance: 25000 }, '5111111111111111': { balance: 45000 }, '5061111111111111': { balance: 15000 } };
    const card = validCards[cardNum];
    const totalAmount = amount + 50;
    if (!card || card.balance < totalAmount) return { success: false, message: 'Insufficient funds on card' };
    card.balance -= totalAmount;
    return { success: true, transactionId: `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, amount, fee: 50, total: totalAmount, cardType: cardNum.startsWith('4') ? 'Visa' : cardNum.startsWith('5') ? 'Mastercard' : 'Verve', lastFour: cardNum.slice(-4), balanceAfter: card.balance, authorizationCode: `AUTH-${Math.random().toString(36).substr(2, 8)}` };
  },
  async checkBalance(cardNumber) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const validCards = { '4111111111111111': { balance: 25000, type: 'visa' }, '5111111111111111': { balance: 45000, type: 'mastercard' }, '5061111111111111': { balance: 15000, type: 'verve' } };
    const cardNum = cardNumber?.replace(/\s/g, '') || '';
    const card = validCards[cardNum];
    if (!card) return { success: false, message: 'Card not found' };
    return { success: true, balance: card.balance, cardType: card.type, lastFour: cardNum.slice(-4) };
  },
};

export const USSDPaymentService = {
  banks: { 'GTB': { name: 'Guaranty Trust Bank', code: '*737#', color: 'orange' }, 'UBA': { name: 'United Bank for Africa', code: '*919#', color: 'red' }, 'FBN': { name: 'First Bank of Nigeria', code: '*894#', color: 'blue' }, 'ACCESS': { name: 'Access Bank', code: '*901#', color: 'green' }, 'ZENITH': { name: 'Zenith Bank', code: '*966#', color: 'blue' } },
  async initiatePayment(bankCode, phoneNumber, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const bank = this.banks[bankCode];
    if (!bank) return { success: false, message: 'Invalid bank selection' };
    if (!phoneNumber || phoneNumber.length !== 11) return { success: false, message: 'Invalid phone number' };
    const ussdCode = `${bank.code}${amount}#`;
    return { success: true, ussdCode, bankName: bank.name, reference: `USSD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, amount, fee: 30, total: amount + 30, instructions: `Dial ${ussdCode} from ${phoneNumber} to complete payment` };
  },
  async confirmPayment(reference) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { success: true, confirmed: true };
  },
};

export const TransferPaymentService = {
  async generateReference(amount) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const reference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    return { success: true, reference, expiresAt: new Date(Date.now() + 3600000).toISOString(), accountDetails: { bankName: 'Guaranty Trust Bank (GTBank)', accountName: 'Abia Way Transit System', accountNumber: '0123456789', sortCode: '058-123-456', amount, narration: `Wallet Funding - Reference: ${reference}` } };
  },
  async confirmTransfer(reference) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return { success: true, confirmed: true };
  },
};

export const ABSINPaymentService = {
  async validateCard(cardNumber, pin) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const validCards = { '1234567890123456': { holder: 'Abuoma David', balance: 12450, tier: 'Premium' }, '1111222233334444': { holder: 'Chidi Okonkwo', balance: 5000, tier: 'Standard' }, '5555666677778888': { holder: 'Ngozi Eze', balance: 25000, tier: 'Platinum' } };
    const card = validCards[cardNumber?.replace(/\s/g, '')];
    if (!card || pin !== '1234') return { success: false, message: 'Invalid card or PIN' };
    return { success: true, data: card };
  },
  async processPayment(cardNumber, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const validCards = { '1234567890123456': { balance: 12450 }, '1111222233334444': { balance: 5000 }, '5555666677778888': { balance: 25000 } };
    const card = validCards[cardNumber?.replace(/\s/g, '')];
    const totalAmount = amount + 50;
    if (!card || card.balance < totalAmount) return { success: false, message: 'Insufficient balance' };
    card.balance -= totalAmount;
    return { success: true, transactionId: `ABSIN-${Date.now()}`, amount, fee: 50, total: totalAmount, balanceAfter: card.balance, pointsEarned: Math.floor(amount / 10) };
  },
};

export const PaystackPaymentService = {
  getPublicKey() {
    return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) || '';
  },
  isConfigured() {
    return Boolean(this.getPublicKey());
  },
  async loadScript() {
    if (typeof window !== 'undefined' && (window as any).PaystackPop) return true;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(Boolean((window as any).PaystackPop));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  },
  async charge({ amount, email, onSuccess, onClose }: { amount: number; email?: string; onSuccess: (reference: string) => void; onClose?: () => void }) {
    if (!this.isConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const reference = `PAYSTACK-MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      onSuccess(reference);
      return { success: true, mock: true, reference };
    }
    const loaded = await this.loadScript();
    if (!loaded) return { success: false, message: 'Paystack could not be loaded. Check your connection.' };
    const reference = `PAYSTACK-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const handler = (window as any).PaystackPop.setup({
      key: this.getPublicKey(),
      email: email || 'wallet@abiaway.gov.ng',
      amount: amount * 100,
      currency: 'NGN',
      ref: reference,
      metadata: { custom_fields: [{ display_name: 'Wallet Funding', variable_name: 'purpose', value: 'AbiaWay Wallet Top-up' }] },
      callback: (response: { reference: string; status: string }) => {
        if (response.status === 'success') onSuccess(response.reference);
      },
      onClose: () => onClose?.(),
    });
    handler.openIframe();
    return { success: true, reference };
  },
};
