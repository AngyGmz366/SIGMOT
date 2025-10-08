'use client';

import React, { useState, useEffect } from 'react';
import IncidenciasAdminTable from './components/IncidenciasAdminTable';
import DetalleIncidencia from './components/DetalleIncidencia';

export interface Incidencia {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  estado: 'Pendiente' | 'En Progreso' | 'Resuelto';
}

const PageAdminIncidencias: React.FC = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<Incidencia | null>(null);
  const [detalleVisible, setDetalleVisible] = useState(false);

  // ✅ Cargar incidencias simuladas solo en el cliente
  useEffect(() => {
    const dummy: Incidencia[] = [
      {
        id: 1,
        titulo: 'Problema con pago',
        categoria: 'Pago',
        descripcion: 'El pago no se procesó correctamente.',
        fecha: '28/07/2025',
        estado: 'Pendiente',
      },
      {
        id: 2,
        titulo: 'Error en reserva',
        categoria: 'Reserva',
        descripcion: 'Mi reserva no aparece en el sistema.',
        fecha: '27/07/2025',
        estado: 'En Progreso',
      },
      {
        id: 3,
        titulo: 'Consulta general',
        categoria: 'Otro',
        descripcion: '¿Cuál es el horario de atención?',
        fecha: '25/07/2025',
        estado: 'Resuelto',
      },
    ];
    setIncidencias(dummy);
  }, []);

  const verDetalle = (incidencia: Incidencia) => {
    setIncidenciaSeleccionada(incidencia);
    setDetalleVisible(true);
  };

  const cambiarEstado = (id: number, nuevoEstado: Incidencia['estado']) => {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado: nuevoEstado } : i))
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Soporte</h2>
      </div>

      {/* Tabla de incidencias */}
      <div className="shadow-md rounded-lg overflow-hidden bg-white p-2">
        <IncidenciasAdminTable
          incidencias={incidencias}
          onVerDetalle={verDetalle}
          onCambiarEstado={cambiarEstado}
        />
      </div>

      {/* Modal de detalle */}
      <DetalleIncidencia
        incidencia={incidenciaSeleccionada}
        visible={detalleVisible}
        onHide={() => setDetalleVisible(false)}
      />
    </div>
  );
};

export default PageAdminIncidencias;
