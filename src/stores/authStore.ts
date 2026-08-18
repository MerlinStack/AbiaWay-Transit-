import { create } from 'zustand';
import { User } from '../types';
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  firebaseResetPassword,
  onFirebaseAuthChanged,
  getUserProfile,
} from '../lib/firebaseAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sha256Hex } from '../utils/crypto';
import { ADMIN_BOOTSTRAP_KEY } from '../config/accessControl';
import type { User as FirebaseUser } from 'firebase/auth';

type UserRole = User['role'];

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
  verifyToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<{success: boolean; user?: User; error?: string}>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{success: boolean; user?: User; error?: string}>;
  resetPassword: (email: string) => Promise<{success: boolean; error?: string}>;
  staffLogin: (badgeId: string, role: 'driver' | 'conductor') => Promise<{success: boolean; user?: User; error?: string}>;
  adminLogin: (email: string, password: string, adminKey: string) => Promise<{success: boolean; user?: User; error?: string}>;
  logout: () => Promise<{success: boolean}>;
  updateUser: (data: Partial<User>) => User;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isDriver: () => boolean;
  isConductor: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  initialized: false,

  setLoading: (loading) => set({ loading }),

  initialize: () => {
    const unsubscribe = onFirebaseAuthChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const userProfile = await getUserProfile(firebaseUser.uid);

        if (userProfile) {
          set({
            user: userProfile,
            token: tokenResult.token,
            isAuthenticated: true,
            loading: false,
            initialized: true,
          });
        } else {
          set({ user: null, token: null, isAuthenticated: false, loading: false, initialized: true });
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, loading: false, initialized: true });
      }
    });
    return unsubscribe;
  },

  verifyToken: async () => {
    const existingToken = get().token;
    if (!existingToken) {
      set({ loading: false });
      return;
    }
    try {
      const currentUser = get().user;
      if (currentUser) {
        set({ isAuthenticated: true, loading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const firebaseUser = await firebaseSignIn(email, password);
      const tokenResult = await firebaseUser.getIdTokenResult();
      let userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        userProfile = {
          id: firebaseUser.uid,
          email: email,
          name: firebaseUser.displayName || email.split('@')[0],
          role: 'passenger',
          tier: 'Premium',
          avatar: (firebaseUser.displayName || email.split('@')[0]).charAt(0).toUpperCase(),
          phone: firebaseUser.phoneNumber || '',
          joinDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
          loginTime: new Date().toISOString(),
          identifier: firebaseUser.uid,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      set({ user: userProfile, token: tokenResult.token, isAuthenticated: true });
      sessionStorage.setItem('currentUser', JSON.stringify(userProfile));
      return { success: true, user: userProfile };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    try {
      const firebaseUser = await firebaseSignUp(data.email.trim().toLowerCase(), data.password);
      const user: User = {
        id: firebaseUser.uid,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        role: 'passenger',
        tier: 'Premium',
        avatar: data.name.trim().charAt(0).toUpperCase(),
        phone: data.phone.trim(),
        joinDate: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        identifier: firebaseUser.uid,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const tokenResult = await firebaseUser.getIdTokenResult();
      set({ user, token: tokenResult.token, isAuthenticated: true });
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: message };
    }
  },

  resetPassword: async (email) => {
    try {
      await firebaseResetPassword(email);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      return { success: false, error: message };
    }
  },

  staffLogin: async (badgeId, role) => {
    try {
      const badgeDoc = await getDoc(doc(db, 'staffBadges', badgeId));
      if (!badgeDoc.exists()) {
        return { success: false, error: 'Invalid badge number.' };
      }

      const badgeData = badgeDoc.data();
      if (badgeData.role !== role) {
        return { success: false, error: 'Role mismatch for this badge.' };
      }

      if (badgeData.status === 'deactivated') {
        return { success: false, error: 'This badge has been deactivated. Contact your administrator.' };
      }

      const user: User = {
        id: badgeId,
        email: `${badgeId.toLowerCase()}@abiaway.gov.ng`,
        name: badgeData.name,
        role: badgeData.role,
        tier: 'Staff',
        avatar: badgeData.name.charAt(0),
        phone: '',
        joinDate: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        identifier: badgeId,
        assignedRoute: badgeData.assignedRoute || '',
        assignedVehicle: badgeData.assignedVehicle || '',
        badgeNumber: badgeId,
      };

      set({ user, token: badgeId, isAuthenticated: true });
      localStorage.setItem('token', badgeId);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Badge verification failed';
      return { success: false, error: message };
    }
  },

  adminLogin: async (email, password, adminKey) => {
    try {
      const firebaseUser = await firebaseSignIn(email, password);
      const tokenResult = await firebaseUser.getIdTokenResult();
      let userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile || userProfile.role !== 'admin') {
        return { success: false, error: 'Access denied. Not an admin account.' };
      }

      const normalizedKey = adminKey.trim().toUpperCase();
      if (!normalizedKey) {
        return { success: false, error: 'Admin access key is required.' };
      }

      const enteredHash = await sha256Hex(normalizedKey);

      if (!userProfile.adminKeyHash) {
        if (normalizedKey !== ADMIN_BOOTSTRAP_KEY) {
          return { success: false, error: 'No admin access key issued for this account. Contact your administrator.' };
        }
        await setDoc(doc(db, 'users', firebaseUser.uid), { adminKeyHash: enteredHash }, { merge: true });
        userProfile = { ...userProfile, adminKeyHash: enteredHash };
      } else if (userProfile.adminKeyHash !== enteredHash) {
        return { success: false, error: 'Invalid admin access key.' };
      }

      userProfile = { ...userProfile, loginTime: new Date().toISOString() };
      set({ user: userProfile, token: tokenResult.token, isAuthenticated: true });
      localStorage.setItem('token', tokenResult.token);
      sessionStorage.setItem('currentUser', JSON.stringify(userProfile));
      return { success: true, user: userProfile };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut();
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
    if (!currentUser) throw new Error('No user logged in');
    const updatedUser = { ...currentUser, ...updatedData };
    set({ user: updatedUser });
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  },

  hasRole: (role) => get().user?.role === role,
  isAdmin: () => get().user?.role === 'admin',
  isDriver: () => get().user?.role === 'driver',
  isConductor: () => get().user?.role === 'conductor',
}));

export default useAuthStore;
