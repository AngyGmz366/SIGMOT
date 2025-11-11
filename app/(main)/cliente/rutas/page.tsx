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

// 🎨 Estilos específicos de la página
import "./page.css";

// ✅ Carga dinámica del mapa (sin SSR)
const MapaInteractivo = dynamic(() => import("./components/MapaInteractivo"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-gray-500">Cargando mapa...</p>
  ),
});

// 🔹 Tipo para las vistas en móvil
type VistaMovil = 'rutas' | 'mapa';

export default function PageRutas() {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const [vistaMovil, setVistaMovil] = useState<VistaMovil>('rutas');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // 🔹 Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔹 Cargar rutas desde API público
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getRutasPublic();

        console.log("🧭 Rutas recibidas desde API:", data);
        console.log("✅ Total de rutas activas:", data.length);
        setRutas(data);

        // Seleccionar la primera ruta por defecto
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
    localStorage.setItem('rutaSeleccionada', JSON.stringify({
      idRuta: r.id,
      nombre: `${r.origen} → ${r.destino}`,
      origen: r.origen,
      destino: r.destino,
      precio: r.precio,
    }));

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6">
        {/* === Botones de navegación para móvil === */}
        {isMobile && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setVistaMovil(vistaMovil === 'rutas' ? 'mapa' : 'rutas')}
              className="boton-navegacion-movil"
            >
              {vistaMovil === 'rutas' ? 'Ver Mapa' : 'Ver Rutas'}
            </button>
          </div>
        )}

        {/* === Header informativo === */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
          <p className="text-gray-600">
            
          </p>
        </div>

        {/* === Contenido según vista (móvil) o todo junto (desktop) === */}
        {isMobile ? (
          vistaMovil === 'rutas' ? (
            /* === Vista de Rutas en Móvil === */
            <div className="space-y-6">
              <PanelLateral
                rutas={rutas}
                onSeleccionarRuta={onSeleccionarRuta}
                onReservar={onReservar}
              />
            </div>
          ) : (
            /* === Vista de Mapa en Móvil === */
            <div className="space-y-6">
              <div className="mb-6">
                <MapaInteractivo rutas={rutas} />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
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
          )
        ) : (
          /* === Vista de Escritorio (todo junto) === */
          <>
            {/* === Mapa === */}
            <div className="mb-6">
              <MapaInteractivo rutas={rutas} />
            </div>

            {/* === Panel Lateral HORIZONTAL === */}
            <div className="mb-6">
              <PanelLateral
                rutas={rutas}
                onSeleccionarRuta={onSeleccionarRuta}
                onReservar={onReservar}
              />
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
          </>
        )}
      </div>
    </div>
  );
}