import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Replace with your Firebase project config from console.firebase.google.com
// Copy .env.example to .env and fill in your values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
}

// Demo mode (auto-admin against mock data) is a DEV-ONLY convenience for running
// without Firebase configured. It can NEVER activate in a production build:
// import.meta.env.DEV is false in `vite build`, so a prod deploy missing the API
// key fails closed (auth errors) instead of silently opening as admin.
export const DEMO_MODE = import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY

// The club admin — permanent god-mode (also hardcoded in Firestore security rules).
// Whoever logs in with this email is auto-approved as admin and can approve others.
export const ADMIN_EMAIL = 'sstewart207@gmail.com'

let app, auth, db, storage

if (!DEMO_MODE) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  // Session-only auth: closing the browser logs the user out (good for shared/club computers).
  setPersistence(auth, browserSessionPersistence).catch(() => {})
} else {
  // Stub objects used when Firebase isn't configured
  auth = null
  db = null
  storage = null
  app = null
}

export { auth, db, storage }
export default app
