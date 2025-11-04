import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Credenciales de la base de datos
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

// Directorio donde se almacenan los backups
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

export async function POST(req: Request) {
  try {
    const { archivo } = await req.json();

    if (!archivo) {
      return NextResponse.json(
        { error: 'El archivo de respaldo es requerido' }, 
        { status: 400 }
      );
    }

    // Validar que el archivo existe y está en el directorio correcto (seguridad)
    const archivoPath = path.join(BACKUP_DIR, archivo);
    
    // Verificar que no se intente acceder a archivos fuera del directorio de backups
    if (!archivoPath.startsWith(BACKUP_DIR)) {
      return NextResponse.json(
        { error: 'Ruta de archivo no válida' }, 
        { status: 400 }
      );
    }

    console.log('Iniciando restauración del archivo:', archivoPath);

    // Usar mysql con MYSQL_PWD en lugar de -p en el comando
    const comando = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_NAME} < "${archivoPath}"`;
    
    // Ejecutar el comando con la contraseña en la variable de entorno
    const { stdout, stderr } = await execAsync(comando, {
      env: {
        ...process.env,
        MYSQL_PWD: DB_PASS
      }
    });

    if (stderr && stderr.includes('ERROR')) {
      console.error('Error en la restauración:', stderr);
      return NextResponse.json(
        { error: `Error restaurando: ${stderr}` }, 
        { status: 500 }
      );
    }

    console.log('Respaldo restaurado correctamente');
    
    return NextResponse.json({ 
      message: 'Respaldo restaurado exitosamente',
      archivo: archivo
    });

  } catch (error: any) {
    console.error('Error al restaurar el respaldo:', error);
    return NextResponse.json(
      { 
        error: 'Error al restaurar el respaldo', 
        detalles: error.message 
      }, 
      { status: 500 }
    );
  }
}