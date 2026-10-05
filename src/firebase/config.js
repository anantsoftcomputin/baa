import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Values come from .env (see .env.example). The fallbacks are the project's
// current production settings so an un-configured checkout still runs.
const env = process.env;
const firebaseConfig = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA7uNDKLk5fWOLjq3VEnGuPjFhmiHD3luE",
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN || "stationachyut.firebaseapp.com",
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID || "stationachyut",
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET || "stationachyut.firebasestorage.app",
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "571577470671",
  appId: env.REACT_APP_FIREBASE_APP_ID || "1:571577470671:web:dd87da57ba44c5b555f1ba",
  measurementId: env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GF9L03PCSC",
};

// Must match the region the Cloud Functions are deployed to (functions/index.js).
export const FUNCTIONS_REGION = env.REACT_APP_FUNCTIONS_REGION || "asia-south1";

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, FUNCTIONS_REGION);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Local development against the Firebase Emulator Suite (`npm run emulators`).
export const USE_EMULATORS = env.REACT_APP_USE_EMULATORS === "true";
if (USE_EMULATORS) {
  connectAuthEmulator(auth, "http://127.0.0.1:9411", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8485);
  connectStorageEmulator(storage, "127.0.0.1", 9412);
  connectFunctionsEmulator(functions, "127.0.0.1", 5411);
}

// Analytics is unavailable in some browsers (and in tests), so load it only when supported.
// `analytics` is a live binding: it stays null until support is confirmed.
let analytics = null;
if (!USE_EMULATORS) {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

export { app, analytics, auth, db, storage, functions, googleProvider };
export default app;
