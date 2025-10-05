export const runtime = 'nodejs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: 'Correo requerido' }, { status: 400 });

    await db.query('CALL sp_reset_solicitado_bitacora(?)', [email]);

    return Response.json({ ok: true, mensaje: 'Solicitud registrada en bitácora' });
  } catch (err: any) {
    console.error('❌ Error en bitácora reset:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

