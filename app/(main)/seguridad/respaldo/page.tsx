/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

type BackupItem = { label: string; value: string; fecha: string; tamano: number };

export default function BackupRestoreSIGMOT() {
  const toast = useRef<Toast>(null);

  // Datos de ejemplo para visual
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ejemplos: BackupItem[] = [
      { label: 'SIGMOT-2025-08-08-12-09-23.sql', value: 'SIGMOT-2025-08-08-12-09-23.sql', fecha: '2025-08-08T12:09:23', tamano: 5_242_880 },
      { label: 'SIGMOT-2025-08-05-21-00-00.sql', value: 'SIGMOT-2025-08-05-21-00-00.sql', fecha: '2025-08-05T21:00:00', tamano: 10_485_760 },
      { label: 'SIGMOT-2025-08-01-09-00-00.sql', value: 'SIGMOT-2025-08-01-09-00-00.sql', fecha: '2025-08-01T09:00:00', tamano: 2_097_152 }
    ];
    setBackups(ejemplos);
    setSelectedBackup(ejemplos[0]?.value ?? null);
  }, []);

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
  };

  // —— Acciones (simuladas). Sustituye por fetch a tu API cuando quieras.
  const crearBackup = async () => {
    setLoading(true);
    try {
      // await fetch('/api/backup/create', { method: 'POST' });
      toast.current?.show({ severity: 'success', summary: 'SIGMOT', detail: 'Respaldo generado en el servidor.', life: 2500 });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo generar el respaldo.', life: 3500 });
    } finally {
      setLoading(false);
    }
  };

  const restaurarBackup = () => {
    if (!selectedBackup) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Selecciona un respaldo.', life: 2500 });
      return;
    }

    confirmDialog({
      header: 'Confirmar restauración',
      message: `¿Restaurar el sistema desde "${selectedBackup}"? Esta acción sobrescribirá la base de datos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true);
        try {
          // await fetch('/api/backup/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: selectedBackup }) });
          toast.current?.show({ severity: 'success', summary: 'SIGMOT', detail: 'La base de datos fue restaurada correctamente.', life: 3000 });
        } catch (e: any) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo restaurar el respaldo.', life: 3500 });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const Header = () => (
    <div className="flex align-items-center justify-content-between mb-3">
      <div>
        <h2 className="m-0 text-2xl">SIGMOT · Respaldo y Restauración</h2>
        <small className="text-600">Protege y recupera tus datos del sistema.</small>
      </div>
      <Tag value="Administración" icon="pi pi-shield" severity="info" />
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Header />
      <Divider />

      <div className="grid">
        {/* Card: Crear Respaldo */}
        <div className="col-12 md:col-6">
          <div className="surface-card p-4 border-round shadow-1" style={{ borderTop: '4px solid #0ea5e9' }}>
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-database text-primary" />
              <h3 className="m-0">Crear Respaldo</h3>
            </div>
            <p className="text-600 mb-4">
              Genera una copia de seguridad completa de la base de datos SIGMOT en el servidor.
            </p>

            <Button
              label="Crear respaldo ahora"
              icon="pi pi-cloud-upload"
              className="p-button-primary p-button-lg w-full"
              loading={loading}
              onClick={crearBackup}
            />

            <Divider />

            <h4 className="mt-0">Disponibles en el servidor</h4>
            {backups.length === 0 ? (
              <p className="text-600">No hay respaldos aún.</p>
            ) : (
              <ul className="list-none p-0 m-0">
                {backups.map((b) => (
                  <li key={b.value} className="flex align-items-center justify-content-between py-2">
                    <div className="flex align-items-center gap-2">
                      <span className="pi pi-circle-fill text-500" style={{ fontSize: '0.5rem' }} />
                      <span className="font-medium">{b.label}</span>
                    </div>
                    <small className="text-600">
                      {new Date(b.fecha).toLocaleString()} · {formatSize(b.tamano)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Card: Restaurar Respaldo */}
        <div className="col-12 md:col-6">
          <div className="surface-card p-4 border-round shadow-1" style={{ borderTop: '4px solid #22c55e' }}>
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-history text-green-500" />
              <h3 className="m-0">Restaurar Respaldo</h3>
            </div>
            <p className="text-600 mb-3">
              Selecciona un archivo de respaldo existente para restaurar la base de datos.
            </p>

            <Dropdown
              value={selectedBackup}
              options={backups.map((b) => ({ label: b.label, value: b.value }))}
              onChange={(e) => setSelectedBackup(e.value)}
              placeholder="Selecciona un respaldo"
              className="w-full mb-3"
              showClear
            />

            <Button
              label="Restaurar"
              icon="pi pi-refresh"
              className="p-button-success p-button-lg w-full"
              loading={loading}
              onClick={restaurarBackup}
            />

            <Divider />
            <small className="text-600">
              <i className="pi pi-info-circle mr-2" />
              Esta operación sobreescribe los datos actuales. Asegúrate de tener un respaldo reciente.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
