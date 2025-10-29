'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import ListaIncidenciasAdmin from './components/ListaIncidenciasAdmin';
import ResponderModal from './components/ResponderModal';
import axios from 'axios';

export default function AdminIncidenciasPage() {
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<any>(null);
  const toast = useRef<Toast>(null);

  // 🔹 Cargar incidencias desde la API
  const cargarIncidencias = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/incidencias/admin');
      if (res.data.ok) {
        setIncidencias(res.data.data);
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Atención',
          detail: res.data.message || 'No se pudieron cargar las incidencias.',
          life: 3500,
        });
      }
    } catch (error) {
      console.error('❌ Error al obtener incidencias:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al conectar con el servidor.',
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Inicializar al montar
  useEffect(() => {
    cargarIncidencias();
  }, []);

  // 🔹 Abrir modal con la incidencia seleccionada
  const abrirModalResponder = (rowData: any) => {
    console.log('📦 Incidencia seleccionada para responder:', rowData);
    setIncidenciaSeleccionada(rowData);
    setModalVisible(true);
  };

  // 🔹 Cerrar modal y refrescar lista
  const cerrarModal = () => {
    setModalVisible(false);
    setIncidenciaSeleccionada(null);
    cargarIncidencias();
  };

  return (
    <div className="p-4">
      {/* 🔹 Toast SIGMOT */}
      <Toast ref={toast} position="top-right" />

      {/* 🔹 Card principal */}
      <Card
        title="Gestión de Incidencias y Soporte Técnico"
        className="shadow-2 border-round-lg p-3"
      >
        {loading ? (
          <div
            className="flex justify-content-center align-items-center"
            style={{ minHeight: '220px' }}
          >
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : incidencias.length > 0 ? (
          <ListaIncidenciasAdmin
            incidencias={incidencias}
            onResponder={abrirModalResponder}
          />
        ) : (
          <div className="text-center text-gray-500 p-4">
            <i className="pi pi-info-circle text-2xl mb-3 text-gray-400"></i>
            <p>No hay incidencias registradas.</p>
          </div>
        )}
      </Card>

      {/* 🔹 Modal de respuesta */}
      <ResponderModal
        visible={modalVisible}
        onHide={cerrarModal}
        incidenciaSeleccionada={incidenciaSeleccionada}
        recargarIncidencias={cargarIncidencias}
        idAdmin={1} // ⚙️ Puedes reemplazar por el admin logueado
      />
    </div>
  );
}
