'use client';

import { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import TablaReservaciones from './components/TablaReservaciones';
import { cargarReservacionesCliente } from '@/modulos/reservas/controlador/reservas.controlador';

// 🔹 Tipos
type EstadoReservacion = 'confirmada' | 'pendiente' | 'cancelada';
type TipoReservacion = 'viaje' | 'encomienda';

interface Reservacion {
  id: string;
  tipo: TipoReservacion;
  ruta: string;
  fecha: Date | string;
  hora?: string;
  asiento?: string;
  peso?: number;
  estado: EstadoReservacion;
}

export default function MisReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await cargarReservacionesCliente();
        setReservaciones(data);
      } catch (error) {
        console.error('❌ Error cargando reservaciones:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus reservaciones.',
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <Toast ref={toast} />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mis Reservaciones</h1>

        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              <p className="mt-3">Cargando tus reservaciones...</p>
            </div>
          ) : reservaciones.length > 0 ? (
            <TablaReservaciones reservaciones={reservaciones} />
          ) : (
            <p className="text-center py-6 text-gray-500">
              No tienes reservaciones registradas aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
