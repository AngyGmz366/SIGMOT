'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2';

export default function Page2FA() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // ✅ Reconstruir sesión si localStorage está vacío
  useEffect(() => {
    (async () => {
      const id = localStorage.getItem('idUsuario');
      if (!id) {
        try {
          const r = await fetch('/api/auth/me', { cache: 'no-store' });
          const d = await r.json();
          if (r.ok && d?.uid) {
            localStorage.setItem('idUsuario', String(d.uid));
            localStorage.setItem('correoUsuario', d.email || '');
            localStorage.setItem('tipoUsuario', 'LOCAL');
          }
        } catch (e) {
          console.error('Error reconstruyendo sesión:', e);
        }
      }
    })();
  }, []);

  const handleVerificar = async () => {
    if (!codigo.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa el código de 6 dígitos',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const idUsuario = localStorage.getItem('idUsuario');
      const correo = localStorage.getItem('correoUsuario') || '';
      const tipoUsuario =
        (localStorage.getItem('tipoUsuario') || localStorage.getItem('authType') || 'LOCAL').toUpperCase();

      if (!idUsuario) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Faltan datos de sesión del usuario. Inicia sesión nuevamente.',
          confirmButtonColor: '#6366F1',
        }).then(() => router.push('/auth/login'));
        return;
      }

      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: Number(idUsuario), token: codigo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto o expirado.');

      toast.current?.show({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Código verificado correctamente.',
        life: 2000,
      });

      localStorage.clear();
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo verificar el código',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground px-3 py-5">
      <Toast ref={toast} />

      <Card className="shadow-4 w-full sm:w-8 md:w-5 lg:w-3 p-5 border-round-2xl text-center animate-fadein">
        <div className="flex flex-column align-items-center mb-3">
          <img
            src="/demo/images/login/LOGO-SIGMOT.png"
            alt="SIGMOT"
            className="w-8rem mb-2"
          />
          <h2 className="text-2xl font-bold text-900 mb-2">
            Verificación de Seguridad
          </h2>
          <p className="text-gray-600 text-sm">
            Ingresa el código de 6 dígitos generado por tu app de autenticación.
          </p>
        </div>

        <div className="flex flex-column gap-3 mt-4">
          <InputText
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={6}
            keyfilter="int"
            className="text-center text-2xl font-semibold tracking-widest w-full py-3"
            placeholder="000000"
            disabled={loading}
          />

          <Button
            label={loading ? 'Verificando...' : 'Verificar código'}
            icon="pi pi-check"
            className="p-button-rounded p-button-primary w-full"
            onClick={handleVerificar}
            disabled={loading}
          />

          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-rounded p-button-outlined w-full text-indigo-500 border-indigo-400 hover:bg-indigo-50"
            onClick={() => router.push('/auth/login')}
            disabled={loading}
          />
        </div>
      </Card>
    </div>
  );
}
