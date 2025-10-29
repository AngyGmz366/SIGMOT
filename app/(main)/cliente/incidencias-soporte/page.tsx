'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import './styles/incidencias.css';

type Incidencia = {
  Id_Incidencia: number;
  Tipo_Incidencia: string;
  Estado_Actual: string;
  Asunto: string;
  Descripcion: string;
  Fecha_Creacion: string;
  Respuesta_Admin?: string | null;
};

export default function PageIncidenciasSop() {
  const toast = useRef<Toast>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [tipo, setTipo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const idUsuario =
    typeof window !== 'undefined' ? localStorage.getItem('idUsuario') : null;

  const tiposIncidencia = [
    { label: 'QUEJA', value: 'QUEJA' },
    { label: 'SUGERENCIA', value: 'SUGERENCIA' },
    { label: 'SOPORTE_TECNICO', value: 'SOPORTE_TECNICO' },
  ];

  // 🔹 Obtener incidencias del usuario
  const cargarIncidencias = async () => {
    if (!idUsuario) return;
    try {
      const res = await axios.get(`/api/incidencias?idUsuario=${idUsuario}`);
      if (res.data?.ok) setIncidencias(res.data.data);
    } catch (err) {
      console.error('Error al cargar incidencias:', err);
    }
  };

  // 🔁 Actualiza automáticamente cada 10 segundos
  useEffect(() => {
    cargarIncidencias();
    const interval = setInterval(() => {
      cargarIncidencias();
    }, 10000); // 10s
    return () => clearInterval(interval);
  }, []);

  // 🔹 Mostrar toast elegante
  const mostrarToast = (
    tipo: 'success' | 'error' | 'warn',
    titulo: string,
    mensaje: string
  ) => {
    toast.current?.show({
      severity: tipo,
      summary: titulo,
      detail: mensaje,
      life: 3500,
    });
  };

  // 🔹 Enviar incidencia
  const enviarIncidencia = async () => {
    if (!idUsuario || !tipo || !asunto.trim() || !descripcion.trim()) {
      mostrarToast(
        'warn',
        'Datos incompletos',
        'Debes llenar todos los campos antes de enviar.'
      );
      return;
    }

    try {
      setLoading(true);

      const body = {
        idUsuario: Number(idUsuario),
        tipo,
        asunto,
        descripcion,
      };

      const res = await axios.post('/api/incidencias', body);

      if (res.data?.ok) {
        mostrarToast('success', 'Éxito', 'Incidencia enviada correctamente.');
        setTipo('');
        setAsunto('');
        setDescripcion('');
        await cargarIncidencias();
      } else {
        mostrarToast('error', 'Error', 'No se pudo registrar la incidencia.');
      }
    } catch (error) {
      mostrarToast('error', 'Error', 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

const estadoTemplate = (rowData: Incidencia) => {
  // Si tu backend devuelve 'Estado' en lugar de 'Estado_Actual', ajustamos esto:
  const estado =
    (rowData.Estado_Actual || (rowData as any).Estado || '').toUpperCase();

  let color: any = 'info';
  let etiqueta = estado;

  switch (estado) {
    case 'ABIERTO':
      color = 'info';
      etiqueta = 'ABIERTO';
      break;
    case 'EN_PROCESO':
      color = 'warning';
      etiqueta = 'EN PROCESO';
      break;
    case 'CERRADO':
      color = 'success';
      etiqueta = 'CERRADO';
      break;
    case 'CANCELADO':
      color = 'danger';
      etiqueta = 'CANCELADO';
      break;
    default:
      etiqueta = 'DESCONOCIDO';
      color = 'secondary';
      break;
  }

  return (
    <div className="flex align-items-center gap-2">
      <Tag value={etiqueta} severity={color} />
    </div>
  );
};


  // 🔹 Banner informativo si alguna incidencia está cerrada
  const hayCerradas = incidencias.some(
    (i) => i.Estado_Actual?.toUpperCase() === 'CERRADO'
  );

  return (
    <div className="p-4">
      <Toast ref={toast} position="top-right" className="custom-toast" />

      <h2 className="titulo-modulo mb-4">Incidencias y Soporte</h2>

      {/* 🟣 Banner de incidencias cerradas */}
      {hayCerradas && (
        <div className="banner-resuelto mb-3">
          ✅ Una o más incidencias fueron resueltas por el equipo de soporte.
        </div>
      )}

      {/* 🟣 Formulario */}
      <Card className="form-card mb-5">
        <div className="grid formgrid p-fluid gap-4">
          <div className="field col-12 md:col-3">
            <label htmlFor="tipo" className="font-medium">
              Tipo de incidencia
            </label>
            <Dropdown
              id="tipo"
              value={tipo}
              options={tiposIncidencia}
              onChange={(e) => setTipo(e.value)}
              placeholder="Seleccione"
              className="w-full"
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="asunto" className="font-medium">
              Asunto
            </label>
            <input
              id="asunto"
              className="p-inputtext p-component w-full"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Breve título del problema"
            />
          </div>

          <div className="field col-12 md:col-5">
            <label htmlFor="descripcion" className="font-medium">
              Descripción
            </label>
            <InputTextarea
              id="descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema o sugerencia..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Button
            label={loading ? 'Enviando...' : 'Enviar incidencia'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
            className="btn-incidencia"
            onClick={enviarIncidencia}
            disabled={loading}
          />
        </div>
      </Card>

      {/* 📋 Tabla de incidencias */}
      <Card title="Mis incidencias" className="shadow-2 border-round-xl">
        <DataTable
          value={incidencias}
          paginator
          rows={5}
          className="datatable-responsive table-incidencias"
          emptyMessage="No tienes incidencias registradas."
        >
          <Column field="Id_Incidencia" header="#" style={{ width: '60px' }} />
          <Column field="Tipo_Incidencia" header="Tipo" />
          <Column field="Asunto" header="Asunto" />
          <Column field="Descripcion" header="Descripción" />
          <Column field="Estado_Actual" header="Estado" body={estadoTemplate} />
          <Column field="Fecha_Creacion" header="Fecha de creación" />
        </DataTable>
      </Card>
    </div>
  );
}
