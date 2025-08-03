'use client';

import React, { useState } from 'react';
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
  const [incidencias, setIncidencias] = useState<Incidencia[]>([
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
  ]);

  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<Incidencia | null>(null);
  const [detalleVisible, setDetalleVisible] = useState(false);

  const verDetalle = (incidencia: Incidencia) => {
    setIncidenciaSeleccionada(incidencia);
    setDetalleVisible(true);
  };

  const cambiarEstado = (id: number, nuevoEstado: Incidencia['estado']) => {
    setIncidencias((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, estado: nuevoEstado } : i
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-3xl font-bold mb-4">Gestión de Incidencias y Soporte</h2>

      <IncidenciasAdminTable
        incidencias={incidencias}
        onVerDetalle={verDetalle}
        onCambiarEstado={cambiarEstado}
      />

      <DetalleIncidencia
        incidencia={incidenciaSeleccionada}
        visible={detalleVisible}
        onHide={() => setDetalleVisible(false)}
      />
    </div>
  );
};

export default PageAdminIncidencias;
