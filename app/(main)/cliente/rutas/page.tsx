'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PanelLateral from "./components/PanelLateral";
import HorariosTabla from "./components/HorariosTable"; // o HorariosChips
import AsientosBus from "./components/Asientos/AsientosBus";
import Loading from "./components/Loading";
import { RutaPublica } from "./Types/rutas.types";
import { getRutasPublic } from "./acciones/rutas.acciones";

// ✅ Import dinámico de Leaflet (evita SSR)
const MapaInteractivo = dynamic(() => import("./components/MapaInteractivo"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-gray-500">Cargando mapa...</p>
  ),
});

export default function PageRutas() {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
  const [sel, setSel] = useState<RutaPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Cargar rutas desde API público
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

  // 🔹 Simulación de asientos (demo)
  const asientosSimulados = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => ({
        numero: i + 1,
        ocupado: [2, 5, 12].includes(i + 1),
      })),
    []
  );

  // 🔹 Evento al seleccionar una ruta
  const onSelect = (r: RutaPublica) => {
    setSel(r);
    router.push("/cliente/reservacion"); // si deseas redirigir al reservar
  };

  if (loading) return <div className="p-4"><Loading height="300px" /></div>;
  if (!sel) return <div className="p-4">No hay rutas disponibles</div>;

  return (
    <div className="flex h-screen">
      {/* Panel lateral */}
      <div className="border-right-1 surface-border" style={{ width: 300 }}>
        <PanelLateral rutas={rutas} onSeleccionarRuta={onSelect} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4">
          <MapaInteractivo
            ruta={{
              id: sel.id,
              nombre: `${sel.origen} → ${sel.destino}`,
              origen: sel.origen,
              destino: sel.destino,
              estado: "activo",
              tiempoEstimado: sel.tiempoEstimado ?? "",
              coordenadas: [],
              paradas: [],
            } as any}
          />
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
