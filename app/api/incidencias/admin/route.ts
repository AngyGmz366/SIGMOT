import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 🔹 Endpoint: GET /api/incidencias/admin
 * Devuelve todas las incidencias del sistema con su información completa
 * (usuario, tipo, estado, asunto, descripción y fecha)
 */

export async function GET() {
  try {
    // Consulta principal de incidencias con joins
    const [rows]: any = await db.query(`
      SELECT 
        i.Id_Incidencia_PK AS Id_Incidencia,
        u.Correo_Electronico AS Usuario,
        ti.Tipo AS Tipo_Incidencia,
        ei.Estado AS Estado_Actual,
        i.Asunto,
        i.Descripcion,
        DATE_FORMAT(i.Fecha_Creacion, '%Y-%m-%d %H:%i:%s') AS Fecha_Creacion
      FROM mydb.TBL_INCIDENCIAS i
      INNER JOIN mydb.TBL_MS_USUARIO u 
        ON u.Id_Usuario_PK = i.Id_Usuario_FK
      INNER JOIN mydb.TBL_TIPO_INCIDENCIA ti 
        ON ti.Id_TipoIncidencia_PK = i.Id_TipoIncidencia_FK
      INNER JOIN mydb.TBL_ESTADO_INCIDENCIA ei 
        ON ei.Id_EstadoIncidencia_PK = i.Id_EstadoIncidencia_FK
      ORDER BY i.Fecha_Creacion DESC;
    `);

    // Si no hay registros
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [],
        message: 'No hay incidencias registradas.',
      });
    }

    // Éxito
    return NextResponse.json({
      ok: true,
      data: rows,
    });
  } catch (error: any) {
    console.error('❌ Error al obtener incidencias admin:', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Error interno del servidor al obtener incidencias.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 🔒 Manejo de otros métodos HTTP no permitidos
 * (Evita el error 405 Method Not Allowed)
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: 'Método no permitido. Usa GET.' },
    { status: 405 }
  );
}
