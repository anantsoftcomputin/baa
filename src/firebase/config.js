import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7uNDKLk5fWOLjq3VEnGuPjFhmiHD3luE",
  authDomain: "stationachyut.firebaseapp.com",
  projectId: "stationachyut",
  storageBucket: "stationachyut.firebasestorage.app",
  messagingSenderId: "571577470671",
  appId: "1:571577470671:web:dd87da57ba44c5b555f1ba",
  measurementId: "G-GF9L03PCSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, analytics, auth, db, storage, functions, googleProvider };
export default app;
