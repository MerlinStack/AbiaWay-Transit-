import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole } from '../types';

export function onFirebaseAuthChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function firebaseSignIn(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    name: string;
    role: UserRole;
    badgeNumber?: string;
    assignedRoute?: string;
    assignedVehicle?: string;
  }
): Promise<User> {
  const user: User = {
    id: uid,
    email: data.email,
    name: data.name,
    role: data.role,
    tier: data.role === 'admin' ? 'Administrator' : data.role === 'driver' ? 'Staff' : data.role === 'conductor' ? 'Staff' : 'Premium',
    avatar: data.name.charAt(0).toUpperCase(),
    phone: '',
    joinDate: new Date().toISOString(),
    identifier: data.badgeNumber || uid,
    assignedRoute: data.assignedRoute || '',
    assignedVehicle: data.assignedVehicle || '',
    badgeNumber: data.badgeNumber || '',
  };

  await setDoc(doc(db, 'users', uid), {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}
