"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// 🧩 Componentes locales
import PanelLateral from "./components/PanelLateral";
import HorariosTabla from "./components/HorariosTable";
import AsientosBus from "./components/Asientos/AsientosBus";
import Loading from "./components/Loading";

// 📦 Tipos y acciones
import { RutaPublica } from "./Types/rutas.types";
import { getRutasPublic } from "./acciones/rutas.acciones";

// ✅ Carga dinámica del mapa (sin SSR)
const MapaInteractivo = dynamic(() => import("./components/MapaInteractivo"), {
  ssr: false,
  loading: () => <p className="text-center text-gray-500">Cargando mapa...</p>,
});



export default function PageRutas() {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
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
      } catch (err) {
        console.error("❌ Error cargando rutas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Asientos simulados (temporal)
  const asientosSimulados = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => ({
        numero: i + 1,
        ocupado: [2, 5, 12].includes(i + 1),
      })),
    []
  );

  // 🔹 Acción al presionar "Reservar"
  const onReservar = async (r: RutaPublica) => {
    console.log("🎫 Reservando ruta:", r);
    // pequeña pausa visual
    await new Promise((res) => setTimeout(res, 400));
    router.push("/cliente/reservacion");
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

  // ===================================================
  // 💠 Render principal
  // ===================================================
  return (
    <div className="flex h-screen">
      {/* 🧭 Panel lateral */}
      <div className="border-right-1 surface-border" style={{ width: 320 }}>
        <PanelLateral rutas={rutas} onSeleccionarRuta={onReservar} />
      </div>

      {/* 🗺️ Contenido principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* === Mapa === */}
        <div className="mb-4">
          <MapaInteractivo rutas={rutas} />
        </div>

        {/* === Horarios y Asientos === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <AsientosBus asientos={asientosSimulados} />
          </div>
        </div>
      </div>
    </div>
  );
}
