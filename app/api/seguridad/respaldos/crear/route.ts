import { NextResponse } from 'next/server';
import mysqldump from 'mysqldump';
import fs from 'fs';
import path from 'path';

// Configuración de Aiven
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'test';
const DB_SSL_CA = process.env.DB_SSL_CA;

export async function POST() {
  let tempFilePath: string | null = null;
  
  try {
    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const backupFileName = `SIGMOT_${timestamp}.sql`;
    
    // Usar directorio temporal del sistema operativo
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    tempFilePath = path.join(tempDir, backupFileName);

    console.log('=== Iniciando creación de backup ===');
    console.log('Archivo temporal:', tempFilePath);
    console.log('Base de datos:', DB_NAME);
    console.log('Host:', DB_HOST);

    // Configurar conexión SSL
    const sslConfig = DB_SSL_CA && fs.existsSync(DB_SSL_CA)
      ? { ca: fs.readFileSync(DB_SSL_CA).toString() }
      : undefined;

    // Crear backup usando mysqldump de npm
    await mysqldump({
      connection: {
        host: DB_HOST,
        port: parseInt(DB_PORT || '3306'),
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        ssl: sslConfig,
      },
      dumpToFile: tempFilePath,
      compressFile: false,
    });

    // Verificar que el archivo fue creado
    if (!fs.existsSync(tempFilePath)) {
      throw new Error('El archivo de backup no fue creado');
    }

    // Obtener información del archivo
    const stats = fs.statSync(tempFilePath);
    console.log('=== Backup completado ===');
    console.log('Tamaño:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

    // Leer el archivo para enviarlo al cliente
    const fileBuffer = fs.readFileSync(tempFilePath);

    // Eliminar archivo temporal inmediatamente
    fs.unlinkSync(tempFilePath);
    console.log('Archivo temporal eliminado');

    // Devolver el archivo como descarga
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${backupFileName}"`,
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error: any) {
    console.error('=== Error al crear el backup ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    // Limpiar archivo temporal si existe
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Archivo temporal eliminado después de error');
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear el respaldo',
        detalles: error.message
      },
      { status: 500 }
    );
  }
}