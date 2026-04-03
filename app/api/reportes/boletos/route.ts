import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

const moneda = (v: any) => {
  if (v === null || v === undefined || String(v).trim() === '') return 'Vacío';
  const n = Number(v);
  return isNaN(n)
    ? `L. ${String(v).trim()}`
    : `L. ${n.toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_boletos(NULL, NULL, NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Ticket: vacio(r.Id_Ticket),
      Codigo_Ticket: vacio(r.Codigo_Ticket),
      Fecha_Hora_Compra: vacio(r.Fecha_Hora_Compra),
      Fecha_Compra: vacio(r.Fecha_Compra),
      Hora_Compra: vacio(r.Hora_Compra),
      Precio_Total: moneda(r.Precio_Total),
      Id_Cliente: vacio(r.Id_Cliente),
      Nombres: vacio(r.Nombres),
      Apellidos: vacio(r.Apellidos),
      Cliente: vacio(r.Cliente),
      Cedula: vacio(r.Cedula),
      Telefono: vacio(r.Telefono),
      Origen: vacio(r.Origen),
      Destino: vacio(r.Destino),
      Hora_Salida: vacio(r.Hora_Salida),
      Autobus: vacio(r.Autobus),
      Numero_Asiento: vacio(r.Numero_Asiento),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
      MetodoPago: vacio(r.MetodoPago),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de boletos:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de boletos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}