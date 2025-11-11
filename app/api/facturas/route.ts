export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

/* ==== Utilidades generales ==== */
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
  let body;
  
  try {
    body = await req.json();
  } catch (e) {
    console.error('❌ Error parseando JSON:', e);
    return jsonError('Cuerpo de la solicitud no es JSON válido', 400);
  }

  console.log('📥 Datos recibidos en POST /api/facturas:', JSON.stringify(body, null, 2));

  if (!body || Object.keys(body).length === 0) {
    return jsonError('Cuerpo de la solicitud vacío', 400);
  }

  // ✅ Validar campos obligatorios
  const {
    Id_Producto_FK,
    Id_TipoProducto_FK,
    Subtotal,
    Descuento,
    ISV,
    Total,
    Id_Tipo_Descuento_FK,
    Id_MetodoPago_FK,
    Id_Empleado_FK,
    Id_Cliente_FK,
  } = body;

  // Validación detallada
  const faltantes = [];
  if (!Id_Producto_FK) faltantes.push('Id_Producto_FK');
  if (!Id_TipoProducto_FK) faltantes.push('Id_TipoProducto_FK');
  if (!Id_MetodoPago_FK) faltantes.push('Id_MetodoPago_FK');
  if (!Id_Empleado_FK) faltantes.push('Id_Empleado_FK');

  if (faltantes.length > 0) {
    console.error('❌ Campos faltantes:', faltantes);
    return jsonError('Faltan datos obligatorios para crear la factura', 400, { 
      camposFaltantes: faltantes,
      datosRecibidos: body
    });
  }

  const conn = await db.getConnection();
  try {
    console.log('🧾 Creando factura con datos:', {
      Id_Producto_FK,
      Id_TipoProducto_FK,
      Subtotal,
      Descuento,
      ISV,
      Total,
      Id_Tipo_Descuento_FK,
      Id_MetodoPago_FK,
      Id_Empleado_FK,
      Id_Cliente_FK,
    });

    // ✅ Llamada al SP con parámetros EN EL ORDEN CORRECTO
    const [rows]: any = await conn.query(
      `CALL mydb.sp_factura_crear_desde_producto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(Id_Producto_FK),      // 1️⃣ p_Id_Producto
        Number(Id_TipoProducto_FK),  // 2️⃣ p_Id_TipoProducto_FK
        Number(Subtotal || 0),       // 3️⃣ p_Subtotal
        Number(Descuento || 0),      // 4️⃣ p_Descuento
        Number(ISV || 0),            // 5️⃣ p_ISV
        Number(Total || 0),          // 6️⃣ p_Total
        Id_Tipo_Descuento_FK ? Number(Id_Tipo_Descuento_FK) : null,  // 7️⃣ p_Id_Tipo_Descuento_FK
        Number(Id_MetodoPago_FK),    // 8️⃣ p_Id_MetodoPago_FK
        Number(Id_Empleado_FK),      // 9️⃣ p_Id_Empleado_FK
        Id_Cliente_FK ? Number(Id_Cliente_FK) : null,  // 🔟 p_Id_Cliente_FK
      ]
    );

    // ✅ Capturar el resultado del SP
    const factura = rows?.[0]?.[0] || null;

    if (!factura) {
      console.warn('⚠️ El SP no devolvió datos de factura.');
      return jsonError('No se pudo generar la factura (sin resultado del SP).');
    }

    console.log('✅ Factura creada correctamente:', factura);

    return json({ 
      message: 'Factura creada correctamente', 
      factura 
    }, 201);

  } catch (e: any) {
    console.error('❌ Error en POST /facturas/crear:', e?.sqlMessage || e?.message || e);
    return jsonError(
      e?.sqlMessage || e?.message || 'Error al crear factura',
      500,
      { sql: e?.sql }
    );
  } finally {
    conn.release();
  }
}