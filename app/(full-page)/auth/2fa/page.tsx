'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

export default function Page2FA() {
  const router = useRouter();
  const params = useSearchParams();
  const idUsuario = Number(params.get('id'));
  const correo = params.get('email') || '';
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleVerificar = async () => {
    if (!codigo.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Ingresa el código recibido', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario, codigo }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        toast.current?.show({ severity: 'success', summary: 'Correcto', detail: 'Código verificado', life: 2000 });
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error || 'Código inválido o expirado', life: 4000 });
      }
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo verificar el código', life: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario, correo }),
      });
      if (res.ok) {
        toast.current?.show({ severity: 'info', summary: 'Enviado', detail: 'Nuevo código reenviado', life: 4000 });
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo reenviar el código', life: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <Toast ref={toast} />
      <div className="surface-card p-5 shadow-2 border-round w-full sm:w-25rem">
        <h2 className="text-center mb-3">Verificación en dos pasos</h2>
        <p className="text-center text-sm mb-4">
          Se ha enviado un código de verificación al correo:
          <br />
          <strong>{correo}</strong>
        </p>

        <InputText
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          maxLength={6}
          className="text-center text-lg tracking-widest w-full mb-3"
          placeholder="Código 6 dígitos"
        />

        <div className="flex justify-content-between">
          <Button label="Reenviar código" icon="pi pi-refresh" text onClick={handleReenviar} disabled={loading} />
          <Button label="Verificar" icon="pi pi-check" onClick={handleVerificar} loading={loading} />
        </div>
      </div>
    </div>
  );
}

