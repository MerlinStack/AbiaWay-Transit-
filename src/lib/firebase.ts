import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBTLv0hS0RV_Kj3ouO2oZCSITNiQfkxP5s',
  authDomain: 'abiaway-transit.firebaseapp.com',
  projectId: 'abiaway-transit',
  storageBucket: 'abiaway-transit.firebasestorage.app',
  messagingSenderId: '727159307988',
  appId: '1:727159307988:web:14f9bbb39915e0d3830541',
  measurementId: 'G-0HKFV16WG5',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
