import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ===============================
   GET - Listar Roles
=============================== */
export async function GET() {
  try {
    const [rows]: any = await db.query('CALL sp_roles_listar();');
    const data = rows[0].map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    }));
    return NextResponse.json({ ok: true, data, items : data });

  } catch (error: any) {
    console.error('❌ Error en GET /api/seguridad/roles:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/* ===============================
   POST - Crear Rol
=============================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, descripcion, creado_por } = body;

    await db.query('CALL sp_roles_crear(?, ?, ?);', [nombre, descripcion, creado_por || 'SYSTEM']);
    return NextResponse.json({ ok: true, message: 'Rol creado correctamente' });
  } catch (error: any) {
    console.error('❌ Error en POST /api/seguridad/roles:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/* ===============================
   PUT - Actualizar Rol
=============================== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, descripcion, modificado_por } = body;

    await db.query('CALL sp_roles_actualizar(?, ?, ?, ?);', [id, nombre, descripcion, modificado_por || 'SYSTEM']);
    return NextResponse.json({ ok: true, message: 'Rol actualizado correctamente' });
  } catch (error: any) {
    console.error('❌ Error en PUT /api/seguridad/roles:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/* ===============================
   DELETE - Eliminar Rol
=============================== */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Falta el ID del rol' }, { status: 400 });

    await db.query('CALL sp_roles_eliminar(?);', [id]);
    return NextResponse.json({ ok: true, message: 'Rol eliminado correctamente' });
  } catch (error: any) {
    console.error('❌ Error en DELETE /api/seguridad/roles:', error);
    
    // Mensaje personalizado si hay error de foreign key
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return NextResponse.json({ 
        ok: false, 
        error: 'No se puede eliminar el rol porque tiene permisos o usuarios asignados' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
