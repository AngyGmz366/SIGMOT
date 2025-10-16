import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { idUsuario, codigo } = await req.json();
  if (!idUsuario || !codigo) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(
      'SELECT * FROM TBL_MS_2FA_EMAIL WHERE Id_Usuario_FK=? AND Codigo=? AND Usado=0 AND Expira>=NOW()',
      [idUsuario, codigo]
    );

    if (!rows.length) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Marcar código como usado
    await conn.query(
      'UPDATE TBL_MS_2FA_EMAIL SET Usado=1 WHERE Id_2FA_PK=?',
      [rows[0].Id_2FA_PK]
    );

    return NextResponse.json({ valid: true });
  } catch (e) {
    console.error('Error verificando código 2FA:', e);
    return NextResponse.json({ error: 'Error al verificar código' }, { status: 500 });
  } finally {
    conn.release();
  }
}
