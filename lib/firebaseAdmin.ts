// lib/firebaseAdmin.ts
import admin from "firebase-admin";
console.log("🧩 Clave privada detectada:", process.env.FB_PRIVATE_KEY ? "✅ Cargada" : "❌ VACÍA");
console.log("📏 Longitud clave:", process.env.FB_PRIVATE_KEY?.length || 0);

if (!admin.apps.length) {
  console.log("🔍 FB_PROJECT_ID:", process.env.FB_PROJECT_ID);
  console.log("🔍 FB_CLIENT_EMAIL:", process.env.FB_CLIENT_EMAIL);
  console.log("🔍 FB_PRIVATE_KEY exists:", !!process.env.FB_PRIVATE_KEY);
  console.log("🔍 FB_PRIVATE_KEY length:", process.env.FB_PRIVATE_KEY?.length || 0);


  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDB = admin.firestore();
