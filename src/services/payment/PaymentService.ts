// src/services/payment/PaymentService.js

// Mock Bank Database — demo/test data only
const defaultCards = {
  '4111111111111111': { type: 'visa', cardholder: 'Abuoma David', balance: 25000, expiry: '12/28', cvv: '123', status: 'active' },
  '5111111111111111': { type: 'mastercard', cardholder: 'Abuoma David', balance: 45000, expiry: '10/27', cvv: '456', status: 'active' },
  '5061111111111111': { type: 'verve', cardholder: 'Abuoma David', balance: 15000, expiry: '08/29', cvv: '789', status: 'active' },
};

const rawCards = import.meta.env.VITE_DEMO_BANK_CARDS;
const cards = rawCards ? JSON.parse(rawCards) : defaultCards;

const bankDatabase = {
  cards,
  
  ussd: {
    'GTB': { code: '*737*', name: 'Guaranty Trust Bank' },
    'UBA': { code: '*919*', name: 'United Bank for Africa' },
    'FBN': { code: '*894*', name: 'First Bank of Nigeria' },
    'ACCESS': { code: '*901*', name: 'Access Bank' },
    'ZENITH': { code: '*966*', name: 'Zenith Bank' }
  },
  
  accounts: {
    '0123456789': { bank: 'GTBank', accountName: 'Abuoma David', balance: 50000, accountNumber: '0123456789' }
  }
};

class PaymentService {
  private processingFees: Record<string, number>;
  private minAmounts: Record<string, number>;
  private maxAmounts: Record<string, number>;

  constructor() {
    this.processingFees = {
      card: 50,
      ussd: 30,
      transfer: 0,
      absin: 50
    };
    
    this.minAmounts = {
      card: 100,
      ussd: 100,
      transfer: 500,
      absin: 50
    };
    
    this.maxAmounts = {
      card: 500000,
      ussd: 200000,
      transfer: 1000000,
      absin: 1000000
    };
  }

  // ==================== CARD PAYMENT METHODS ====================
  
  async validateCard(cardDetails) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { cardNumber, expiry, cvv, cardholder } = cardDetails;
    const card = bankDatabase.cards[cardNumber];
    
    if (!card) {
      return { success: false, message: 'Invalid card number' };
    }
    
    if (card.expiry !== expiry) {
      return { success: false, message: 'Invalid expiry date' };
    }
    
    if (card.cvv !== cvv) {
      return { success: false, message: 'Invalid CVV' };
    }
    
    return {
      success: true,
      data: {
        type: card.type,
        cardholder: card.cardholder,
        lastFour: cardNumber.slice(-4),
        balance: card.balance
      }
    };
  }
  
  async processCardPayment(cardDetails, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { cardNumber } = cardDetails;
    const card = bankDatabase.cards[cardNumber];
    
    if (!card) {
      return { success: false, message: 'Card not found' };
    }
    
    const totalAmount = amount + this.processingFees.card;
    
    if (card.balance < totalAmount) {
      return {
        success: false,
        message: 'Insufficient balance on card',
        balance: card.balance,
        required: totalAmount
      };
    }
    
    // Deduct from card
    card.balance -= totalAmount;
    
    return {
      success: true,
      transactionId: `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount,
      fee: this.processingFees.card,
      total: totalAmount,
      balanceAfter: card.balance,
      cardType: card.type,
      lastFour: cardNumber.slice(-4),
      authorizationCode: `AUTH-${Math.random().toString(36).substr(2, 8)}`
    };
  }
  
  async checkCardBalance(cardNumber) {
    const card = bankDatabase.cards[cardNumber];
    if (!card) {
      return { success: false, message: 'Card not found' };
    }
    
    return {
      success: true,
      balance: card.balance,
      cardType: card.type,
      lastFour: cardNumber.slice(-4),
      available: card.balance
    };
  }
  
  // ==================== USSD PAYMENT METHODS ====================
  
  async processUSSD(bankCode, phoneNumber, amount) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bank = bankDatabase.ussd[bankCode];
    if (!bank) {
      return { success: false, message: 'Invalid bank code' };
    }
    
    if (!phoneNumber || phoneNumber.length !== 11) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    const totalAmount = amount + this.processingFees.ussd;
    
    // Simulate USSD processing
    const ussdCode = `${bank.code}${amount}*${phoneNumber}#`;
    
    return {
      success: true,
      transactionId: `USSD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount,
      fee: this.processingFees.ussd,
      total: totalAmount,
      bank: bank.name,
      ussdCode,
      reference: `REF-${Date.now()}`,
      instructions: `Dial ${ussdCode} on your registered mobile number to complete payment`
    };
  }
  
  // ==================== BANK TRANSFER METHODS ====================
  
  async generateTransferReference(accountNumber, amount) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const account = bankDatabase.accounts[accountNumber];
    if (!account) {
      return { success: false, message: 'Invalid account number' };
    }
    
    const reference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    
    return {
      success: true,
      reference,
      accountDetails: {
        bankName: account.bank,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        amount,
        narration: `Abia Way Wallet Funding`
      },
      validity: 3600, // 1 hour
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }
  
  async confirmTransfer(reference) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate transfer confirmation
    return {
      success: true,
      confirmed: true,
      reference,
      amount: 5000,
      confirmedAt: new Date().toISOString()
    };
  }
  
  // ==================== BALANCE CHECKING ====================
  
  async getBalance(method, identifier) {
    switch(method) {
      case 'card':
        return this.checkCardBalance(identifier);
      case 'account':
        const account = bankDatabase.accounts[identifier];
        if (account) {
          return {
            success: true,
            balance: account.balance,
            accountName: account.accountName,
            bank: account.bank
          };
        }
        return { success: false, message: 'Account not found' };
      default:
        return { success: false, message: 'Method not supported' };
    }
  }
  
  // ==================== UTILITY METHODS ====================
  
  getProcessingFee(method) {
    return this.processingFees[method] || 0;
  }
  
  getMinAmount(method) {
    return this.minAmounts[method] || 50;
  }
  
  getMaxAmount(method) {
    return this.maxAmounts[method] || 1000000;
  }
  
  validateAmount(amount, method) {
    const min = this.getMinAmount(method);
    const max = this.getMaxAmount(method);
    
    if (amount < min) {
      return { valid: false, message: `Minimum amount is ₦${min}` };
    }
    if (amount > max) {
      return { valid: false, message: `Maximum amount is ₦${max}` };
    }
    return { valid: true };
  }
}

export default new PaymentService();