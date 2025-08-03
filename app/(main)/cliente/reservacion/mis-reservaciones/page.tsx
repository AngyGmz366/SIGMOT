'use client';
import TablaReservaciones from './components/TablaReservaciones';

type EstadoReservacion = 'confirmada' | 'pendiente' | 'cancelada';
type TipoReservacion = 'viaje' | 'encomienda';

interface Reservacion {
  id: string;
  tipo: TipoReservacion;
  ruta: string;
  fecha: Date;
  hora: string;
  asiento?: string;
  peso?: number;
  estado: EstadoReservacion;
}

export default function MisReservacionesPage() {
  // Datos de ejemplo mejorados
  const reservaciones: Reservacion[] = [
    {
      id: 'RES-001',
      tipo: 'viaje',
      ruta: 'Tegucigalpa - San Pedro Sula',
      fecha: new Date('2023-12-15'),
      hora: '08:00 AM',
      asiento: '12A',
      estado: 'confirmada'
    },
    {
      id: 'RES-002',
      tipo: 'encomienda',
      ruta: 'San Pedro Sula - Tegucigalpa',
      fecha: new Date('2023-12-20'),
      hora: '02:00 PM',
      peso: 15,
      estado: 'pendiente'
    },
    {
      id: 'RES-003',
      tipo: 'viaje',
      ruta: 'Tegucigalpa - La Ceiba',
      fecha: new Date('2023-12-22'),
      hora: '10:00 AM',
      asiento: '08B',
      estado: 'cancelada'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mis Reservaciones</h1>
        <div className="border rounded-lg overflow-hidden">
          <TablaReservaciones reservaciones={reservaciones} />
        </div>
      </div>
    </div>
  );
}