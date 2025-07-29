'use client';
import React, { useState } from 'react';
import MapaInteractivo from './components/MapaInteractivo';
import PanelLateral from './components/PanelLateral';
import HorariosTabla from './components/HorariosTable';
import AsientosBus from './components/Asientos/AsientosBus';
import { obtenerRutasMock } from './acciones/rutas.acciones';
import { Ruta } from './Types/rutas.types';

const PageRutas: React.FC = () => {
  const rutasDisponibles = obtenerRutasMock();
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta>(rutasDisponibles[0]);

  // Simulación de asientos disponibles (esto debería venir de la ruta o backend eventualmente)
  const asientosSimulados = [
    { numero: 1, ocupado: false },
    { numero: 2, ocupado: true },
    { numero: 3, ocupado: false },
    { numero: 4, ocupado: true },
    { numero: 5, ocupado: false },
    { numero: 6, ocupado: false },
    { numero: 7, ocupado: true },
    { numero: 8, ocupado: false },
  ];

  return (
  <div className="flex h-screen">
    <div className="w-20rem border-right-1 surface-border">
      <PanelLateral rutas={rutasDisponibles} onSeleccionarRuta={setRutaSeleccionada} />
    </div>

    <div className="flex-1 p-4 overflow-auto">
      <div className="grid gap-4">
        <div className="col-12">
          <MapaInteractivo ruta={rutaSeleccionada} />
        </div>

        <div className="col-12 md:col-6">
          <HorariosTabla ruta={rutaSeleccionada} />
        </div>

        <div className="col-12 md:col-6">
          <AsientosBus asientos={asientosSimulados} />
        </div>
      </div>
    </div>
  </div>
);

};

export default PageRutas;
