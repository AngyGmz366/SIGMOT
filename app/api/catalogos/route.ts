export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/* ============================================================
   🔹 GET /api/catalogos?tipo=generos|estado_cliente|estado_empleado|cargos|unidades|asientos|tipo_descuento
============================================================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const conn = await db.getConnection();

  try {
    if (!tipo) return json({ error: 'Debe especificar el tipo de catálogo' }, 400);

    let query = '';

    switch (tipo) {
      // 🚻 GÉNEROS
      case 'generos':
        query = `
          SELECT Id_Genero_PK AS value, Genero AS label
          FROM mydb.TBL_CAT_GENERO
          ORDER BY Genero ASC;
        `;
        break;

      // 👥 ESTADO CLIENTE
      case 'estado_cliente':
        query = `
          SELECT Id_EstadoCliente_PK AS value, Estado_Cliente AS label
          FROM mydb.TBL_ESTADO_CLIENTE
          ORDER BY Estado_Cliente ASC;
        `;
        break;

      // 🧑‍💼 ESTADO EMPLEADO
      case 'estado_empleado':
        query = `
          SELECT Id_EstadoEmpleado_PK AS value, Estado_Empleado AS label
          FROM mydb.TBL_ESTADO_EMPLEADO
          ORDER BY Estado_Empleado ASC;
        `;
        break;

      // 💼 CARGOS
      case 'cargos':
        query = `
          SELECT Id_Cargo_PK AS value, Cargo AS label
          FROM mydb.TBL_CARGOS
          ORDER BY Cargo ASC;
        `;
        break;

      // 🚌 UNIDADES DISPONIBLES
      case 'unidades':
        query = `
          SELECT Id_Unidad_PK AS value, CONCAT(Placa, ' - ', Marca, ' ', Modelo) AS label
          FROM mydb.TBL_UNIDADES
          WHERE Id_EstadoUnidad_FK IN (
            SELECT Id_EstadoUnidad_PK FROM mydb.TBL_ESTADO_UNIDAD
            WHERE Estado_Unidad NOT IN ('EN_MANTENIMIENTO')
          )
          ORDER BY Placa ASC;
        `;
        break;

      // 💺 ASIENTOS DISPONIBLES
      case 'asientos':
        query = `
          SELECT Id_Asiento_PK AS value, Numero_Asiento AS label
          FROM mydb.TBL_ASIENTOS
          WHERE Estado_Asiento = 'DISPONIBLE'
          ORDER BY Numero_Asiento ASC;
        `;
        break;

      // 💰 TIPO DE DESCUENTO
      case 'tipo_descuento':
        query = `
          SELECT id_Tipo_Descuento AS value, Nombre_Descuento AS label
          FROM mydb.TBL_TIPO_DESCUENTO
          ORDER BY Nombre_Descuento ASC;
        `;
        break;

      default:
        return json({ error: `Tipo de catálogo no reconocido: ${tipo}` }, 400);
    }

    const [rows]: any = await conn.query(query);
    return json({ items: rows }, 200);

  } catch (e: any) {
    console.error(`❌ Error cargando catálogo [${tipo}]:`, e);
    return json({ error: e?.message || 'Error interno al cargar catálogo' }, 500);
  } finally {
    conn.release();
  }
}
