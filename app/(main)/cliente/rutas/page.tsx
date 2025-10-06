'use client'; // 👈 debe ir primero y sola (sin dynamic ni revalidate)

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // 👈 Leaflet solo cliente
import PanelLateral from './components/PanelLateral';
import HorariosTabla from './components/HorariosTable';
import AsientosBus from './components/Asientos/AsientosBus';
import { obtenerRutasMock } from './acciones/rutas.acciones';
import { Ruta } from './Types/rutas.types';

// ✅ Import dinámico para evitar SSR en Leaflet
const MapaInteractivo = dynamic(() => import('./components/MapaInteractivo'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-500">Cargando mapa...</p>,
});

const PageRutas: React.FC = () => {
  const router = useRouter();

  const [rutasDisponibles, setRutasDisponibles] = useState<Ruta[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);

  useEffect(() => {
    // Cargar rutas de ejemplo en cliente
    const rutas = obtenerRutasMock();
    setRutasDisponibles(rutas);
    if (rutas.length > 0) setRutaSeleccionada(rutas[0]);
  }, []);

  if (!rutaSeleccionada) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Cargando rutas...</p>
      </div>
    );
  }

  // Simulación de asientos (puedes sustituirlo luego por datos reales)
  const asientosSimulados = Array.from({ length: 21 }, (_, i) => ({
    numero: i + 1,
    ocupado: [2, 5, 12].includes(i + 1),
  }));

  // Evento al seleccionar una ruta
  const manejarSeleccionRuta = (ruta: Ruta) => {
    setRutaSeleccionada(ruta);
    router.push('/cliente/reservacion');
  };

  return (
    <div className="flex h-screen">
      {/* Panel lateral */}
      <div className="border-right-1 surface-border" style={{ width: '300px' }}>
        <PanelLateral rutas={rutasDisponibles} onSeleccionarRuta={manejarSeleccionRuta} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Mapa */}
        <div className="mb-4">
          <MapaInteractivo ruta={rutaSeleccionada} />
        </div>

        {/* Horarios y asientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <HorariosTabla ruta={rutaSeleccionada} />
          </div>
          <div>
            <AsientosBus asientos={asientosSimulados} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageRutas;
