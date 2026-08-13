import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export const hionFirebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isHionFirebaseConfigured(config: FirebaseOptions = hionFirebaseConfig): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.storageBucket && config.appId);
}

export function getHionFirebaseApp(): FirebaseApp {
  if (!isHionFirebaseConfigured()) {
    throw new Error("HION Consent Firebase 환경 설정이 누락되었습니다.");
  }
  return getApps().length > 0 ? getApp() : initializeApp(hionFirebaseConfig);
}

export function getHionFirestore(): Firestore {
  return getFirestore(getHionFirebaseApp());
}

export function getHionFirebaseStorage(): FirebaseStorage {
  return getStorage(getHionFirebaseApp());
}
