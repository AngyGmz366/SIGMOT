export const runtime = 'nodejs';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, nuevaContrasena } = await req.json();

    if (!email) {
      return Response.json({ error: 'Correo requerido' }, { status: 400 });
    }

    if (!nuevaContrasena) {
      return Response.json({ error: 'Nueva contraseña requerida' }, { status: 400 });
    }

    // 1️⃣ Encriptar contraseña antes de enviar al SP
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    // 2️⃣ Llamar al SP con correo y hash
    await db.query('CALL sp_reset_confirmado_bitacora(?, ?)', [email, hash]);

    // 3️⃣ Responder al cliente
    return Response.json({ ok: true, mensaje: 'Contraseña actualizada y registrada en bitácora' });
  } catch (err: any) {
    console.error('❌ Error en reset-confirm:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
