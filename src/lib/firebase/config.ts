import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const useFirebaseEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === '1';
if (
  useFirebaseEmulators &&
  (process.env.NODE_ENV === 'production' || firebaseConfig.projectId !== 'demo-yttm-e2e')
) {
  throw new Error('Firebase emulators require development mode and the demo-yttm-e2e project');
}
const existingApp = getApps().length > 0;
export const app = existingApp ? getApp() : initializeApp(firebaseConfig);
if (useFirebaseEmulators && app.options.projectId !== 'demo-yttm-e2e') {
  throw new Error('An existing Firebase app does not belong to the E2E demo project');
}
export const db = getFirestore(app);
if (useFirebaseEmulators && !existingApp) connectFirestoreEmulator(db, '127.0.0.1', 8086);
