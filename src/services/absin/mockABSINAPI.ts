// Mock ABSIN API for testing
export const mockABSINAPI = {
  async validateCard(cardData) {
    console.log('🔵 Mock ABSIN: Validating card', cardData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Test card numbers
    const validCards = {
      '1234567890123456': {
        cardId: '1234567890123456',
        userId: 'ABIA-RES-0012345',
        cardholder: {
          name: 'Abuoma David',
          phone: '+234-801-234-5678',
          email: 'abuoma@example.com'
        },
        balance: 12450,
        status: 'active',
        tier: 'premium',
        points: 450
      },
      '1111222233334444': {
        cardId: '1111222233334444',
        userId: 'ABIA-RES-0067890',
        cardholder: {
          name: 'Chidi Okonkwo',
          phone: '+234-802-345-6789',
          email: 'chidi@example.com'
        },
        balance: 5000,
        status: 'active',
        tier: 'standard',
        points: 120
      },
      '5555666677778888': {
        cardId: '5555666677778888',
        userId: 'ABIA-RES-0098765',
        cardholder: {
          name: 'Ngozi Eze',
          phone: '+234-803-456-7890',
          email: 'ngozi@example.com'
        },
        balance: 25000,
        status: 'active',
        tier: 'platinum',
        points: 1200
      }
    };
    
    const cardNumber = cardData.cardId || cardData.cardNumber?.replace(/\s/g, '');
    const card = validCards[cardNumber] || validCards['1234567890123456'];
    
    if (card) {
      return {
        success: true,
        data: {
          ...card,
          verified: true,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid card number'
    };
  },
  
  async checkBalance(cardId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const balances = {
      '1234567890123456': 12450,
      '1111222233334444': 5000,
      '5555666677778888': 25000
    };
    
    return {
      success: true,
      data: {
        balance: balances[cardId] || 12450,
        currency: 'NGN',
        available: true
      }
    };
  },
  
  async initiatePayment(cardId, amount, rideDetails) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    return {
      success: true,
      data: {
        transactionId,
        authorizationCode: `AUTH-${Math.random().toString(36).substr(2, 8)}`,
        status: 'pending',
        amount,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  async confirmPayment(transactionId, otp = null) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        transactionId,
        status: 'completed',
        confirmedAt: new Date().toISOString(),
        receiptNumber: `RCP-${Date.now()}`
      }
    };
  }
};