import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_personas(NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Persona: vacio(r.Id_Persona),
      Nombres: vacio(r.Nombres),
      Apellidos: vacio(r.Apellidos),
      Nombre_Completo: vacio(r.Nombre_Completo),
      DNI: vacio(r.DNI),
      Telefono: vacio(r.Telefono),
      Fecha_Nacimiento: vacio(r.Fecha_Nacimiento),
      Genero: vacio(r.Genero),
      Tipo_Persona: vacio(r.Tipo_Persona),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de personas:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de personas.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}