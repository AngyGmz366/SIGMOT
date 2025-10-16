'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import Swal from 'sweetalert2';

export default function Activar2FAPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivar2FA = async () => {
    const idUsuario = localStorage.getItem('idUsuario');

    if (!idUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el ID del usuario en sesión.',
        confirmButtonColor: '#6366F1',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: Number(idUsuario) }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al activar 2FA.');

      setQr(data.qr);
      setSecret(data.secret);

      Swal.fire({
        icon: 'success',
        title: 'Autenticación activada',
        text: 'Escanee el código QR con su app de autenticación.',
        confirmButtonColor: '#6366F1',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo activar la autenticación.',
        confirmButtonColor: '#6366F1',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Card
        title="Activar Autenticación en Dos Pasos (2FA)"
        className="shadow-4 w-full md:w-6 lg:w-4 text-center p-5"
      >
        <p className="text-gray-700 mb-3">
          Protege tu cuenta activando la verificación en dos pasos.
          Escanea el código QR con Google Authenticator o Authy.
        </p>

        {!qr ? (
          <Button
            label={loading ? 'Generando...' : 'Activar 2FA'}
            icon="pi pi-shield"
            className="p-button-rounded p-button-primary mt-3"
            onClick={handleActivar2FA}
            disabled={loading}
          />
        ) : (
          <div className="flex flex-column align-items-center mt-4">
            <img src={qr} alt="Código QR 2FA" style={{ width: '200px', height: '200px' }} />
            <p className="mt-3 font-bold text-lg text-gray-800">Código secreto:</p>
            <code
              style={{
                background: '#f3f4f6',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                color: '#374151',
              }}
            >
              {secret}
            </code>
          </div>
        )}
      </Card>
    </div>
  );
}
