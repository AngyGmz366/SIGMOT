export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

// ==== Utilidades generales ====
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function jsonError(message: string, status = 500, extra?: any) {
  return json({ error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/* ==========================================================
   🔹 POST /api/facturas
   Crea una factura desde un boleto, encomienda o reservación
   ========================================================== */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const {
    Id_Producto_FK,
    Id_TipoProducto_FK,
    Id_Tipo_Descuento_FK,
    Subtotal,
    Descuento,
    ISV,
    Total,
    Id_MetodoPago_FK,
    Id_Empleado_FK,
    Id_Cliente_FK,
  } = body;

  // ✅ Validación rápida
  if (!Id_Producto_FK || !Id_TipoProducto_FK || !Id_MetodoPago_FK || !Id_Empleado_FK) {
    return jsonError('Faltan datos obligatorios para crear la factura.', 400, { body });
  }

  const conn = await db.getConnection();
  try {
    console.log('🧾 Creando factura desde producto:', body);

    const [rows]: any = await conn.query(
      'CALL mydb.sp_factura_crear_desde_producto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        Id_Producto_FK,
        Id_TipoProducto_FK,
        Id_Tipo_Descuento_FK || null,
        Subtotal,
        Descuento,
        ISV,
        Total,
        Id_MetodoPago_FK,
        Id_Empleado_FK,
        Id_Cliente_FK || null,
      ]
    );

    // 🔹 Capturar el resultado real del SP
    // Nota: rows[1] suele contener el SELECT final
    console.log('rows del SP:', rows);
    const factura = rows?.[1]?.[0] || rows?.[0]?.[0] || null;

    if (!factura) {
      console.warn('⚠️ El SP no devolvió datos de factura.');
      return jsonError('No se pudo generar la factura (sin resultado del SP).');
    }

    console.log('✅ Factura creada correctamente:', factura);
    return json({ message: 'Factura creada correctamente', factura }, 201);
  } catch (e: any) {
    console.error('❌ Error en POST /facturas/crear:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message || 'Error al crear factura');
  } finally {
    conn.release();
  }
}
