// app/main/api/reservas/[id]/estado/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const conn = await db.getConnection();

  try {
    const { estado_id } = await req.json();

    // Validaciones básicas
    if (!estado_id || isNaN(Number(estado_id))) {
      return NextResponse.json(
        { ok: false, error: 'ID de estado inválido.' },
        { status: 400 }
      );
    }

    // Verificar que es una reservación de encomienda
    const [reservaRows]: any = await conn.query(
      `SELECT Tipo_Reserva, Id_Encomienda_FK 
       FROM mydb.TBL_RESERVACIONES 
       WHERE Id_Reserva_PK = ?`,
      [Number(params.id)]
    );

    if (reservaRows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Reservación no encontrada.' },
        { status: 404 }
      );
    }

    const reserva = reservaRows[0];

    if (reserva.Tipo_Reserva !== 'ENCOMIENDA') {
      return NextResponse.json(
        { ok: false, error: 'Esta reservación no es una encomienda.' },
        { status: 400 }
      );
    }

    if (!reserva.Id_Encomienda_FK) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró la encomienda asociada.' },
        { status: 400 }
      );
    }

    // Llamar al stored procedure
    const [result]: any = await conn.query(
      'CALL mydb.sp_encomienda_actualizar_estado(?, ?)',
      [reserva.Id_Encomienda_FK, Number(estado_id)]
    );

    return NextResponse.json({
      ok: true,
      message: 'Estado de encomienda actualizado correctamente.',
      idReserva: params.id,
      idEncomienda: reserva.Id_Encomienda_FK,
      nuevoEstado: estado_id
    });

  } catch (err: any) {
    console.error('❌ Error en PUT /api/reservas/[id]/estado:', err);
    
    return NextResponse.json(
      {
        ok: false,
        error: err?.sqlMessage || err?.message || 'Error al cambiar el estado.',
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}