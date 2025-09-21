// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración de tu app Web (copiada de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCXOMTfPKZVcwlCDM-krtQu-AHAbZMWMbE",
  authDomain: "sigmot-1fa80.firebaseapp.com",
  projectId: "sigmot-1fa80",
  storageBucket: "sigmot-1fa80.appspot.com",  // corregido: .appspot.com
  messagingSenderId: "856492982081",
  appId: "1:856492982081:web:0a72c930f555f31f2debc0",
  measurementId: "G-7BWH9VQ0GN",
};

// Evita inicializar más de una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta el auth para usar en login
export const auth = getAuth(app);
