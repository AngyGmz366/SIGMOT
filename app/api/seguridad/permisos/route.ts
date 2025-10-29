import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ===============================
   GET - Listar permisos de un rol
=============================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rol = searchParams.get('rol');

  try {
    const [rows]: any = await db.query('CALL sp_permisos_por_rol_listar(?);', [rol]);

    const data = rows[0].map((r: any) => ({
      Id_Objeto: r.Id_Objeto,
      Objeto: r.Objeto,
      Tipo_Objeto: r.Tipo_Objeto,
      Ver: Number(r.Ver) ?? 0,
      Crear: Number(r.Crear) ?? 0,
      Editar: Number(r.Editar) ?? 0,
      Eliminar: Number(r.Eliminar) ?? 0,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error('❌ Error al obtener permisos:', error);
    return NextResponse.json({ ok: false, message: 'Error al obtener permisos' }, { status: 500 });
  }
}

/* ===============================
   PUT - Actualizar permisos
=============================== */
export async function PUT(req: Request) {
  try {
    const { idRol, idObjeto, ver, crear, editar, eliminar } = await req.json();

    await db.query('CALL sp_permisos_por_rol_actualizar(?, ?, ?, ?, ?, ?, ?);', [
      idRol,
      idObjeto,
      ver,
      crear,
      editar,
      eliminar,
      'ADMINISTRADOR',
    ]);

    return NextResponse.json({ ok: true, message: 'Permiso actualizado correctamente' });
  } catch (error: any) {
    console.error('❌ Error en PUT /api/seguridad/permisos:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
