// lib/firebaseAdmin.ts
import admin from "firebase-admin";

let app: admin.app.App;

export function getFirebaseAdmin() {
  if (app) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON no está definido en .env");

  const creds = JSON.parse(raw);
  // Corrige los \n de la private_key si vienen escapados
  if (creds.private_key?.includes("\\n")) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }

  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(creds),
      });

  return app;
}
