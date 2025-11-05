// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWwqaPGt1daPvTXy-I335H_oHq7VrexJs",
  authDomain: "delivery-d48cc.firebaseapp.com",
  projectId: "delivery-d48cc",
  storageBucket: "delivery-d48cc.firebasestorage.app",
  messagingSenderId: "1060852126985",
  appId: "1:1060852126985:web:7ec6bbd191ddb0f0a0afd8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    authInstance = getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);
