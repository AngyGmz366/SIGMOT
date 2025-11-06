import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

export async function GET() {
  try {
    // Crear directorio si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      return NextResponse.json({ backups: [] });
    }

    // Leer archivos del directorio
    const archivos = fs.readdirSync(BACKUP_DIR);
    
    // Filtrar solo archivos .sql y obtener información
    const backups = archivos
      .filter(archivo => archivo.endsWith('.sql'))
      .map(archivo => {
        const rutaCompleta = path.join(BACKUP_DIR, archivo);
        const stats = fs.statSync(rutaCompleta);
        
        return {
          label: archivo,
          value: archivo,
          fecha: stats.mtime.toISOString(),
          tamano: stats.size
        };
      })
      // Ordenar por fecha más reciente primero
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    console.log(`Encontrados ${backups.length} backups en ${BACKUP_DIR}`);

    return NextResponse.json({ backups });

  } catch (error: any) {
    console.error('Error al listar backups:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener lista de respaldos',
        detalles: error.message,
        backups: []
      },
      { status: 500 }
    );
  }
}