// /app/api/persona/route.ts
// /app/api/persona/route.ts
import { db } from '@/lib/db';  // Asegúrate de que la conexión a la base de datos esté configurada correctamente

export async function GET(req: Request) {
  // Obtener el Firebase UID o el ID de usuario local
  const firebaseUid = req.headers.get("Firebase-UID");
  const idUsuarioLocal = req.headers.get("Usuario-Local-ID");

  if (!firebaseUid && !idUsuarioLocal) {
    return new Response('No se proporcionó ni Firebase UID ni ID de usuario local', { status: 400 });
  }

  try {
    // Llamar al SP pasando el Firebase UID o el ID de usuario local
    const [personaData]: any = await db.query(`
      CALL sp_obtener_usuario_completo(?, ?);
    `, [firebaseUid, idUsuarioLocal ? Number(idUsuarioLocal) : null]);

    if (!personaData) {
      return new Response('Usuario no encontrado', { status: 404 });
    }

    return new Response(JSON.stringify(personaData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response('Error al obtener la información del usuario', { status: 500 });
  }
}
