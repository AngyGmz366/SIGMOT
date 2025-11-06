'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import Swal from 'sweetalert2';

// 🔹 Recupera los datos del usuario autenticado
async function ensureUserData() {
  let id: string = localStorage.getItem('idUsuario') ?? '';
  let correo: string = localStorage.getItem('correoUsuario') ?? '';
  let tipo: string = localStorage.getItem('tipoUsuario') ?? '';

  if (!id || !correo) {
    try {
      const r = await fetch('/api/auth/me', { cache: 'no-store' });
      const d = await r.json();

      if (r.ok && d?.uid) {
        id = String(d.uid);
        correo = d.email ?? '';
        tipo = 'LOCAL';

        localStorage.setItem('idUsuario', id);
        localStorage.setItem('correoUsuario', correo);
        localStorage.setItem('tipoUsuario', tipo);
        console.log('✅ Reconstruido desde cookie:', d);
      }
    } catch (e) {
      console.warn('⚠️ No se pudo reconstruir sesión:', e);
    }
  }

  return { id, tipo, correo };
}

// 🔹 Verifica si ya tiene 2FA activo en BD
async function verificarEstado2FA(id: string) {
  try {
    const res = await fetch(`/api/auth/2fa/estado?id=${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (res.ok && data.ok) {
      return data.enabled === 1;
    }
    return false;
  } catch {
    return false;
  }
}

export default function Activar2FAPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activo, setActivo] = useState(false);

  // 🔸 Al cargar la página, verificar si el usuario ya tiene 2FA activo
  useEffect(() => {
    (async () => {
      const { id } = await ensureUserData();
      if (!id) return;

      const yaActivo = await verificarEstado2FA(id);
      if (yaActivo) {
        setActivo(true);
        Swal.fire({
          icon: 'info',
          title: '2FA ya activado',
          text: 'Este usuario ya tiene autenticación en dos pasos configurada.',
          confirmButtonColor: '#6366F1',
        });
      }
    })();
  }, []);

  // 🔹 Generar QR
  const handleGenerarQR = async () => {
    setLoading(true);
    try {
      const { id } = await ensureUserData();

      // ⚠️ Revalidar antes de generar
      const yaActivo = await verificarEstado2FA(id);
      if (yaActivo) {
        setActivo(true);
        Swal.fire({
          icon: 'info',
          title: '2FA ya activado',
          text: 'No puedes volver a generarlo, ya está configurado.',
          confirmButtonColor: '#6366F1',
        });
        return;
      }

      if (!id) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Faltan datos de sesión del usuario.',
          confirmButtonColor: '#6366F1',
        });
        return;
      }

      console.log('📡 Generando QR para usuario ID:', id);

      // ✅ SOLO ENVIAR idUsuario - el backend hace el resto
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: Number(id)
        }),
      });

      const data = await res.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!res.ok) throw new Error(data.error || 'Error al generar 2FA.');

      // Aceptar tanto 'qr' como 'qrDataUrl' para compatibilidad
      const qrImage = data.qr || data.qrDataUrl;
      
      if (!qrImage) {
        throw new Error('No se recibió el código QR del servidor.');
      }

      setQr(qrImage);
      setSecret(data.secret);

      Swal.fire({
        icon: 'success',
        title: 'QR generado correctamente',
        text: 'Escanea el código QR con Google Authenticator o Authy.',
        confirmButtonColor: '#6366F1',
      });
    } catch (err: any) {
      console.error('❌ Error al generar QR:', err);
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

  // 🔹 Verificar código del autenticador
  const handleVerificarCodigo = async () => {
    if (!codigo || codigo.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debes ingresar un código de 6 dígitos.',
        confirmButtonColor: '#6366F1',
      });
      return;
    }

    setLoading(true);
    try {
      const { id } = await ensureUserData();

      console.log('🔐 Verificando código para usuario ID:', id);

      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idUsuario: Number(id), 
          token: codigo 
        }),
      });

      const data = await res.json();
      console.log('📥 Respuesta de verificación:', data);

      if (!data.ok || !data.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Código incorrecto',
          text: data.error || 'Verifica tu código e inténtalo nuevamente.',
          confirmButtonColor: '#6366F1',
        });
        return;
      }

      setActivo(true);
      setQr(null); // Limpiar el QR después de activar
      setCodigo('');

      Swal.fire({
        icon: 'success',
        title: '2FA Activado',
        text: 'La autenticación en dos pasos se activó correctamente.',
        confirmButtonColor: '#6366F1',
      });
    } catch (err: any) {
      console.error('❌ Error al verificar código:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo verificar el código.',
        confirmButtonColor: '#6366F1',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Desactivar 2FA
  const handleDesactivar = async () => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar 2FA?',
      text: 'Esto eliminará la protección de doble verificación.',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6366F1',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const { id, tipo } = await ensureUserData();

      console.log('🔓 Desactivando 2FA para usuario ID:', id);

      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identificador: id, 
          tipoUsuario: tipo 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al desactivar 2FA.');

      setActivo(false);
      setQr(null);
      setSecret(null);
      setCodigo('');

      Swal.fire({
        icon: 'success',
        title: '2FA Desactivado',
        text: 'La autenticación en dos pasos se ha desactivado correctamente.',
        confirmButtonColor: '#6366F1',
      });
    } catch (err: any) {
      console.error('❌ Error al desactivar 2FA:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo desactivar el 2FA.',
        confirmButtonColor: '#6366F1',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground p-4">
      <Card 
        title="Autenticación en Dos Pasos (2FA)" 
        className="shadow-4 w-full md:w-6 lg:w-4 text-center p-4"
      >
        <p className="text-gray-700 mb-4">
          Protege tu cuenta activando o desactivando la verificación en dos pasos.
        </p>

        {!qr && !activo && (
          <Button
            label={loading ? 'Generando...' : 'Activar 2FA'}
            icon="pi pi-shield"
            className="p-button-rounded p-button-primary mt-3 px-5 py-3"
            onClick={handleGenerarQR}
            disabled={loading}
            loading={loading}
          />
        )}

        {qr && !activo && (
          <div className="flex flex-column align-items-center mt-4">
            <div className="p-3 bg-white border-round shadow-2 mb-3">
              <img 
                src={qr} 
                alt="Código QR 2FA" 
                style={{ width: '200px', height: '200px' }} 
              />
            </div>
            
            <p className="mt-2 font-semibold text-gray-800">Código secreto:</p>
            <code className="bg-gray-100 p-2 border-round text-sm mb-4 text-gray-700">
              {secret}
            </code>

            <small className="text-gray-600 mb-3">
              Escanea el QR con Google Authenticator o ingresa el código manualmente
            </small>

            <div className="w-full mt-3">
              <InputText
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="Código de 6 dígitos"
                className="w-full text-center text-2xl font-bold tracking-widest mb-3"
                maxLength={6}
                keyfilter="int"
                disabled={loading}
              />
              <Button
                label={loading ? 'Verificando...' : 'Verificar código'}
                icon="pi pi-check"
                className="p-button-success w-full"
                onClick={handleVerificarCodigo}
                disabled={loading || codigo.length !== 6}
                loading={loading}
              />
            </div>
          </div>
        )}

        {activo && (
          <div className="flex flex-column align-items-center mt-4">
            <i className="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
            <p className="text-green-600 font-bold text-xl mb-4">
              2FA Activado
            </p>
            <p className="text-gray-600 mb-4">
              Tu cuenta está protegida con autenticación de dos factores
            </p>
            <Button
              label="Desactivar 2FA"
              icon="pi pi-times"
              className="p-button-danger p-button-outlined"
              onClick={handleDesactivar}
              disabled={loading}
            />
          </div>
        )}
      </Card>
    </div>
  );
}