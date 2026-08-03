import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Bus, BusRoute, Booking, Transaction } from '../types';

interface BusDocument extends Omit<Bus, 'driver'> {
  driverId: string;
  driverName: string;
  status: 'active' | 'charging' | 'maintenance' | 'offline';
  soc: number;
  lat: number;
  lng: number;
  lastUpdated: Timestamp;
}

interface BookingDocument extends Omit<Booking, 'date' | 'createdAt'> {
  userId: string;
  date: Timestamp;
  createdAt: Timestamp;
}

interface RouteDocument extends Omit<BusRoute, 'stops'> {
  fare: number;
  stops: string[];
  isActive: boolean;
}

export const busesCollection = collection(db, 'buses');
export const routesCollection = collection(db, 'routes');
export const bookingsCollection = collection(db, 'bookings');
export const transactionsCollection = collection(db, 'transactions');

export async function getAllBuses(): Promise<BusDocument[]> {
  const snapshot = await getDocs(query(busesCollection, orderBy('lastUpdated', 'desc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusDocument));
}

export async function getActiveBuses(): Promise<BusDocument[]> {
  const snapshot = await getDocs(query(busesCollection, where('status', '==', 'active')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusDocument));
}

export async function getBusById(id: string): Promise<BusDocument | null> {
  const snap = await getDoc(doc(db, 'buses', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BusDocument;
}

export async function updateBusLocation(id: string, lat: number, lng: number, soc?: number): Promise<void> {
  const data: Record<string, unknown> = { lat, lng, lastUpdated: serverTimestamp() };
  if (typeof soc === 'number') data.soc = soc;
  await updateDoc(doc(db, 'buses', id), data);
}

export async function getAllRoutes(): Promise<RouteDocument[]> {
  const snapshot = await getDocs(routesCollection);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as RouteDocument));
}

export async function getActiveRoutes(): Promise<RouteDocument[]> {
  const snapshot = await getDocs(query(routesCollection, where('isActive', '==', true)));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as RouteDocument));
}

export async function createBooking(booking: Omit<BookingDocument, 'createdAt'>): Promise<string> {
  const ref = await addDoc(bookingsCollection, {
    ...booking,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserBookings(userId: string): Promise<BookingDocument[]> {
  const snapshot = await getDocs(
    query(bookingsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BookingDocument));
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const snapshot = await getDocs(
    query(transactionsCollection, where('userId', '==', userId), orderBy('date', 'desc'))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Transaction));
}
