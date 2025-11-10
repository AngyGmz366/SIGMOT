import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';


// DELETE: Eliminar un empleado o marcarlo como despedido
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const conn = await getSafeConnection();
  const { id } = params;

  try {
    const [result]: any = await conn.query('CALL sp_empleados_eliminar(?)', [id]);

    // El procedimiento retorna si fue ELIMINADO o DESPEDIDO
    const accion = result[0]?.[0]?.accion;

    if (accion === 'DESPEDIDO') {
      return NextResponse.json({
        message: 'El empleado tiene relaciones con otras tablas. Se ha marcado como DESPEDIDO.',
        accion: 'DESPEDIDO'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        message: 'EMPLEADO ELIMINADO CORRECTAMENTE',
        accion: 'ELIMINADO'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return NextResponse.json({ error: 'Error al eliminar empleado' }, { status: 500 });
  }
}

// PUT: Actualizar un empleado
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const conn = await getSafeConnection();
  const { id } = params;
  const {
    Id_Cargo_FK,
    Id_Estado_Empleado_FK,
    fechacontratacion,
    horaentrada,
    horasalida,
    Id_Persona_FK
  } = await request.json();

  // Asegurarnos de que la fecha esté en el formato correcto (YYYY-MM-DD)
  const formattedFecha = fechacontratacion.split('T')[0];  // Esto elimina la parte de la hora y el 'Z'

  try {
    const [result] = await conn.query('CALL sp_empleados_actualizar(?, ?, ?, ?, ?, ?, ?)', [
      id,
      Id_Cargo_FK,
      Id_Estado_Empleado_FK,
      formattedFecha, // Usar la fecha con el formato correcto
      horaentrada,
      horasalida,
      Id_Persona_FK
    ]);

    return NextResponse.json({ message: 'EMPLEADO ACTUALIZADO CORRECTAMENTE', result }, { status: 200 });
  } catch (error) {
    console.error('Error en la actualización:', error);
    return NextResponse.json({ error: 'Error al actualizar empleado' }, { status: 500 });
  }
}


// GET: Obtener empleados por filtro (DNI, nombre, apellido)
export async function GET(request: Request) {
  const conn = await getSafeConnection();
  const { searchParams } = new URL(request.url);

  const DNI = searchParams.get('DNI') || null;
  const Nombre = searchParams.get('Nombre') || null;
  const Apellido = searchParams.get('Apellido') || null;

  console.log('Filtros - DNI:', DNI, 'Nombre:', Nombre, 'Apellido:', Apellido);

  try {
    const [rows] = await conn.query('CALL sp_empleados_obtener_por_filtro(?, ?, ?)', [DNI, Nombre, Apellido]);

    // rows[0] contiene el primer resultado del procedimiento
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al obtener empleados por filtro:', error);
    return NextResponse.json({ error: 'Error al obtener empleados por filtro' }, { status: 500 });
  }
}