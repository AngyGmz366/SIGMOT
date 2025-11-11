// pages/api/catalogos/tipo_descuento/route.ts

import { db } from '@/lib/db_api';
import { TipoDescuento } from '@/types/ventas';


export async function GET(req: Request) {
  const conn = await db.getConnection();

  try {
    const [rows]: any = await conn.query('SELECT * FROM TBL_TIPO_DESCUENTO');
    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No se encontraron tipos de descuento' }),
        { status: 404 }
      );
    }

    // Convertir la respuesta en el formato adecuado (TipoDescuento[])
    const descuentos: TipoDescuento[] = rows.map((row: any) => ({
      id: row.id,
      tipo: row.tipo,
      monto: row.monto,
      Nombre_Descuento: row.Nombre_Descuento,
      Porcentaje_Descuento: row.Porcentaje_Descuento,
      id_Tipo_Descuento: row.id_Tipo_Descuento,
    }));

    return new Response(JSON.stringify(descuentos), { status: 200 });
  } catch (err: any) {
    console.error('Error al obtener tipos de descuento:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Error al obtener tipos de descuento' }),
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
