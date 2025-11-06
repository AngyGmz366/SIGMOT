import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

// Configuración de Aiven
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_SSL_CA = process.env.DB_SSL_CA;

export async function POST(req: Request) {
  let connection: mysql.Connection | null = null;
  let tempFilePath: string | null = null;

  try {
    // Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar que sea un archivo SQL
    if (!file.name.endsWith('.sql')) {
      return NextResponse.json(
        { error: 'El archivo debe ser .sql' },
        { status: 400 }
      );
    }

    console.log('=== Iniciando restauración ===');
    console.log('Archivo:', file.name);
    console.log('Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Crear archivo temporal
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    tempFilePath = path.join(tempDir, `restore_${Date.now()}.sql`);

    // Convertir el archivo a buffer y guardarlo temporalmente
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(tempFilePath, buffer);

    // Leer contenido SQL
    const sqlContent = fs.readFileSync(tempFilePath, 'utf8');

    // Configurar SSL si existe
    const sslConfig = DB_SSL_CA && fs.existsSync(DB_SSL_CA)
      ? { ca: fs.readFileSync(DB_SSL_CA) }
      : undefined;

    // Conectar a la base de datos
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT || '3306'),
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      ssl: sslConfig,
      multipleStatements: true, // IMPORTANTE: permite ejecutar múltiples statements
    });

    console.log('Ejecutando restauración...');

    // Ejecutar el SQL
    await connection.query(sqlContent);

    console.log('=== Restauración completada ===');

    // Cerrar conexión
    await connection.end();

    // Limpiar archivo temporal
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('Archivo temporal eliminado');
    }

    return NextResponse.json({
      message: 'Respaldo restaurado exitosamente',
      archivo: file.name
    });

  } catch (error: any) {
    console.error('=== Error al restaurar ===');
    console.error('Mensaje:', error.message);

    // Cerrar conexión si existe
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error cerrando conexión:', e);
      }
    }

    // Limpiar archivo temporal si existe
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Error al limpiar:', cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: 'Error al restaurar el respaldo',
        detalles: error.message
      },
      { status: 500 }
    );
  }
}