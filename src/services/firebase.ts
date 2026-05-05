import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config values are not secret — they're discoverable in any Firebase
// app's bundle. Security comes from Firestore rules, not config secrecy.
const firebaseConfig = {
  apiKey: 'AIzaSyCE39-6roD_MRZ7EYfPKWwTu6_18Dcjgnw',
  authDomain: 'pooptracker-154e3.firebaseapp.com',
  projectId: 'pooptracker-154e3',
  storageBucket: 'pooptracker-154e3.firebasestorage.app',
  messagingSenderId: '793594765861',
  appId: '1:793594765861:ios:2bcdf9956299a422ee15cc',
};

const app = initializeApp(firebaseConfig);

// initializeAuth (rather than getAuth) lets us pin the persistence layer to
// AsyncStorage, so sign-in survives app restarts. Without this, auth state
// is in-memory only.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export { app };
