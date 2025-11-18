import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

/**
 * POST /api/clientes/reservas/encomienda
 * Crea una reservación de tipo ENCOMIENDA.
 */
export async function POST(req: NextRequest) {
  const conn = await db.getConnection();

  try {
    const body = await req.json();
    const { 
      dni: dniManual, 
      correo: correoManual, 
      idViaje, 
      descripcion, 
      fecha, 
      costo 
    } = body;

    let dni: string | null = null;
    let correo: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // Obtener UID desde Authorization: Bearer <idToken>
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        firebaseUID = decoded.uid;
      } catch (err) {
        console.warn('⚠️ Token Bearer inválido o expirado');
      }
    }

    // ----------------------------
    // Buscar DNI Y CORREO según UID
    // ----------------------------
    if (firebaseUID) {
      const [rows]: any[] = await conn.query(
        `
        SELECT p.DNI, c.Correo
        FROM mydb.TBL_MS_USUARIO u
        INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
        LEFT JOIN mydb.TBL_CORREOS c ON c.Id_Correo_PK = p.Id_Correo_FK
        WHERE u.Firebase_UID = ?
        LIMIT 1;
        `,
        [firebaseUID]
      );
      dni = rows?.[0]?.DNI ?? null;
      correo = rows?.[0]?.Correo ?? null;
    }

    // ----------------------------
    // Modo DEV (mantener compatibilidad)
    // ----------------------------
    if (!dni && !correo) {
      dni = dniManual || null;
      correo = correoManual || null;
      
      if (dniManual || correoManual) {
        console.warn('⚠️ Modo DEV: usando DNI/Correo recibido en body');
      }
    }

    // ----------------------------
    // Validación - debe tener al menos DNI o Correo
    // ----------------------------
    if (!dni && !correo) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No se pudo identificar al cliente. Asegúrese de que haya sesión activa o proporcione un DNI/correo válido.',
        },
        { status: 401 }
      );
    }

    // ----------------------------
    // Validación de campos requeridos
    // ----------------------------
    if (!idViaje) {
      return NextResponse.json(
        { ok: false, error: 'El ID del viaje es requerido.' },
        { status: 400 }
      );
    }

    if (!descripcion || descripcion.trim() === '') {
      return NextResponse.json(
        { ok: false, error: 'La descripción es requerida.' },
        { status: 400 }
      );
    }

    if (descripcion.length > 50) {
      return NextResponse.json(
        { ok: false, error: 'La descripción no puede exceder los 50 caracteres.' },
        { status: 400 }
      );
    }

    if (isNaN(Number(costo)) || Number(costo) <= 0) {
      return NextResponse.json(
        { ok: false, error: 'El costo debe ser un número válido y mayor que 0.' },
        { status: 400 }
      );
    }

    if (fecha && isNaN(new Date(fecha).getTime())) {
      return NextResponse.json(
        { ok: false, error: 'Fecha inválida.' },
        { status: 400 }
      );
    }

    // Validar que idViaje sea un número válido
    if (isNaN(Number(idViaje))) {
      return NextResponse.json(
        { ok: false, error: 'ID de viaje debe ser un número válido.' },
        { status: 400 }
      );
    }

    // ----------------------------
    // Ejecutar SP actualizado
    // ----------------------------
    console.log('Llamando al SP con los siguientes parámetros:', {
      dni,
      correo,
      idViaje,
      descripcion,
      fecha,
      costo,
    });

    await conn.beginTransaction();

    try {
      await conn.query('SET @out_id_reserva = NULL;');
      
      // Llamar al SP actualizado que acepta DNI y correo
      await conn.query(
        'CALL sp_cliente_reservacion_crear_encomienda(?,?,?,?,?,?,@out_id_reserva);',
        [
          dni,           // p_dni (puede ser NULL)
          correo,        // p_correo (puede ser NULL)
          idViaje,
          descripcion,
          fecha ? new Date(fecha) : new Date(),
          costo,
        ]
      );

      const [out]: any[] = await conn.query('SELECT @out_id_reserva AS idReserva;');
      const idReserva = out?.[0]?.idReserva ?? null;

      if (!idReserva) {
        throw new Error('No se pudo obtener el ID de la reservación.');
      }

      await conn.commit();

      return NextResponse.json(
        {
          ok: true,
          message: 'Reservación de encomienda creada exitosamente.',
          idReserva,
          datosUsados: {
            dni: dni ? 'Sí' : 'No',
            correo: correo ? 'Sí' : 'No',
            autenticado: !!firebaseUID
          }
        },
        { status: 201 }
      );

    } catch (spError: any) {
      await conn.rollback();
      throw spError;
    }

  } catch (err: any) {
    console.error('❌ Error en POST /api/clientes/reservas/encomienda:', err);
    
    // Manejar errores específicos del SP
    const errorMessage = err?.sqlMessage || err?.message || 'Error al crear reservación.';
    
    // Errores conocidos del SP
    if (errorMessage.includes('Persona no encontrada')) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró una persona con el DNI o correo proporcionado.' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('Viaje no encontrado')) {
      return NextResponse.json(
        { ok: false, error: 'El viaje seleccionado no existe.' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('costo debe ser mayor a 0')) {
      return NextResponse.json(
        { ok: false, error: 'El costo debe ser mayor a 0.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    try {
      conn.release();
    } catch (releaseErr) {
      console.error('❌ Error al liberar la conexión en finally:', releaseErr);
    }
  }
}