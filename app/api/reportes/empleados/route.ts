import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_empleados(NULL, NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => {
      const horaEntrada =
        r.Hora_Entrada ?? r.HoraEntrada ?? r.horaEntrada ?? null;

      const horaSalida =
        r.Hora_Salida ?? r.HoraSalida ?? r.horaSalida ?? null;

      const horario =
        r.Horario ??
        (horaEntrada && horaSalida
          ? `${horaEntrada} - ${horaSalida}`
          : horaEntrada
          ? `Entrada: ${horaEntrada}`
          : horaSalida
          ? `Salida: ${horaSalida}`
          : 'Vacío');

      return {
        ...r,
        Id_Empleado_PK: vacio(r.Id_Empleado_PK),
        Empleado: vacio(r.Empleado),
        DNI: vacio(r.DNI),
        Telefono: vacio(r.Telefono),
        Cargo: vacio(r.Cargo),
        Estado:
          vacio(
            r.Estado ??
            r.estado ??
            r.Nombre_Estado ??
            r.Estado_Descripcion
          ),
        Fecha_Contratacion: vacio(r.Fecha_Contratacion),
        Horario: vacio(horario),
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de empleados:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de empleados.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}