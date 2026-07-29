import config from '../../config';

// Payment processing service
export class ABSINPaymentProcessor {
  private apiBase: string;
  private apiKey: string;
  private transactions: Map<string, any>;

  constructor(apiBase, apiKey) {
    this.apiBase = apiBase || config.absin.apiUrl;
    this.apiKey = apiKey || config.absin.apiKey;
    this.transactions = new Map();
  }

  async validateCard(cardData) {
    const response = await fetch(`${this.apiBase}/auth/validate-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Request-ID': crypto.randomUUID()
      },
      body: JSON.stringify({
        cardId: cardData.cardId,
        userId: cardData.userId,
        timestamp: new Date().toISOString(),
        signature: cardData.signature
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Card validation failed');
    }
    
    return result.data;
  }

  async checkBalance(cardId) {
    const response = await fetch(`${this.apiBase}/wallet/balance/${cardId}`, {
      headers: {
        'X-API-Key': this.apiKey,
        'X-Request-ID': crypto.randomUUID()
      }
    });
    
    const result = await response.json();
    
    return {
      balance: result.data.balance,
      currency: result.data.currency,
      available: result.data.balance > 0
    };
  }

  async initiatePayment(cardId, amount, rideDetails) {
    const paymentData = {
      cardId,
      amount,
      currency: 'NGN',
      merchantId: 'ABIA-WAY-001',
      merchantName: 'Abia Way Transit',
      description: this.generateDescription(rideDetails),
      timestamp: new Date().toISOString(),
      metadata: {
        rideId: rideDetails.id || crypto.randomUUID(),
        route: `${rideDetails.from} → ${rideDetails.to}`,
        busId: rideDetails.busId,
        seats: rideDetails.seats,
        passengers: rideDetails.passengers,
        distance: rideDetails.distance,
        duration: rideDetails.duration
      }
    };
    
    const response = await fetch(`${this.apiBase}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Request-ID': crypto.randomUUID()
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Payment initiation failed');
    }
    
    this.transactions.set(result.data.transactionId, {
      ...paymentData,
      status: 'pending',
      initiatedAt: new Date().toISOString()
    });
    
    return result.data;
  }

  async confirmPayment(transactionId, otp = null) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    const response = await fetch(`${this.apiBase}/payment/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Request-ID': crypto.randomUUID()
      },
      body: JSON.stringify({
        transactionId,
        otp,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      transaction.status = 'completed';
      transaction.completedAt = new Date().toISOString();
      this.transactions.set(transactionId, transaction);
    }
    
    return result;
  }

  async getTransactionStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (transaction) {
      return transaction;
    }
    
    const response = await fetch(`${this.apiBase}/payment/status/${transactionId}`, {
      headers: {
        'X-API-Key': this.apiKey
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      this.transactions.set(transactionId, result.data);
      return result.data;
    }
    
    throw new Error('Transaction not found');
  }

  generateDescription(rideDetails) {
    return `Bus: ${rideDetails.busId} | ${rideDetails.from} → ${rideDetails.to} | ${rideDetails.passengers} passenger(s) | Seat(s): ${rideDetails.seats.join(', ')}`;
  }

  async processRefund(transactionId, reason) {
    const response = await fetch(`${this.apiBase}/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        transactionId,
        reason,
        timestamp: new Date().toISOString()
      })
    });
    
    return await response.json();
  }
}