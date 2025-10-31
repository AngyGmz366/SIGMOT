import { NextResponse } from 'next/server';
import { exec } from 'child_process';

// Obtener las credenciales de la base de datos desde las variables de entorno
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

export async function POST(req: Request) {
  // Obtener el nombre del archivo de respaldo desde la solicitud (body)
  const { archivo } = await req.json();  // Espera el nombre del archivo como parte del cuerpo de la solicitud

  if (!archivo) {
    return NextResponse.json({ error: 'El archivo de respaldo es requerido' }, { status: 400 });
  }

  try {
    // Construir el comando para restaurar el respaldo utilizando mysqldump
    const comando = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${archivo}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restaurando el respaldo: ${stderr}`);
        return NextResponse.json({ error: `Error restaurando el respaldo: ${stderr}` }, { status: 500 });
      }
      console.log('Respaldo restaurado correctamente:', stdout);
    });

    return NextResponse.json({ message: 'Respaldo restaurado exitosamente' });
  } catch (error) {
    console.error('Error al restaurar el respaldo:', error);
    return NextResponse.json({ error: 'Error al restaurar el respaldo' }, { status: 500 });
  }
}
