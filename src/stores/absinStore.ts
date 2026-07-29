import { create } from 'zustand';
import { getABSINService } from '../services/absin';
import { CardInfo } from '../types';

interface ABSINState {
  service: any;
  isInitialized: boolean;
  activeCard: CardInfo | null;
  balance: number;
  points: number;
  initialize: () => Promise<void>;
  readCard: (method?: string) => Promise<CardInfo | null>;
  processPayment: (amount: number, rideDetails: Record<string, any>) => Promise<Record<string, any> | null>;
  clearCard: () => void;
}

const useABSINStore = create<ABSINState>((set, get) => ({
  service: null,
  isInitialized: false,
  activeCard: null,
  balance: 0,
  points: 0,

  initialize: async () => {
    try {
      const absinService = getABSINService();
      const result = await absinService.initialize();
      set({ service: absinService, isInitialized: true });
      if (!result.success) {
        console.warn('ABSIN Service initialization returned false');
      }
    } catch (error) {
      console.error('ABSIN initialization error:', error);
      const dummyService = getABSINService();
      set({ service: dummyService, isInitialized: true });
    }
  },

  readCard: async (method = 'auto') => {
    const { service } = get();
    if (!service) return null;
    try {
      const card = await service.readCard(method);
      if (card && card.success !== false) {
        set({ activeCard: card });
        if (card.balance) set({ balance: card.balance });
        return card;
      }
      return null;
    } catch (error) {
      console.error('Read card error:', error);
      return null;
    }
  },

  processPayment: async (amount, rideDetails) => {
    const { service } = get();
    if (!service) return null;
    try {
      const result = await service.processPayment(amount, rideDetails);
      if (result.success) {
        set({ balance: result.balance });
        if (result.pointsEarned) {
          const currentPoints = get().points;
          set({ points: currentPoints + result.pointsEarned });
        }
      }
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  },

  clearCard: () => {
    const { service } = get();
    set({ activeCard: null });
    if (service) {
      service.clearActiveCard();
    }
  },
}));

export default useABSINStore;
