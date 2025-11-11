import { useEffect, useState } from 'react';
import { getClientes, getMetodosPago, getEstadosTicket } from '@/modulos/boletos/servicios/ventas.servicios';
import { apiGet } from '@/lib/http';
import type { Opcion } from '@/modulos/boletos/servicios/ventas.servicios';

interface Catalogos {
  clientes: Opcion[];
  metodosPago: Opcion[];
  estados: Opcion[];
  rutas: Opcion[];
  cargando: boolean;
  recargar: () => Promise<void>;
}

/**
 * Hook global para cargar y cachear catálogos base del sistema.
 * Se usa en BoletoDialog, EncomiendaDialog, PersonaModal, etc.
 */
export function useCatalogos(): Catalogos {
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [metodosPago, setMetodosPago] = useState<Opcion[]>([]);
  const [estados, setEstados] = useState<Opcion[]>([]);
  const [rutas, setRutas] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🧠 Función que carga todos los catálogos en paralelo
  const cargarCatalogos = async () => {
    try {
      setCargando(true);

      const [clientesResp, metodosResp, estadosResp, rutasResp] = await Promise.all([
        getClientes(),
        getMetodosPago(),
        getEstadosTicket(),
        apiGet<{ items: { id: number; label: string; value: number }[] }>('/api/rutas-activas'),
      ]);

      const rutasOpts = (rutasResp.items || []).map((r) => ({
        label: r.label,
        value: r.id ?? r.value,
      }));

      setClientes(clientesResp);
      setMetodosPago(metodosResp);
      setEstados(estadosResp);
      setRutas(rutasOpts);
    } catch (err) {
      console.error('❌ Error cargando catálogos:', err);
      setClientes([]);
      setMetodosPago([]);
      setEstados([]);
      setRutas([]);
    } finally {
      setCargando(false);
    }
  };

  // 🚀 Cargar una vez al montar el hook
  useEffect(() => {
    cargarCatalogos();
  }, []);

  return {
    clientes,
    metodosPago,
    estados,
    rutas,
    cargando,
    recargar: cargarCatalogos,
  };
}
