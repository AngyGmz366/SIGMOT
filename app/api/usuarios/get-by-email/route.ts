export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Falta el correo.' }, { status: 400 });

    const [rows]: any = await conn.query(
      'SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO WHERE Correo_Electronico = ? LIMIT 1',
      [email]
    );
    const user = rows?.[0];
    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.', id_usuario: null });
    }

    return NextResponse.json({ id_usuario: user.Id_Usuario_PK });
  } catch (error: any) {
    console.error('❌ Error en /api/usuarios/get-by-email:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
