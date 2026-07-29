import { create } from 'zustand';
import API from '../utils/api';
import config from '../config';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setLoading: (loading: boolean) => void;
  verifyToken: () => Promise<void>;
  determineUserRole: (email: string) => string;
  login: (email: string, password: string, userData?: User | null) => Promise<{success: boolean; user?: User; error?: string}>;
  demoLogin: (role?: string) => Promise<{success: boolean; user?: User}>;
  logout: () => Promise<{success: boolean}>;
  updateUser: (data: Partial<User>) => User;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isDriver: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,

  setLoading: (loading) => set({ loading }),

  verifyToken: async () => {
    const token = get().token;
    if (token) {
      try {
        const response = await API.auth.verifyToken();
        if (response.valid) {
          set({ user: response.user as User, isAuthenticated: true, loading: false });
        } else {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
      } catch {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  determineUserRole: (email) => {
    const adminEmails = [
      'admin@abiaway.gov.ng',
      'admin@abiaone.gov.ng',
      'director@abiaway.gov.ng'
    ];
    const driverEmails = [
      'driver@abiaway.gov.ng',
      'chidi.okonkwo@abiaway.gov.ng',
      'emeka.okafor@abiaway.gov.ng',
      'ngozi.eze@abiaway.gov.ng'
    ];
    if (adminEmails.includes(email.toLowerCase())) return 'admin';
    if (driverEmails.includes(email.toLowerCase())) return 'driver';
    return 'passenger';
  },

  login: async (email, password, userData = null) => {
    try {
      let response;
      if (userData) {
        response = { user: userData };
      } else {
        response = await API.auth.login(email, password);
      }

      const userWithRole = {
        ...(response.user || userData),
        email: email || response.user?.email,
        role: get().determineUserRole(email || response.user?.email),
        loginTime: new Date().toISOString()
      };

      const token = response.token || config.demo.authToken;
      set({ user: userWithRole, token, isAuthenticated: true });
      localStorage.setItem('token', token);
      sessionStorage.setItem('currentUser', JSON.stringify(userWithRole));

      return { success: true, user: userWithRole };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  demoLogin: async (role = 'passenger') => {
    const demoUsers = {
      admin: { id: 'ADM-001', email: 'admin@abiaway.gov.ng', name: 'Admin User', role: 'admin', tier: 'Administrator', avatar: 'AU', phone: '+234-803-456-7890', joinDate: '2024-01-01' },
      driver: { id: 'DRV-001', email: 'chidi.okonkwo@abiaway.gov.ng', name: 'Chidi Okonkwo', role: 'driver', tier: 'Professional', avatar: 'CO', phone: '+234-802-345-6789', joinDate: '2024-02-20' },
      passenger: { id: 'USR-001', email: 'abuoma@abiaway.gov.ng', name: 'Abuoma David', role: 'passenger', tier: 'Premium', avatar: 'AD', phone: '+234-801-234-5678', joinDate: '2024-01-15' }
    };

    const demoUser = demoUsers[role];
    const userWithDetails = { ...demoUser, loginTime: new Date().toISOString() };

    set({ user: userWithDetails, token: config.demo.authToken, isAuthenticated: true });
    localStorage.setItem('token', config.demo.authToken);
    sessionStorage.setItem('currentUser', JSON.stringify(userWithDetails));

    return { success: true, user: demoUser };
  },

  logout: async () => {
    try {
      await API.auth.logout();
    } catch {
      // Force clear even if API fails
    }
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedEmail');
    sessionStorage.removeItem('currentUser');
    return { success: true };
  },

  updateUser: (updatedData) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updatedData };
    set({ user: updatedUser });
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  },

  hasRole: (role) => get().user?.role === role,
  isAdmin: () => get().user?.role === 'admin',
  isDriver: () => get().user?.role === 'driver',
}));

export default useAuthStore;
