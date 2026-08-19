import config from '../config';

// Mock API service for production-like behavior with roles
const API = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Determine role based on email
      let role = 'passenger';
      let name = email.split('@')[0];
      
      // Admin detection
      const adminEmails = [
        'admin@abiaway.gov.ng',
        'admin@abiaone.gov.ng',
        'director@abiaway.gov.ng'
      ];
      
      // Driver detection
      const driverEmails = [
        'chidi.okonkwo@abiaway.gov.ng',
        'emeka.okafor@abiaway.gov.ng',
        'ngozi.eze@abiaway.gov.ng',
        'adaobi.nwosu@abiaway.gov.ng',
        'driver@abiaway.gov.ng'
      ];

      if (adminEmails.includes(email.toLowerCase())) {
        role = 'admin';
        name = 'Admin User';
      } else if (driverEmails.includes(email.toLowerCase())) {
        role = 'driver';
        // Use proper names for known drivers
        if (email.toLowerCase() === 'chidi.okonkwo@abiaway.gov.ng') name = 'Chidi Okonkwo';
        if (email.toLowerCase() === 'emeka.okafor@abiaway.gov.ng') name = 'Emeka Okafor';
        if (email.toLowerCase() === 'ngozi.eze@abiaway.gov.ng') name = 'Ngozi Eze';
        if (email.toLowerCase() === 'adaobi.nwosu@abiaway.gov.ng') name = 'Adaobi Nwosu';
      } else {
        // Regular passenger
        name = email === 'passenger@example.com' ? 'Abuoma David' : name;
      }
      
      return { 
        user: { 
          id: 1, 
          name: name,
          email, 
          role,
          tier: role === 'admin' ? 'admin' : role === 'driver' ? 'driver' : 'premium'
        },
        token: config.demo.mockJwtToken
      };
    },
    
    logout: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    },
    
    verifyToken: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo, return a default passenger
      return { 
        valid: true, 
        user: { 
          name: 'Abuoma David', 
          email: 'passenger@example.com',
          role: 'passenger',
          tier: 'premium' 
        }
      };
    }
  },

  // Bus data endpoints
  buses: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return [
        { id: 'AB-101', route: 'Umuahia-Aba', capacity: 65, eta: 2, platform: 3, driver: 'Chidi Okonkwo' },
        { id: 'AB-102', route: 'Aba-Umuahia', capacity: 90, eta: 8, platform: 1, driver: 'Emeka Okafor' },
        { id: 'AB-103', route: 'Umuahia-Ohafia', capacity: 30, eta: 15, platform: 4, driver: 'Ngozi Eze' },
        { id: 'AB-104', route: 'Aba-PH', capacity: 45, eta: 25, platform: 2, driver: 'Adaobi Nwosu' },
      ];
    },
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, route: 'Umuahia-Aba', capacity: 65, eta: 2 };
    },
    updateLocation: async (id, lat, lng) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    }
  },

  // Routes endpoints
  routes: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 1, name: 'Umuahia-Aba Express', duration: 25, fare: 800, stops: 8, popularity: 95 },
        { id: 2, name: 'Aba-Umuahia Local', duration: 35, fare: 900, stops: 12, popularity: 82 },
        { id: 3, name: 'Umuahia-Ohafia', duration: 45, fare: 1000, stops: 10, popularity: 78 },
        { id: 4, name: 'Aba-PH Express', duration: 60, fare: 800, stops: 5, popularity: 88 },
      ];
    },
    getStops: async (routeId) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [
        { name: 'Umuahia Park', time: '0 min' },
        { name: 'Ubakala', time: '10 min' },
        { name: 'Osisioma', time: '18 min' },
        { name: 'Aba Terminal', time: '25 min' },
      ];
    }
  },

  // Wallet endpoints
  wallet: {
    getBalance: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { balance: 12450, currency: 'NGN' };
    },
    topup: async (amount, method) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        success: true, 
        newBalance: 12450 + amount,
        transactionId: `TXN-${Date.now()}`
      };
    },
    getTransactions: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return [
        { id: 1, type: 'debit', description: 'Bus Fare - AB-101', amount: 800, date: '2024-03-14T08:45:00' },
        { id: 2, type: 'credit', description: 'Wallet Top-up', amount: 5000, date: '2024-03-13T18:30:00' },
        { id: 3, type: 'debit', description: 'Bus Fare - AB-102', amount: 800, date: '2024-03-13T09:15:00' },
        { id: 4, type: 'credit', description: 'Bonus Credit', amount: 200, date: '2024-03-12T09:00:00' },
      ];
    }
  },

  // Driver endpoints
  driver: {
    getCurrentTrip: async (driverId) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        id: 'TRIP-123',
        route: 'Umuahia-Aba',
        startTime: '08:30',
        passengers: 24,
        capacity: 40,
        nextStop: 'Osisioma',
        eta: '12 min'
      };
    },
    startTrip: async (busId) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return { success: true, tripId: `TRIP-${Date.now()}` };
    },
    endTrip: async (tripId) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return { success: true, earnings: 12500 };
    }
  },

  // Notifications
  notifications: {
    getUnread: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 1, type: 'alert', title: 'Route Delay', message: 'Osisioma to Park +10min', time: '5 min ago' },
        { id: 2, type: 'weather', title: 'Weather Alert', message: 'Heavy rain expected at 6 PM', time: '1 hour ago' },
        { id: 3, type: 'info', title: 'Maintenance', message: 'Bus AB-105 in maintenance', time: '3 hours ago' },
      ];
    },
    markAsRead: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    },
    markAllRead: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true };
    }
  },

  // AI Assistant
  ai: {
    ask: async (query) => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const responses = {
        traffic: 'Traffic is moderate on Umuahia-Aba. Expect 5-10 min delays near Osisioma.',
        fare: 'Fares: Standard ₦800, Premium ₦900, Express ₦1000',
        peak: 'Peak hours: 7-9 AM and 4-7 PM weekdays',
        route: 'Fastest route: Umuahia-Aba Expressway (25 mins)',
        default: 'I can help with routes, fares, delays, and schedules.'
      };
      
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('traffic')) return { answer: responses.traffic };
      if (lowerQuery.includes('fare') || lowerQuery.includes('cost')) return { answer: responses.fare };
      if (lowerQuery.includes('peak') || lowerQuery.includes('busy')) return { answer: responses.peak };
      if (lowerQuery.includes('route')) return { answer: responses.route };
      return { answer: responses.default };
    }
  }
};

export default API;