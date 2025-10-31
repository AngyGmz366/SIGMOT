import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function POST() {
  try {
    // Nombre del archivo de respaldo (puedes personalizar el nombre)
    const backupFileName = `SIGMOT-${new Date().toISOString()}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    // Ejecutar el comando mysqldump para crear el respaldo
    const comando = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} > ${backupFilePath}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al generar el respaldo: ${stderr}`);
        return NextResponse.error();
      }
      console.log('Respaldo creado correctamente:', stdout);
    });

    return NextResponse.json({ message: 'Respaldo creado exitosamente', newBackup: { label: backupFileName, value: backupFileName } });
  } catch (error) {
    console.error('Error al crear el respaldo:', error);
    return NextResponse.error();
  }
}
