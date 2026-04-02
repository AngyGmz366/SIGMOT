/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, useContext } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Setup2FAPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { layoutConfig } = useContext(LayoutContext);

  const containerClassName = classNames(
    'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
    { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
  );

  // 🔹 Obtener ID del usuario logueado
  const idUsuario =
    typeof window !== 'undefined' ? localStorage.getItem('idUsuario') || '0' : '0';

  // 🔹 Al montar, generar el QR
  useEffect(() => {
    const activar2FA = async () => {

      if (!idUsuario || idUsuario === '0') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#6366f1',
        }).then(() => router.push('/auth/login'));
        return;
      }

      try {
        // ✅ SOLO ENVIAR idUsuario - el backend hará el resto
        const requestBody = { 
          idUsuario: Number(idUsuario)
        };

        const res = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        
        const data = await res.json();
        if (res.ok && data.qr) {
          setQr(data.qr);
          setSecret(data.secret);
        } else {
          console.error('❌ Error en la respuesta:', data);
          
          Swal.fire({
            icon: 'error',
            title: 'Error al generar 2FA',
            html: `<p>${data.error || 'No se pudo activar el 2FA'}</p>`,
            confirmButtonColor: '#6366f1',
          });
        }
      } catch (e: any) {
        console.error('💥 Excepción capturada:', e);
        
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Verifica tu conexión.',
          confirmButtonColor: '#6366f1',
        });
      }
    };

    if (idUsuario && idUsuario !== '0') {
      activar2FA();
    }
  }, [idUsuario, router]);

  // 🔹 Verificar el código introducido
  const handleVerify = async () => {
    if (!token.trim() || token.length !== 6) {
      Swal.fire('Atención', 'Debe ingresar los 6 dígitos del código', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: Number(idUsuario), token }),
      });
      const data = await res.json();

      if (data.valid || data.ok) {
        Swal.fire({
          icon: 'success',
          title: '2FA activado correctamente',
          text: 'Tu autenticación en dos pasos ha sido configurada con éxito.',
          confirmButtonColor: '#6366f1',
        }).then(() => router.push('/dashboard'));
      } else {
        Swal.fire('Código incorrecto', 'Verifica el código ingresado', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No se pudo verificar el código', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: '40px',
            padding: '0.2rem',
            background: 'linear-gradient(to bottom, #6366f1 5%, transparent 10%)',
          }}
        >
          <div
            className="py-6 px-4 sm:px-6"
            style={{
              borderRadius: '40px',
              backgroundColor: '#ffffff',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            <div className="text-center mb-4">
              <img
                src="/demo/images/login/LOGO-SIGMOT.png"
                alt="Logo SIGMOT"
                className="mb-3 w-5rem h-auto"
              />
              <div className="text-900 text-2xl font-semibold mb-2">
                Activar autenticación en dos pasos
              </div>
              <p className="text-sm text-gray-600">
                Escanea este código QR en tu app (Google Authenticator o Authy)
                y luego ingresa el código de 6 dígitos generado.
              </p>
            </div>

            {qr ? (
              <div className="flex flex-column align-items-center mb-4">
                <img src={qr} alt="QR 2FA" className="mb-3" style={{ width: '180px' }} />
                <small className="text-gray-500">Código secreto: {secret}</small>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-500 mb-3"></i>
                <p className="text-gray-500">Generando código QR...</p>
              </div>
            )}

            <InputText
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              placeholder="Ingrese su código de 6 dígitos"
              className="w-full text-center mb-3"
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.5rem',
                backgroundColor: '#f1f5f9',
              }}
            />

            <Button
              label={loading ? 'Verificando...' : 'Confirmar código'}
              icon="pi pi-check"
              className="w-full mb-3"
              style={{ padding: '1rem', fontWeight: 'bold' }}
              onClick={handleVerify}
              disabled={loading || !qr}
            />

            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="w-full p-button-text text-blue-600"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}