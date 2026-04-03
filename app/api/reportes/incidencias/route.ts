import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

// GET /api/reportes/incidencias
export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_incidencias(NULL, NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Incidencia_PK: vacio(r.Id_Incidencia_PK),
      Usuario: vacio(r.Usuario),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
      Asunto: vacio(r.Asunto),
      Descripcion: vacio(r.Descripcion),
      Fecha_Creacion: vacio(r.Fecha_Creacion),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de incidencias:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de incidencias.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}