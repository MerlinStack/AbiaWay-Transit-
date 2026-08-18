import { ABSINEncryption } from './ABSINEncryption';
import config from '../../config';

export class ABSINService {
  private config: any;
  private encryption: ABSINEncryption;
  private initialized: boolean;
  private activeCard: any;

  constructor(opts = {}) {
    this.config = {
      apiBase: config.absin.apiUrl,
      apiKey: config.absin.apiKey,
      merchantId: config.absin.merchantId,
      enableMock: config.absin.mockMode,
      ...opts
    };
    
    this.encryption = new ABSINEncryption();
    this.initialized = false;
    this.activeCard = null;
  }

  async initialize() {
    try {
      await this.encryption.initialize(this.config.apiKey);
      this.initialized = true;
      console.log('ABSIN Service initialized (demo mode)');
      return { success: true };
    } catch (error) {
      console.error('ABSIN initialization error:', error);
      this.initialized = true; // Still mark as initialized
      return { success: true };
    }
  }

  async manualCardEntry(cardNumber, pin) {
    const demoPin = import.meta.env.VITE_DEMO_ABSIN_PIN || '1234';
    const validCards = JSON.parse(import.meta.env.VITE_DEMO_ABSIN_CARDS || '{}');
    const defaultCards = {
      '1234567890123456': { cardholder: 'Abuoma David', balance: 12450, tier: 'Premium' },
      '1111222233334444': { cardholder: 'Chidi Okonkwo', balance: 5000, tier: 'Standard' },
      '5555666677778888': { cardholder: 'Ngozi Eze', balance: 25000, tier: 'Platinum' }
    };
    const cards = Object.keys(validCards).length > 0 ? validCards : defaultCards;
    
    const card = cards[cardNumber.replace(/\s/g, '')];
    if (!card || pin !== demoPin) {
      return { success: false, error: 'Invalid card or PIN' };
    }
    
    this.activeCard = {
      cardId: cardNumber,
      cardholder: card.cardholder,
      balance: card.balance,
      tier: card.tier
    };
    
    return this.activeCard;
  }

  async processPayment(amount, rideDetails) {
    if (!this.activeCard) {
      return { success: false, error: 'No active card' };
    }
    
    const totalAmount = amount + 50;
    
    if (this.activeCard.balance < totalAmount) {
      return {
        success: false,
        error: 'Insufficient balance',
        balance: this.activeCard.balance,
        required: totalAmount
      };
    }
    
    this.activeCard.balance -= totalAmount;
    
    const receipt = {
      receiptId: `RCP-${Date.now()}`,
      date: new Date().toISOString(),
      merchant: 'Abia Way Transit System',
      merchantId: this.config.merchantId,
      cardNumber: `****${this.activeCard.cardId.slice(-4)}`,
      cardholder: this.activeCard.cardholder,
      amount: amount,
      fee: 50,
      total: totalAmount,
      currency: 'NGN',
      route: `${rideDetails.from} → ${rideDetails.to}`,
      busId: rideDetails.busId,
      seats: rideDetails.seats || [],
      passengers: rideDetails.passengers,
      balanceAfter: this.activeCard.balance,
      pointsEarned: Math.floor(amount / 10),
      transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      transactionId: receipt.transactionId,
      receipt,
      balance: this.activeCard.balance,
      pointsEarned: receipt.pointsEarned
    };
  }

  async getCardPoints(cardId) {
    return {
      total: 450,
      nextTier: 600,
      tier: 'Premium'
    };
  }

  clearActiveCard() {
    this.activeCard = null;
    return true;
  }
}

let absinInstance = null;

export const getABSINService = () => {
  if (!absinInstance) {
    absinInstance = new ABSINService();
  }
  return absinInstance;
};