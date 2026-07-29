export type UserRole = 'admin' | 'driver' | 'conductor' | 'passenger';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: string;
  avatar: string;
  phone: string;
  joinDate: string;
  loginTime?: string;
  lastLogin?: string | null;
  identifier?: string;
  assignedRoute?: string;
  assignedVehicle?: string;
  badgeNumber?: string;
}

export interface Booking {
  id: string;
  route: string;
  date: string;
  time: string;
  seats: string[];
  fare: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  bus: string;
  from?: string;
  to?: string;
  passengers?: number;
  createdAt?: string;
  busId?: string;
}

export interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
}

export interface Bus {
  id: string;
  route: string;
  capacity: number;
  eta: number;
  platform: number;
  driver: string;
}

export interface BusRoute {
  id: number;
  name: string;
  duration: number;
  fare: number;
  stops: number;
  popularity: number;
}

export interface CardInfo {
  cardId?: string;
  cardholder?: string;
  balance: number;
  tier?: string;
  points?: number;
}
