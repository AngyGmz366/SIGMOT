'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

type BackupItem = {
  label: string;
  value: string;
  fecha: string;
  tamano: number;
};

export default function BackupRestoreSIGMOT() {
  const toast = useRef<Toast>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Obtener los respaldos disponibles desde la API o el servidor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchBackups = async () => {
      try {
        const response = await fetch('/api/seguridad//respaldos');  // Suponiendo que tienes un endpoint para obtener los respaldos disponibles
        const data = await response.json();
        setBackups(data.backups);  // Se espera que la API devuelva una lista de respaldos
        setSelectedBackup(data.backups[0]?.value ?? null);  // Selecciona el primer respaldo por defecto
      } catch (error) {
        console.error('Error al cargar los respaldos:', error);
      }
    };

    fetchBackups();
  }, []);

  const formatFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString();
    } catch {
      return fecha;
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Crear el respaldo
  const crearBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seguridad//respaldos/crear', { method: 'POST' });
      const data = await response.json();

      toast.current?.show({
        severity: 'success',
        summary: 'SIGMOT',
        detail: 'Respaldo generado en el servidor.',
        life: 2500,
      });

      // Re-cargar los respaldos después de crear uno nuevo
      setBackups((prevBackups) => [...prevBackups, data.newBackup]);
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

  // Restaurar el respaldo seleccionado
  const restaurarBackup = () => {
    if (!selectedBackup) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Selecciona un respaldo.',
        life: 2500,
      });
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
          const response = await fetch('/api/seguridad/respaldos/restaurar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archivo: selectedBackup }),
          });
          const data = await response.json();

          toast.current?.show({
            severity: 'success',
            summary: 'SIGMOT',
            detail: 'La base de datos fue restaurada correctamente.',
            life: 3000,
          });
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
        {/* CREAR RESPALDO */}
        <div className="col-12 md:col-6">
          <div
            className="surface-card p-4 border-round shadow-1"
            style={{ borderTop: '4px solid #0ea5e9' }}
          >
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
                  <li
                    key={b.value}
                    className="flex align-items-center justify-content-between py-2"
                  >
                    <div className="flex align-items-center gap-2">
                      <span
                        className="pi pi-circle-fill text-500"
                        style={{ fontSize: '0.5rem' }}
                      />
                      <span className="font-medium">{b.label}</span>
                    </div>
                    <small className="text-600">
                      {formatFecha(b.fecha)} · {formatSize(b.tamano)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RESTAURAR RESPALDO */}
        <div className="col-12 md:col-6">
          <div
            className="surface-card p-4 border-round shadow-1"
            style={{ borderTop: '4px solid #22c55e' }}
          >
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
