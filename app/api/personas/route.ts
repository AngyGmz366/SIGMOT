export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

// Función de respuesta JSON
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// Función de respuesta de error en JSON
function jsonError(message: string, status = 500, extra?: any) {
  return json({ error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/* ==============================================
   🔹 GET /api/personas?tipoPersona=1&estado=ACTIVA
   ============================================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipoPersona');
  const estado = searchParams.get('estado'); // 👈 aquí recibimos el estado
  const conn = await db.getConnection();

  try {
    console.log('🔎 Listando personas: tipoPersona =', tipo || 'TODOS', ', estado =', estado || 'TODOS');

    // Llamamos al SP de listar personas
    const [rows]: any = await conn.query('CALL mydb.sp_personas_listar(?)', [
      tipo ? Number(tipo) : null,
    ]);

    // Normalizamos resultado
    let personas = rows?.[0] || [];

    // 🔹 FILTRO real por estado
    if (estado) {
      personas = personas.filter(
        (p: any) =>
          (p.Estado_Usuario?.toUpperCase() === estado.toUpperCase()) ||
          (p.Estado_Persona?.toUpperCase() === estado.toUpperCase())
      );
    }

    console.log(`✅ ${personas.length} personas filtradas (${estado || 'TODAS'})`);

    return new Response(JSON.stringify({ items: personas }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (e: any) {
    console.error('❌ Error en GET /personas:', e);
    return new Response(
      JSON.stringify({ error: e?.sqlMessage || e?.message || 'Error al listar personas' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  } finally {
    conn.release();
  }
}


/* ==============================================
   🔹 POST /api/personas
   ============================================== */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Normalizar llaves (aceptar Nombres o nombres, etc.)
  const nombres = body.nombres ?? body.Nombres ?? null;
  const apellidos = body.apellidos ?? body.Apellidos ?? null;
  const dni = body.dni ?? body.DNI ?? null;
  const genero_id = body.genero_id ?? body.Genero ?? null;
  const fecha_nac = body.fecha_nac ?? body.Fecha_Nacimiento ?? null;
  const telefono = body.telefono ?? body.Telefono ?? null;
  const correo = body.correo ?? body.Correo ?? null;
  const departamento = body.departamento ?? body.Departamento ?? null;
  const municipio = body.municipio ?? body.Municipio ?? null;
  const tipo_persona = body.tipo_persona ?? body.TipoPersona ?? null;
  const id_usuario_admin = body.id_usuario_admin ?? 1;
  const estado_persona = body.estado_persona ?? 'ACTIVA';  // Asignar 'ACTIVA' por defecto

  console.log('📦 BODY RECIBIDO:', body);
  console.log('📤 Parámetros enviados al SP:', [
    nombres,
    apellidos,
    dni,
    genero_id,
    fecha_nac,
    telefono,
    correo,
    departamento,
    municipio,
    tipo_persona,
    id_usuario_admin,
    estado_persona,
  ]);

  const conn = await db.getConnection();
  try {
    // Llamamos al procedimiento almacenado para crear la persona
    const [rows]: any = await conn.query(
      'CALL mydb.sp_personas_crear_basico(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        nombres,
        apellidos,
        dni,
        genero_id,
        fecha_nac || null,
        telefono,
        correo,
        departamento,
        municipio,
        tipo_persona,
        id_usuario_admin,
        estado_persona,  // Se pasa el estado al SP
      ]
    );

    const result = rows?.[0]?.[0] || null;
    return json({ message: 'Persona creada correctamente', result }, 201);
  } catch (e: any) {
    console.error('❌ Error en POST /personas:', e?.sqlMessage || e?.message, e);
    return jsonError(e?.sqlMessage || e?.message || 'Error al crear persona');
  } finally {
    conn.release();
  }
}
