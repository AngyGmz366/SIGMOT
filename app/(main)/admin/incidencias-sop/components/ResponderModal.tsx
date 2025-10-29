'use client';

import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import axios from 'axios';

interface Props {
  visible: boolean;
  onHide: () => void;
  incidenciaSeleccionada: any;
  recargarIncidencias: () => void;
  idAdmin?: number; // opcional si quieres pasar el admin logueado
}

export default function ResponderModal({
  visible,
  onHide,
  incidenciaSeleccionada,
  recargarIncidencias,
  idAdmin = 1,
}: Props) {
  const [mensaje, setMensaje] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const toast = useRef<Toast>(null);

  // Manejo de carga de archivos
  const handleFileUpload = (event: FileUploadSelectEvent) => {
    setArchivos(event.files);
  };

  // Envío de respuesta
  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes escribir un mensaje antes de enviar.',
        life: 3500,
      });
      return;
    }

    const correoCliente = incidenciaSeleccionada?.Usuario || '';

    if (!correoCliente) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Falta información',
        detail: 'No se encontró el correo del cliente asociado a la incidencia.',
        life: 3500,
      });
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append('mensaje', mensaje);
      formData.append('correoCliente', correoCliente);
      formData.append('idAdmin', String(idAdmin));

      archivos.forEach((file) => {
        formData.append('archivos', file);
      });

      const res = await axios.post(
        `/api/incidencias/${incidenciaSeleccionada.Id_Incidencia}/responder`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Correo enviado y estado actualizado correctamente.',
          life: 4000,
        });

        // Limpiar formulario y recargar tabla
        setMensaje('');
        setArchivos([]);
        onHide();
        recargarIncidencias();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: res.data.message || 'No se pudo enviar el correo.',
          life: 4000,
        });
      }
    } catch (error: any) {
      console.error('❌ Error al enviar:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar con el servidor.',
        life: 4000,
      });
    } finally {
      setEnviando(false);
    }
  };

  // Footer con botones
  const footer = (
    <div className="flex justify-content-end gap-3">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
        disabled={enviando}
      />
      <Button
        label={enviando ? 'Enviando...' : 'Enviar'}
        icon="pi pi-send"
        className="p-button-rounded p-button-primary"
        onClick={handleEnviar}
        disabled={enviando}
      />
    </div>
  );

  return (
    <>
      {/* ✅ Toast SIGMOT estilo verde o morado */}
      <Toast ref={toast} position="top-right" />

      {/* 📨 Modal de respuesta */}
      <Dialog
        header="Responder incidencia"
        visible={visible}
        style={{ width: '40vw', minWidth: '400px' }}
        modal
        onHide={onHide}
        footer={footer}
      >
        <p>
          <strong>Asunto:</strong> {incidenciaSeleccionada?.Asunto || '—'}
        </p>
        <p>
          <strong>Descripción:</strong> {incidenciaSeleccionada?.Descripcion || '—'}
        </p>

        {/* Campo mensaje */}
        <div className="mt-3">
          <label htmlFor="mensaje" className="block mb-2 font-medium">
            Escribe la respuesta que se enviará al cliente:
          </label>
          <InputTextarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            placeholder="Ejemplo: Estimado usuario, su incidencia ha sido revisada..."
            className="w-full"
          />
        </div>

        {/* Subida de archivos */}
        <div className="mt-4">
          <label className="block mb-2 font-medium">Adjuntar archivos (opcional):</label>
          <FileUpload
            name="archivos"
            customUpload
            mode="basic"
            accept=".pdf,image/*,video/*"
            multiple
            chooseLabel="Seleccionar archivos"
            maxFileSize={10 * 1024 * 1024}
            onSelect={handleFileUpload}
            auto={false}
          />
          {archivos.length > 0 && (
            <small className="text-green-600 mt-2 block">
              {archivos.length} archivo(s) seleccionado(s)
            </small>
          )}
        </div>
      </Dialog>
    </>
  );
}
