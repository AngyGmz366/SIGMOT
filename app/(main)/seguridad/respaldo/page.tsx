/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

type Respaldo = {
  id: number | string;
  nombre: string;       
  tamano: number;       
  fecha: string;        
  creado_por?: string;  
};

export default function BackupRestorePage() {
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<Respaldo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Respaldo | null>(null);

  // 📌 Cargar datos de ejemplo en lugar de API real
  useEffect(() => {
    const respaldosEjemplo: Respaldo[] = [
      {
        id: 1,
        nombre: 'backup_2025-08-01_0900.sql',
        tamano: 2_048_576, // 2 MB
        fecha: '2025-08-01T09:00:00',
        creado_por: 'Administrador'
      },
      {
        id: 2,
        nombre: 'backup_2025-08-03_1530.sql',
        tamano: 5_242_880, // 5 MB
        fecha: '2025-08-03T15:30:00',
        creado_por: 'Sistema'
      },
      {
        id: 3,
        nombre: 'backup_2025-08-05_2100.sql',
        tamano: 10_485_760, // 10 MB
        fecha: '2025-08-05T21:00:00',
        creado_por: 'Auditor'
      }
    ];
    setData(respaldosEjemplo);
  }, []);

  const crearBackup = () => {
    toast.current?.show({ severity: 'success', summary: 'Respaldo creado', detail: 'Se generó un nuevo respaldo de ejemplo', life: 3000 });
  };

  const restaurarBackup = (b: Respaldo) => {
    confirmDialog({
      message: `¿Restaurar desde "${b.nombre}"? Esto sobrescribirá la base de datos.`,
      header: 'Confirmar restauración',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        toast.current?.show({ severity: 'success', summary: 'Restaurado', detail: `Base de datos restaurada desde ${b.nombre}`, life: 3000 });
      }
    });
  };

  const eliminarBackup = (b: Respaldo) => {
    confirmDialog({
      message: `¿Eliminar "${b.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar respaldo',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setData(prev => prev.filter(item => item.id !== b.id));
        toast.current?.show({ severity: 'info', summary: 'Eliminado', detail: `${b.nombre} eliminado`, life: 2500 });
      }
    });
  };

  const descargarBackup = (b: Respaldo) => {
    toast.current?.show({ severity: 'info', summary: 'Descargando', detail: `Descargando ${b.nombre}...`, life: 2500 });
  };

  const restoreFromUploadClick = () => fileInputRef.current?.click();

  const handleUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.current?.show({ severity: 'success', summary: 'Restaurado', detail: `Restauración desde archivo ${file.name} completada`, life: 3000 });
    e.target.value = '';
  };

  const leftToolbar = (
    <div className="flex gap-2">
      <Button label="Crear respaldo" icon="pi pi-cloud-upload" onClick={crearBackup} />
      <Button label="Subir archivo" icon="pi pi-upload" className="p-button-help" onClick={restoreFromUploadClick} />
      <input ref={fileInputRef} type="file" accept=".sql,.zip,.gz" hidden onChange={handleUploadRestore} />
    </div>
  );

  const accionesBody = (row: Respaldo) => (
    <div className="flex gap-2">
      <Button icon="pi pi-download" className="p-button-rounded p-button-sm" onClick={() => descargarBackup(row)} tooltip="Descargar" />
      <Button icon="pi pi-history" className="p-button-rounded p-button-sm p-button-warning" onClick={() => restaurarBackup(row)} tooltip="Restaurar" />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-sm p-button-danger" onClick={() => eliminarBackup(row)} tooltip="Eliminar" />
    </div>
  );

  const tamanoTemplate = (row: Respaldo) => {
    const kb = row.tamano / 1024;
    const mb = kb / 1024;
    const label = mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
    return <span>{label}</span>;
  };

  const fechaTemplate = (row: Respaldo) => {
    const d = new Date(row.fecha);
    return <span>{d.toLocaleString()}</span>;
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="text-2xl font-bold mb-4">Respaldo y Restauración</h2>

      <Toolbar className="mb-4" left={leftToolbar} />

      <DataTable
        value={data}
        dataKey="id"
        loading={loading}
        paginator
        rows={10}
        responsiveLayout="scroll"
        selectionMode="single"
        onSelectionChange={(e) => setSelected(e.value)}
        selection={selected as any}
        emptyMessage="No hay respaldos disponibles"
      >
        <Column field="nombre" header="Archivo" sortable />
        <Column field="tamano" header="Tamaño" body={tamanoTemplate} sortable />
        <Column field="fecha" header="Fecha" body={fechaTemplate} sortable />
        <Column field="creado_por" header="Creado por" body={(r) => r.creado_por || <Tag value="Sistema" />} />
        <Column header="Acciones" body={accionesBody} style={{ width: '12rem' }} />
      </DataTable>
    </div>
  );
}
