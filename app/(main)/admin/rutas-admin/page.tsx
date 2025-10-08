'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import RutasAdminTable, { RutaUI } from './components/RutasAdminTable';
import FormularioRuta from './components/FormularioRuta';
import MapaInteractivo from '@/app/(main)/cliente/rutas/components/MapaInteractivo';

import {
  getRutas as apiGetRutas,
  crearRuta as apiCrearRuta,
  actualizarRuta as apiActualizarRuta,
  cambiarEstadoRuta as apiCambiarEstadoRuta
} from '@/lib/rutas';

const PageAdminRutas: React.FC = () => {
  const [rutas, setRutas] = useState<RutaUI[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaUI | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const showOk = (detail: string) =>
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail, life: 3000 });
  const showErr = (detail: string) =>
    toast.current?.show({ severity: 'error', summary: 'Error', detail, life: 4000 });

  const apiToUi = (r: any): RutaUI => ({
    id: r.Id_Ruta_PK,
    origen: r.Origen,
    destino: r.Destino,
    estado: r.Estado === 'ACTIVA' ? 'activo' : 'inactivo',
    tiempoEstimado: r.Tiempo_Estimado ?? null,
    distancia: r.Distancia ?? null,
    descripcion: r.Descripcion ?? null
  });

  const cargarRutas = async () => {
    try {
      setLoading(true);
      const data = await apiGetRutas(); // devuelve RutaApi[]
      setRutas(data.map(apiToUi));
    } catch (e: any) {
      showErr(e?.message || 'No se pudo cargar rutas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  const abrirCrear = () => {
    setRutaSeleccionada({
      id: 0,
      origen: '',
      destino: '',
      estado: 'activo',
      tiempoEstimado: '03:40:00',
      distancia: null,
      descripcion: null
    });
    setMostrarModal(true);
  };

  const abrirEditar = (r: RutaUI) => {
    setRutaSeleccionada(r);
    setMostrarModal(true);
  };

  const onGuardar = async (val: RutaUI) => {
  try {
    setLoading(true);
    if (!val.origen || !val.destino) {
      showErr('Origen y destino son obligatorios');
      return;
    }

    if (!rutaSeleccionada || rutaSeleccionada.id === 0) {
      // CREAR
      await apiCrearRuta({
        origen: val.origen.trim(),
        destino: val.destino.trim(),
        estado: val.estado === 'activo' ? 'ACTIVA' as const : 'INACTIVA' as const,
        tiempo_estimado: val.tiempoEstimado ?? null,
        distancia: val.distancia ?? null,
        descripcion: val.descripcion ?? null,
      });
      showOk('Ruta creada');
    } else {
      // ACTUALIZAR
      await apiActualizarRuta(rutaSeleccionada.id, {
        origen: val.origen.trim(),
        destino: val.destino.trim(),
        estado: val.estado === 'activo' ? 'ACTIVA' as const : 'INACTIVA' as const,
        tiempo_estimado: val.tiempoEstimado ?? null,
        distancia: val.distancia ?? null,
        descripcion: val.descripcion ?? null,
      });
      showOk('Ruta actualizada');
    }

    setMostrarModal(false);
    setRutaSeleccionada(null);
    await cargarRutas();
  } catch (e: any) {
    showErr(e?.message || 'No se pudo guardar');
  } finally {
    setLoading(false);
  }
};


  const eliminarRuta = (id: number) => {
    confirmDialog({
      message: '¿Deseas inactivar esta ruta? (no se elimina físicamente)',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        try {
          setLoading(true);
          await apiCambiarEstadoRuta(id, 'INACTIVA');
          showOk('Ruta inactivada');
          await cargarRutas();
        } catch (e: any) {
          showErr(e?.message || 'No se pudo inactivar');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const cambiarEstado = async (id: number, nuevoEstado: 'activo' | 'inactivo') => {
    try {
      setLoading(true);
      await apiCambiarEstadoRuta(id, nuevoEstado === 'activo' ? 'ACTIVA' : 'INACTIVA');
      showOk('Estado actualizado');
      await cargarRutas();
    } catch (e: any) {
      showErr(e?.message || 'No se pudo cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const cerrarFormulario = () => {
    setMostrarModal(false);
    setRutaSeleccionada(null);
  };

  return (
    <div className="p-4 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Rutas</h2>
        <Button label="Nueva Ruta" icon="pi pi-plus" className="btn-verde" onClick={abrirCrear} />
      </div>

      <Card>
        <RutasAdminTable
          rutas={rutas}
          loading={loading}
          onEditarRuta={abrirEditar}
          onEliminarRuta={eliminarRuta}
          onCambiarEstado={cambiarEstado}
        />
      </Card>

      <Dialog
        header={rutaSeleccionada && rutaSeleccionada.id !== 0 ? 'Editar Ruta' : 'Nueva Ruta'}
        visible={mostrarModal}
        onHide={cerrarFormulario}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '640px': '100vw' }}
        modal
      >
        <FormularioRuta
          ruta={rutaSeleccionada}
          onCerrar={cerrarFormulario}
          onGuardar={onGuardar}
          loading={loading}
        />

        {rutaSeleccionada && rutaSeleccionada.id !== 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Vista previa en el mapa</h3>
            {/* Si MapaInteractivo espera otra forma, adapta aquí */}
            <MapaInteractivo key={`map-${rutaSeleccionada.id}`} ruta={rutaSeleccionada as any} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PageAdminRutas;
