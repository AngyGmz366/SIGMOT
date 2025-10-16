import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const conn = await db.getConnection();
  
  try {
    // Obtener el ID de los parámetros de la URL
    const id = Number(params.id);

    // Validar si id es un número
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Obtener el estado desde el cuerpo de la solicitud
    const { estado } = await req.json();
    
    if (!estado) {
      return NextResponse.json({ error: 'Estado es obligatorio.' }, { status: 400 });
    }

    // Validar que el estado sea correcto
    if (estado !== 'ACTIVA' && estado !== 'INACTIVA') {
      return NextResponse.json({ error: 'Estado debe ser ACTIVA o INACTIVA' }, { status: 400 });
    }

    console.log(`🔧 Cambiando estado de ruta ${id} a ${estado}`);

    // Ejecutar el procedimiento almacenado para cambiar el estado
    await conn.query('CALL mydb.sp_rutas_cambiar_estado(?, ?)', [id, estado]);

    return NextResponse.json({ 
      ok: true, 
      message: 'Estado actualizado correctamente',
      id, 
      estado 
    }, { status: 200 });
    
  } catch (e: any) {
    console.error('❌ Error al cambiar estado:', e);
    const msg = (e?.sqlMessage || e?.message || 'Error desconocido').toString();
    const isBusiness = /no existe|activar|inválido|Límite/i.test(msg);
    
    return NextResponse.json({ 
      ok: false, 
      error: msg 
    }, { status: isBusiness ? 400 : 500 });
  } finally {
    conn.release();
  }
}