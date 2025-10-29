"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// 🧩 Componentes locales
import PanelLateral from "./components/PanelLateral";
import HorariosTabla from "./components/HorariosTable";
import Loading from "./components/Loading";
import InfoRutaSeleccionada from "./components/InfoRutaSeleccionada";

// 📦 Tipos y acciones
import { RutaPublica } from "./Types/rutas.types";
import { getRutasPublic } from "./acciones/rutas.acciones";

// ✅ Carga dinámica del mapa (sin SSR)
const MapaInteractivo = dynamic(() => import("./components/MapaInteractivo"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-gray-500">Cargando mapa...</p>
  ),
});

export default function PageRutas() {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaPublica | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Cargar rutas desde API público
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getRutasPublic();

        console.log("🧭 Rutas recibidas desde API:", data);
        console.log("✅ Total de rutas activas:", data.length);
        setRutas(data);

        // Seleccionar primera ruta por defecto
        if (data.length > 0) {
          setRutaSeleccionada(data[0]);
        }
      } catch (err) {
        console.error("❌ Error cargando rutas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Acción al presionar "Reservar"
const onReservar = async (r: RutaPublica) => {
  // Aquí guardás la ruta seleccionada antes de redirigir
  localStorage.setItem('rutaSeleccionada', JSON.stringify({
    idRuta: r.id,
    nombre: `${r.origen} → ${r.destino}`,
    origen: r.origen,
    destino: r.destino,
    precio: r.precio,
  }));

  // Luego redirigís
  router.push("/cliente/reservacion/nueva");
};


  // 🔹 Manejar selección de ruta (solo para mostrar info)
  const onSeleccionarRuta = (r: RutaPublica) => {
    setRutaSeleccionada(r);
  };

  // 🔹 Estados de carga
  if (loading)
    return (
      <div className="p-4">
        <Loading height="300px" />
      </div>
    );

  if (!rutas.length)
    return <div className="p-4">No hay rutas disponibles.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Panel lateral - FIXED HEIGHT */}
      <div className="w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <PanelLateral
          rutas={rutas}
          onSeleccionarRuta={onSeleccionarRuta}
          onReservar={onReservar}
        />
      </div>

      {/* 🗺️ Contenido principal - SCROLLABLE */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* === Mapa === */}
        <div className="mb-6">
          <MapaInteractivo rutas={rutas} />
        </div>

        {/* === Horarios e Información === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <HorariosTabla
              rutas={rutas
                .filter((r) => r.horarios && r.horarios.length > 0)
                .map((r) => ({
                  origen: r.origen,
                  destino: r.destino,
                  horarios: r.horarios ?? [],
                }))}
            />
          </div>

          <div>
            <InfoRutaSeleccionada rutaSeleccionada={rutaSeleccionada} />
          </div>
        </div>
      </div>
    </div>
  );
}