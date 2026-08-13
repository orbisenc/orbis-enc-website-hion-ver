import type { FirebaseOptions } from "firebase/app";
import { isHionFirebaseConfigured } from "@/lib/firebase/client";
import { isFirebaseServerConfigured } from "@/server/providers/firebase-firestore";

export interface FirebaseBackendStatus {
  configured: boolean;
  projectId: string | null;
  appId: string | null;
  databaseRegion: "asia-northeast3";
  serverConfigured: boolean;
  dataPath: "hionConsentRuntime/private/tenants/{tenantId}/campaigns/{campaignId}";
}

export function getFirebaseBackendStatus(
  config: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  env: Record<string, string | undefined> = process.env,
): FirebaseBackendStatus {
  return {
    configured: isHionFirebaseConfigured(config),
    projectId: config.projectId ?? null,
    appId: config.appId ?? null,
    databaseRegion: "asia-northeast3",
    serverConfigured: isFirebaseServerConfigured(env),
    dataPath: "hionConsentRuntime/private/tenants/{tenantId}/campaigns/{campaignId}",
  };
}
