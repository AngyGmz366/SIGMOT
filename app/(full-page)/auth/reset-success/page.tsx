/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import api from '@/lib/axios';

const ResetPasswordPage: React.FC = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  const params = useSearchParams();
  const toast = useRef<Toast>(null);

  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerClassName = classNames(
    'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
    { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
  );

  const contrasenasCoinciden = confirmar.length > 0 && password === confirmar;
  const contrasenasNoCoinciden = confirmar.length > 0 && password !== confirmar;

  const actualizarContrasena = async () => {
    if (!token) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El enlace de restablecimiento no es válido o ha expirado.',
      });
      return;
    }

    if (!password || !confirmar) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes llenar ambos campos.',
      });
      return;
    }

    if (password !== confirmar) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Las contraseñas no coinciden.',
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/api/auth/reset-password', {
        token,
        password,
      });

      if (!res.data.ok) {
        throw new Error(res.data.error || 'No se pudo actualizar la contraseña.');
      }

      setExito(true);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tu contraseña fue actualizada correctamente.',
        life: 4000,
      });
    } catch (err: any) {
      console.error('🔥 Error en actualizarContrasena:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.',
        life: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      <Toast ref={toast} />
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: '40px',
            padding: '0.2rem',
            background: 'linear-gradient(to bottom, #004aad 5%, transparent 10%)',
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
                alt="Logo SAENZ"
                className="mb-3 w-2 h-auto mx-auto"
              />
            </div>

            {!exito ? (
              <>
                <div className="text-900 text-2xl font-medium mb-2">
                  Restablecer Contraseña
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Ingresa tu nueva contraseña para tu cuenta.
                </p>

                <label
                  htmlFor="password"
                  className="block text-900 text-base font-medium mb-2"
                >
                  Nueva contraseña
                </label>

                <Password
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  toggleMask
                  feedback={true}
                  promptLabel="Ingresa una contraseña"
                  weakLabel="Débil"
                  mediumLabel="Media"
                  strongLabel="Fuerte"
                  className="w-full mb-3"
                  inputStyle={{ backgroundColor: '#f1f5f9' }}
                />

                <label
                  htmlFor="confirmar"
                  className="block text-900 text-base font-medium mb-2"
                >
                  Confirmar contraseña
                </label>

                <Password
                  id="confirmar"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  toggleMask
                  feedback={false}
                  className="w-full mb-2"
                  inputStyle={{ backgroundColor: '#f1f5f9' }}
                />

                {contrasenasNoCoinciden && (
                  <small style={{ color: '#dc2626', display: 'block', marginBottom: '1rem' }}>
                    Las contraseñas no coinciden.
                  </small>
                )}

                {contrasenasCoinciden && (
                  <small style={{ color: '#16a34a', display: 'block', marginBottom: '1rem' }}>
                    Las contraseñas coinciden.
                  </small>
                )}

                <Button
                  label={loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  className="w-full p-2 text-base"
                  onClick={actualizarContrasena}
                  disabled={loading}
                />
              </>
            ) : (
              <>
                <div className="text-900 text-2xl font-medium mb-2">
                  🔒 ¡Contraseña actualizada!
                </div>

                <p className="text-sm text-gray-600 mb-5">
                  Tu contraseña fue restablecida exitosamente.
                  Ya puedes iniciar sesión con tus nuevos datos.
                </p>

                <Button
                  label="Ir al inicio de sesión"
                  icon="pi pi-sign-in"
                  className="w-full p-2 text-base"
                  onClick={() => router.push('/auth/login')}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;