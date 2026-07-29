import { create } from 'zustand';
import { Booking } from '../types';

interface SavedRoute {
  id: string | number;
  from: string;
  to: string;
  frequency?: string;
  lastUsed?: string;
}

interface BookingState {
  currentBooking: Record<string, any> | null;
  bookingHistory: Record<string, any>[];
  savedRoutes: SavedRoute[];
  recentSearches: Array<{ from: string; to: string }>;
  createBooking: (bookingDetails: Record<string, any>) => Record<string, any>;
  cancelBooking: (bookingId: string) => void;
  saveRoute: (route: SavedRoute) => void;
  addRecentSearch: (search: { from: string; to: string }) => void;
}

const useBookingStore = create<BookingState>((set) => ({
  currentBooking: null,
  bookingHistory: [
    { id: 'BK-001', route: 'Umuahia → Aba', date: '2024-03-14', time: '08:30', seats: ['A12'], fare: 350, status: 'completed', bus: 'AB-101' },
    { id: 'BK-002', route: 'Aba → Umuahia', date: '2024-03-13', time: '17:45', seats: ['B04', 'B05'], fare: 700, status: 'completed', bus: 'AB-102' }
  ],
  savedRoutes: [],
  recentSearches: [],

  createBooking: (bookingDetails) => {
    const newBooking = {
      id: `BK-${Date.now()}`,
      ...bookingDetails,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      currentBooking: newBooking,
      bookingHistory: [newBooking, ...state.bookingHistory]
    }));
    return newBooking;
  },

  cancelBooking: (bookingId) => {
    set((state) => ({
      bookingHistory: state.bookingHistory.map((booking) =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )
    }));
  },

  saveRoute: (route) => {
    set((state) => {
      if (state.savedRoutes.some((r) => r.id === route.id)) return state;
      return { savedRoutes: [route, ...state.savedRoutes].slice(0, 10) };
    });
  },

  addRecentSearch: (search) => {
    set((state) => {
      const filtered = state.recentSearches.filter((s) => s.from !== search.from || s.to !== search.to);
      return { recentSearches: [search, ...filtered].slice(0, 5) };
    });
  },
}));

export default useBookingStore;
