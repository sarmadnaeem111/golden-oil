import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVTq89H0x_KzlgxiobbCGUhdnqICsBi48",
  authDomain: "customer-abe40.firebaseapp.com",
  projectId: "customer-abe40",
  storageBucket: "customer-abe40.firebasestorage.app",
  messagingSenderId: "566208631479",
  appId: "1:566208631479:web:540f9812eceb08690cb332",
  measurementId: "G-BKJVVKWWV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, googleProvider }; 