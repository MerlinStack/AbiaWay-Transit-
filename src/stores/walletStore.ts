import { create } from 'zustand';
import { Transaction } from '../types';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  addFunds: (amount: number) => void;
  deductFunds: (amount: number, description: string) => boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  refreshBalance: () => Promise<number>;
  getBalance: () => { balance: number; currency: string; available: boolean };
  getTransactionHistory: (limit?: number, offset?: number) => Transaction[];
  clearTransactions: () => void;
}

const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],

  addFunds: (amount) => {
    set((state) => ({ balance: state.balance + amount }));
    get().addTransaction({ type: 'credit', description: 'Wallet Top-up', amount, date: new Date().toLocaleString() });
  },

  deductFunds: (amount, description) => {
    const { balance } = get();
    if (balance >= amount) {
      set((state) => ({ balance: state.balance - amount }));
      get().addTransaction({ type: 'debit', description, amount, date: new Date().toLocaleString() });
      return true;
    }
    return false;
  },

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [{ id: Date.now(), ...transaction }, ...state.transactions].slice(0, 10)
    }));
  },

  refreshBalance: async () => {
    return get().balance;
  },

  getBalance: () => ({ balance: get().balance, currency: 'NGN', available: true }),

  getTransactionHistory: (limit = 10, offset = 0) => {
    return get().transactions.slice(offset, offset + limit);
  },

  clearTransactions: () => set({ transactions: [] }),
}));

export default useWalletStore;
