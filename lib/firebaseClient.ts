'use client'; // 👈 fuerza ejecución solo en el navegador

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ⚠️ Usa variables de entorno NEXT_PUBLIC_ para exponerlas en el cliente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Protege la inicialización para que no se ejecute durante SSR
let app;
if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  // En entorno servidor (build / SSR), devuelve un objeto vacío temporal
  app = {} as any;
}

// Exportar auth solo si existe app
export const auth = typeof window !== 'undefined' ? getAuth(app) : ({} as any);

// 🟢 Solo muestra el log si se ejecuta en navegador
if (typeof window !== 'undefined') {
}

export default app;
