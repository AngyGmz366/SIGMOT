import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';  // Asegúrate de tener una conexión a la base de datos configurada

// GET: Obtener todos los empleados
export async function GET() {
  const conn = await getSafeConnection();
  try {
    const [rows] = await conn.query('CALL sp_empleados_obtener_todos();');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json({ error: 'Error al obtener empleados' }, { status: 500 });
  }
}

// POST: Insertar un nuevo empleado
export async function POST(request: Request) {
  const conn = await getSafeConnection();
  const { Id_Cargo_FK, Id_Estado_Empleado_FK, fechacontratacion, horaentrada, horasalida, Id_Persona_FK } = await request.json();
  
  try {
    const [result] = await conn.query('CALL sp_empleados_insertar(?, ?, ?, ?, ?, ?)', [
      Id_Cargo_FK, Id_Estado_Empleado_FK, fechacontratacion, horaentrada, horasalida, Id_Persona_FK
    ]);
    return NextResponse.json({ message: 'EMPLEADO CREADO CORRECTAMENTE', result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al insertar empleado' }, { status: 500 });
  }
}
