import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ===============================
   GET - Listar permisos de un rol
=============================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rolParam = searchParams.get('rol');

  try {
    let idRol: number;

    // Si es un número, es el ID directamente
    if (!isNaN(Number(rolParam))) {
      idRol = Number(rolParam);
    } else {
      // Si es texto, buscar el ID del rol
      const [rolRows]: any = await db.query(
        'SELECT Id_Rol_PK FROM mydb.TBL_MS_ROLES WHERE Rol = ? LIMIT 1;',
        [rolParam]
      );

      if (!rolRows || rolRows.length === 0) {
        return NextResponse.json({ 
          ok: false, 
          message: 'Rol no encontrado' 
        }, { status: 404 });
      }

      idRol = rolRows[0].Id_Rol_PK;
    }

    // Consultar permisos con el ID del rol
    const [rows]: any = await db.query('CALL sp_permisos_por_rol_listar(?);', [idRol]);

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
    return NextResponse.json({ 
      ok: false, 
      message: 'Error al obtener permisos' 
    }, { status: 500 });
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