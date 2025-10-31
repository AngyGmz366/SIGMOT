export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


// Ruta dentro del proyecto para almacenar los respaldos
const BACKUP_DIR = path.join(process.cwd(), 'backups');  // Usa process.cwd() para obtener la ruta raíz del proyecto

export async function GET() {
  try {
    // Leer los archivos del directorio de respaldos
    const files = fs.readdirSync(BACKUP_DIR);

    // Filtrar solo los archivos .sql
    const backupFiles = files
      .filter((file) => file.endsWith('.sql'))
      .map((file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);

        return {
          label: file,
          value: file,
          fecha: stats.mtime.toISOString(),  // Fecha de última modificación
          tamano: stats.size,  // Tamaño del archivo
        };
      });

    return NextResponse.json({ backups: backupFiles });
  } catch (error) {
    console.error('Error al obtener los respaldos:', error);
    return NextResponse.error();
  }
}
