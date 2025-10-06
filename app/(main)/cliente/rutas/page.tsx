<<<<<<< HEAD
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
=======
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PanelLateral from "./components/PanelLateral";
import HorariosTabla from "./components/HorariosTable"; // o HorariosChips
import MapaInteractivo from "./components/MapaInteractivo";
import AsientosBus from "./components/Asientos/AsientosBus";
import Loading from "./components/Loading";
import { RutaPublica } from "./Types/rutas.types";
import { getRutasPublic } from "./acciones/rutas.acciones";

export default function PageRutas() {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
  const [sel, setSel] = useState<RutaPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getRutasPublic();
        setRutas(data);
        setSel(data[0] ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const asientosSimulados = useMemo(
    () => Array.from({ length: 21 }, (_, i) => ({ numero: i + 1, ocupado: [2, 5, 12].includes(i + 1) })),
    []
  );

  const onSelect = (r: RutaPublica) => {
    setSel(r);
    router.push(`/cliente/reservacion`); // si ya navegas al reservar, deja esto
>>>>>>> a92798c (Módulo RUTAS completo: SPs, validaciones, APIs y vistas cliente/admin finalizadas)
  };

  if (loading) return <div className="p-4"><Loading height="300px" /></div>;
  if (!sel) return <div className="p-4">No hay rutas disponibles</div>;

  return (
    <div className="flex h-screen">
<<<<<<< HEAD
      {/* Panel lateral */}
      <div className="border-right-1 surface-border" style={{ width: '300px' }}>
        <PanelLateral rutas={rutasDisponibles} onSeleccionarRuta={manejarSeleccionRuta} />
=======
      <div className="border-right-1 surface-border" style={{ width: 300 }}>
        <PanelLateral rutas={rutas} onSeleccionarRuta={onSelect} />
>>>>>>> a92798c (Módulo RUTAS completo: SPs, validaciones, APIs y vistas cliente/admin finalizadas)
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4">
          <MapaInteractivo ruta={{
            // adapta tu componente si esperaba otra forma; aquí pasamos lo básico
            id: sel.id, nombre: `${sel.origen} → ${sel.destino}`,
            origen: sel.origen, destino: sel.destino,
            estado: "activo", tiempoEstimado: sel.tiempoEstimado ?? "", coordenadas: [], paradas: []
          } as any} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <HorariosTabla horarios={sel.horarios} />
          </div>
          <div>
            <AsientosBus asientos={asientosSimulados} />
          </div>
        </div>
      </div>
    </div>
  );
}
