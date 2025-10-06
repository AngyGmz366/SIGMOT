export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Ctx = { params?: { id?: string } };

function getIdFromPath(url: string): number | null {
  try {
    const p = new URL(url).pathname.split('/'); // ["", "api", "rutas", "1", "precio"]
    const i = p.findIndex(seg => seg === 'rutas');
    const raw = i >= 0 ? p[i + 1] : '';
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const conn = await db.getConnection();
  try {
    // 1) intenta con params; si no, cae al fallback por URL
    const rawId = ctx?.params?.id ?? '';
    let id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) {
      id = getIdFromPath(req.url) ?? NaN;
    }
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: `ID inválido en la URL` }, { status: 400 });
    }

    // 2) body
    const { precio } = await req.json().catch(() => ({}));
    const n = Number(precio);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: 'precio debe ser un número >= 0' }, { status: 400 });
    }

    // 3) SP
    await conn.query('CALL mydb.sp_ruta_precio_guardar(?, ?)', [id, n]);
    return NextResponse.json({ ok: true, id, precio: n }, { status: 200 });
  } catch (e: any) {
    const msg = (e?.sqlMessage || e?.message || 'Error').toString();
    const status = /no existe|precio/i.test(msg) ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  } finally {
    conn.release();
  }
}
