import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

/** โหมดพัฒนาที่ใช้ Firebase Emulator ในเครื่อง (ข้อมูลตัวอย่าง แยกจากข้อมูลจริง) */
export const USE_EMULATORS = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';

const env = import.meta.env;

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export const missingConfigKeys: string[] = USE_EMULATORS
  ? []
  : REQUIRED_KEYS.filter((k) => !(env[k] as string | undefined)?.trim());

export const firebaseReady = missingConfigKeys.length === 0;

export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;

if (firebaseReady) {
  app = initializeApp(
    USE_EMULATORS
      ? {
          // ค่าสำหรับ Emulator เท่านั้น (โปรเจกต์ demo-* ไม่เชื่อมต่อบริการจริง)
          apiKey: 'demo-emulator-key',
          authDomain: 'demo-tharaeng.firebaseapp.com',
          projectId: 'demo-tharaeng',
          appId: 'demo-app',
        }
      : {
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: env.VITE_FIREBASE_APP_ID,
        },
  );
  auth = getAuth(app);
  auth.languageCode = 'th';
  db = getFirestore(app);

  if (USE_EMULATORS) {
    const host = window.location.hostname || '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
  }
}
