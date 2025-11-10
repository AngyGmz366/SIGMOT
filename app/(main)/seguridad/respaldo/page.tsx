'use client';

import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

export default function BackupRestoreSIGMOT() {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const [loading, setLoading] = useState(false);

  // Crear y descargar el respaldo
  const crearBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seguridad/respaldos/crear', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detalles || 'Error al crear backup');
      }

      // Obtener el archivo como blob
      const blob = await response.blob();

      // Extraer nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `SIGMOT_${new Date().toISOString().replace(/:/g, '-')}.sql`;

      // Crear link de descarga temporal
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.current?.show({
        severity: 'success',
        summary: 'SIGMOT',
        detail: 'Respaldo descargado exitosamente',
        life: 2500,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.message || 'No se pudo generar el respaldo.',
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Restaurar desde archivo subido
  const restaurarBackup = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];

    if (!file) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Selecciona un archivo',
        life: 2500,
      });
      return;
    }

    confirmDialog({
      header: 'Confirmar restauración',
      message: `¿Restaurar el sistema desde "${file.name}"? Esta acción sobrescribirá la base de datos actual.`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, restaurar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/seguridad/respaldos/restaurar', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detalles || 'Error al restaurar');
          }

          toast.current?.show({
            severity: 'success',
            summary: 'SIGMOT',
            detail: 'La base de datos fue restaurada correctamente.',
            life: 3000,
          });

          // Limpiar el componente de subida
          fileUploadRef.current?.clear();
        } catch (err: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err?.message || 'No se pudo restaurar el respaldo.',
            life: 3500,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

 const Header = () => (
  <div className="mb-3">
    <div className="flex align-items-start justify-content-between gap-2">
      <div className="flex-1">
        <h2 className="m-0 text-xl md:text-2xl">SIGMOT-Respaldo y Restauración</h2>
        <small className="text-600">
          Protege y recupera tus datos del sistema.
        </small>
      </div>
      <Tag 
        value="Administración" 
        icon="pi pi-shield" 
        severity="info"
        className="flex-shrink-0"
      />
    </div>
  </div>
);
  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Header />
      <Divider />

      <div className="grid">
        {/* CREAR Y DESCARGAR RESPALDO */}
        <div className="col-12 md:col-6">
          <div
            className="surface-card p-4 border-round shadow-1"
            style={{ borderTop: '4px solid #0ea5e9' }}
          >
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-download text-primary" />
              <h3 className="m-0">Descargar Respaldo</h3>
            </div>
            <p className="text-600 mb-4">
              Genera y descarga una copia de seguridad completa de la base de
              datos SIGMOT. El archivo se descargará directamente a tu
              computadora.
            </p>

            <Button
              label="Crear y descargar respaldo"
              icon="pi pi-cloud-download"
              className="p-button-primary p-button-lg w-full"
              loading={loading}
              onClick={crearBackup}
            />

            <Divider />

            <div className="flex align-items-start gap-2 text-600">
              <i className="pi pi-info-circle mt-1" />
              <small>
                El archivo SQL se descargará a tu carpeta de descargas. Guárdalo
                en un lugar seguro como respaldo.
              </small>
            </div>
          </div>
        </div>

        {/* RESTAURAR RESPALDO */}
        <div className="col-12 md:col-6">
          <div
            className="surface-card p-4 border-round shadow-1"
            style={{ borderTop: '4px solid #22c55e' }}
          >
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-upload text-green-500" />
              <h3 className="m-0">Restaurar Respaldo</h3>
            </div>
            <p className="text-600 mb-3">
              Selecciona un archivo de respaldo (.sql) desde tu computadora para
              restaurar la base de datos.
            </p>

            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              name="backup"
              accept=".sql"
              maxFileSize={100000000}
              customUpload
              uploadHandler={restaurarBackup}
              chooseOptions={{
                label: 'Seleccionar archivo .sql',
                icon: 'pi pi-upload',
                className: 'p-button-success w-full p-button-lg'
              }}
              disabled={loading}
              auto
            />

            <Divider />

            <div className="surface-100 p-3 border-round">
              <div className="flex align-items-start gap-2 text-600">
                <i className="pi pi-exclamation-triangle text-orange-500 mt-1" />
                <small>
                  <strong>Advertencia:</strong> Esta operación sobrescribe los
                  datos actuales. Asegúrate de tener un respaldo reciente antes
                  de restaurar.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}