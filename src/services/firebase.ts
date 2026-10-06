import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyDKSrAAK7g5kMdNVuPvBxi1gDA_rtDKM28",
  authDomain: "adt-academicdepartmentaltrack.firebaseapp.com",
  projectId: "adt-academicdepartmentaltrack",
  storageBucket: "adt-academicdepartmentaltrack.firebasestorage.app",
  messagingSenderId: "835681166935",
  appId: "1:835681166935:web:3b15389d07797e4859a512",
  measurementId: "G-RRWDJSMCR1"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics safely when in browser environment
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked (e.g. adblocker)
  });
}
