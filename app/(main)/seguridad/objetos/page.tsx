'use client';

import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

type Objeto = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  creadoPor: string;
  fechaCreacion: string;
  modificadoPor: string;
  fechaModificacion: string;
  moduloPadre: string;
};

export default function ObjetosPage() {
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [detalle, setDetalle] = useState<Objeto | null>(null);
  const toast = useRef<Toast>(null);

  // 🔹 Cargar objetos desde el backend
  useEffect(() => {
    const cargarObjetos = async () => {
      try {
        const res = await fetch('/api/seguridad/objetos');
        const data = await res.json();

        if (!data.ok) throw new Error(data.error || 'Error al cargar objetos');
        setObjetos(data.items);
      } catch (err: any) {
        console.error('❌ Error al cargar objetos:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudieron obtener los datos.',
          life: 4000,
        });
      }
    };

    cargarObjetos();
  }, []);

  // 🔹 Mostrar detalles del objeto en el modal
  const verDetalle = (objeto: Objeto) => {
    setDetalle(objeto);
  };

  // 🔹 Asignar colores a tipos de objetos
  const tipoTemplate = (rowData: Objeto) => {
    return rowData.tipo === 'MÓDULO' ? (
      <Tag value={rowData.tipo} severity="success" />
    ) : (
      <Tag value={rowData.tipo} severity="info" />
    );
  };

  // 🔹 Render principal
  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold mb-4">Objetos del Sistema</h2>

      {/* Tabla de objetos */}
      <DataTable value={objetos} paginator rows={10} responsiveLayout="scroll" emptyMessage="No se encontraron objetos.">
        <Column field="id" header="ID" sortable style={{ width: '80px' }} />
        <Column field="nombre" header="Nombre" sortable />
        <Column field="descripcion" header="Descripción" />
        <Column field="tipo" header="Tipo" body={tipoTemplate} sortable />
        <Column header="Acciones" body={(objeto: Objeto) => (
          <Button label="Ver Detalle" icon="pi pi-eye" text onClick={() => verDetalle(objeto)} />
        )} />
      </DataTable>

      {/* Modal con detalle */}
      <Dialog visible={!!detalle} onHide={() => setDetalle(null)} header="Detalle de Objeto" style={{ width: '500px' }}>
        {detalle && (
          <div className="p-3">
            <p><b>Nombre:</b> {detalle.nombre}</p>
            <p><b>Descripción:</b> {detalle.descripcion}</p>
            <p><b>Tipo:</b> {detalle.tipo}</p>
            <p><b>Creado por:</b> {detalle.creadoPor}</p>
            <p><b>Fecha de Creación:</b> {detalle.fechaCreacion}</p>
          
            <p><b>Módulo Padre:</b> {detalle.moduloPadre}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
