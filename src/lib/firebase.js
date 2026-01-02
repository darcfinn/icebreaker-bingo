import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes Firebase and exports the configured services.
 * Environment variables are loaded from .env.local
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNDryo1trXwkaQsFqMDQy7DkJxZuKXfBc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "icebreaker-bingo-91a9c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "icebreaker-bingo-91a9c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "icebreaker-bingo-91a9c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "669185422322",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:669185422322:web:cfc4e11f13cdae1b18b16b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('🔥 Firebase initialized');