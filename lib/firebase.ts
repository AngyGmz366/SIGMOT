// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Config de Firebase (copiada de tu consola)
const firebaseConfig = {
  apiKey: "AIzaSyCXOMTfPKZVcwICDM-krtQu-AHabZWMMbE",
  authDomain: "sigmot-1fa80.firebaseapp.com",
  projectId: "sigmot-1fa80",
  storageBucket: "sigmot-1fa80.appspot.com",
  messagingSenderId: "856492982081",
  appId: "1:856492982081:web:0a72c930f5553f12f2debc0",
  measurementId: "G-7BWH9V0Q9N"
};

// Evita inicializar más de una vez en Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
