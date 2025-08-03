'use client';
import { useState } from 'react';
import { incidenciasMock } from '../data/incidencias.mock';

export interface Incidencia {
  id: number;
  fecha: string;
  tipo: string;
  estado: string;
  descripcion: string;
}

export const useIncidencias = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>(incidenciasMock);

  const agregarIncidencia = (tipo: string, descripcion: string) => {
    const nuevaIncidencia: Incidencia = {
      id: incidencias.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      tipo,
      estado: 'Abierto',
      descripcion
    };

    setIncidencias([nuevaIncidencia, ...incidencias]);
  };

  return {
    incidencias,
    agregarIncidencia
  };
};
