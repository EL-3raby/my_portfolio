import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: (rawApiKey && rawApiKey !== 'undefined' && rawApiKey.length > 5) 
    ? rawApiKey 
    : "AIzaSyBMzd71_AgiIxcI0QIJGMu3YElwIjWBva8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-web-site-38e27.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-web-site-38e27",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-web-site-38e27.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "117572972471",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:117572972471:web:c21c82bdd620e61e33c232",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-C85QQMST7H"
};

// Initialize Firebase safely for SSR & Client hydration
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
