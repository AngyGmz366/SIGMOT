'use client';

import React, { useContext, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const RecuperarContrasena: React.FC = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const [correo, setCorreo] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const router = useRouter();

  const containerClassName = classNames(
    'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
    { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
  );

  const enviarCorreo = async (): Promise<void> => {
    if (!correo.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, ingresa un correo válido.',
      });
      return;
    }

    try {
      setCargando(true);

      // 1️⃣ Enviar correo de recuperación desde el backend (Nodemailer)
      const res = await api.post('/api/auth/forgot-password', { email: correo });
      if (res.status !== 200) throw new Error(res.data?.error || 'Error al enviar el correo.');

      // 2️⃣ Registrar acción en bitácora con el ID real del usuario (ya lo maneja el backend)
      await api.post('/api/auth/bitacora', {
        correo,
        accion: 'SOLICITAR_RESET',
        descripcion: `El usuario con correo ${correo} solicitó restablecer su contraseña.`,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Correo de recuperación enviado correctamente. Revisa tu bandeja de entrada o spam.',
      });
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo enviar el correo.',
      });
    } finally {
      setCargando(false);
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
                className="mb-2 w-3 h-auto mx-auto"
              />
              <div className="text-900 text-2xl font-semibold mb-2">
                ¿Olvidaste tu contraseña?
              </div>
              <p className="text-600 mb-4 text-sm">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
              </p>
            </div>

            <div>
              <label htmlFor="correo" className="block text-900 text-base font-medium mb-2">
                Correo electrónico
              </label>
              <InputText
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full mb-4"
                style={{ padding: '0.75rem', backgroundColor: '#f1f5f9' }}
              />

              <Button
                label={cargando ? 'Enviando...' : 'Enviar correo'}
                className="w-full p-2 text-base"
                disabled={cargando}
                onClick={enviarCorreo}
              />

              <div className="flex justify-between mt-4 gap-3">
                <Button
                  label="Volver al login"
                  icon="pi pi-arrow-left"
                  className="p-button-text text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => router.push('/auth/login')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
