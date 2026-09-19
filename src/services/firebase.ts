import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1mTNxjT87TO9Hk72d0XUrj0ybsAgedt8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mi-web-cinco.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mi-web-cinco",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mi-web-cinco.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "957613590926",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:957613590926:web:3dd2a9f57210bf6e093cdf"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Automatically ensure auth state for Firestore read/write permissions
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((err) => {
      console.log('Firebase anonymous session fallback notice:', err.message);
    });
  }
});
