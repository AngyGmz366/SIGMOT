/* eslint-disable @next/next/no-img-element */
'use client'; // Fuerza render del lado del cliente

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Image from 'next/image';

import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword, // login normal firebase (correo/clave)
  GoogleAuthProvider,         // proveedor de google
  signInWithPopup,            // abre el popup de google
  setPersistence,             // define si la sesión queda guardada
  browserLocalPersistence,    // sesión se guarda en el navegador (recordarme)
  browserSessionPersistence,  // sesión solo mientras la pestaña esté abierta
} from 'firebase/auth';

const ROL_DEFECTO = 1; // rol por defecto "usuario"

type ErrorState = { email?: string; password?: string; general?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { layoutConfig } = useContext(LayoutContext);

  const containerClassName = classNames(
    'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
    { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
  );

  // 🔹 Validaciones básicas
  const validate = (): ErrorState => {
    const errs: ErrorState = {};
    if (!email.trim()) errs.email = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Formato de correo inválido.';
    if (!password.trim()) errs.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) errs.password = 'Debe tener al menos 8 caracteres.';
    return errs;
  };

  const showError = (field: keyof ErrorState) =>
    (field === 'email' || field === 'password') && Boolean(errors[field] && touched[field]);

  const handleBlur = (field: 'email' | 'password') =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // 🔹 Sincroniza usuario Firebase → BD y guarda datos en localStorage
  const syncUsuarioConBD = async (idToken: string) => {
    const resp = await fetch('/api/auth/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ rolDefecto: ROL_DEFECTO }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.detail || data?.error || 'Error al sincronizar usuario');

    // 🔹 Detecta si viene como array o objeto
    const usuario = Array.isArray(data.usuario) ? data.usuario[0] : data.usuario;

    if (usuario) {
      // ✅ Guardamos datos básicos para el resto del sistema
      localStorage.setItem('idUsuario', usuario.Id_Usuario_PK?.toString() || '');
      localStorage.setItem('nombreUsuario', usuario.Nombre_Usuario || 'Usuario');
      localStorage.setItem('correoUsuario', usuario.Correo_Electronico || '');
      localStorage.setItem('rolUsuario', usuario.Rol || 'Usuario');
      localStorage.setItem('authType', 'firebase');
    }

    return usuario;
  };


  // 🔹 Login local (respaldo)
  const loginLocal = async (email: string, password: string) => {
    const r = await fetch('/api/auth/login-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await r.json().catch(() => ({}));

    if (r.status === 423) {
      if (data.minutosRestantes) {
        throw new Error(`Usuario bloqueado temporalmente. Intenta en ${data.minutosRestantes} minutos.`);
      }
      throw new Error(data?.error || 'Usuario bloqueado temporalmente. Intenta más tarde.');
    }

    if (r.status === 429) {
      throw new Error(data?.error || 'Demasiados intentos desde esta IP. Intenta más tarde.');
    }

    if (!r.ok) {
      throw new Error(data?.error || 'Correo y/o contraseña inválidos.');
    }

    return data;
  };

  // 🔹 Login normal Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valErrors = validate();
    setErrors(valErrors);
    setTouched({ email: true, password: true });
    if (Object.keys(valErrors).length > 0) return;

    setLoading(true);
    setErrors({});
    try {
      await setPersistence(auth, checked ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken(true);

      const usuario = await syncUsuarioConBD(idToken);

      router.push('/dashboard');

    } catch (err: any) {
      const code = err?.code || '';
      const canTryLocal = ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(code);
      try {
        if (canTryLocal) {
            // 🔹 Intenta login local como respaldo
           const data = await loginLocal(email, password);
           // ✅ Guarda el ID de usuario y rol en localStorage
            if (data?.Id_Usuario_PK) {
              localStorage.setItem('idUsuario', String(data.Id_Usuario_PK));
              localStorage.setItem('rolUsuario', data.rol || 'Usuario');
              localStorage.setItem('authType', 'local');
            }

          router.push('/dashboard');
        } else {
          throw err;
        }
      } catch (e: any) {
        console.error(e);
        setErrors((p) => ({ ...p, general: e?.message || 'Error iniciando sesión' }));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login con Google
  const handleLoginGoogle = async () => {
    setLoading(true);
    setErrors({});
    try {
      await setPersistence(auth, checked ? browserLocalPersistence : browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);
      const usuario = await syncUsuarioConBD(idToken);

      router.push('/dashboard');

    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      console.error(err);
      setErrors((p) => ({ ...p, general: err?.message || 'No se pudo iniciar sesión con Google.' }));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UI del login
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
          <form
            onSubmit={handleSubmit}
            className="py-6 px-4 sm:px-6"
            style={{ borderRadius: '40px', backgroundColor: '#ffffff', maxWidth: '500px', width: '100%' }}
            noValidate
          >
            <div className="text-center mb-4">
              <Image
                src="/demo/images/login/LOGO-SIGMOT.png"
                alt="Logo SIGMOT"
                width={120}
                height={120}
                priority
                className="mx-auto mb-3"
              />
              <div className="text-900 text-2xl font-medium mb-2">Inicio de Sesión</div>
            </div>

            {errors.general && (
              <div
                className="p-3 mb-4 border-round"
                style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}
              >
                {errors.general}
              </div>
            )}

            <label htmlFor="email" className="block text-900 text-base font-medium mb-2">
              Correo electrónico
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Dirección de correo"
              className={classNames('w-full mb-1', { 'p-invalid is-invalid': showError('email') })}
              style={{ padding: '0.75rem', backgroundColor: '#f1f5f9' }}
              disabled={loading}
            />
            {showError('email') && <small className="text-danger">{errors.email}</small>}

            <label htmlFor="password" className="block text-900 font-medium text-base mb-2 mt-4">
              Contraseña
            </label>
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Contraseña"
              toggleMask
              className={classNames('w-full mb-1', { 'p-invalid': showError('password') })}
              inputClassName={classNames('w-full p-2', { 'is-invalid': showError('password') })}
              inputStyle={{ backgroundColor: '#f1f5f9' }}
              feedback={false}
              disabled={loading}
            />
            {showError('password') && <small className="text-danger">{errors.password}</small>}

            <div className="flex align-items-center justify-content-between mb-4 mt-3 gap-3">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="rememberme"
                  checked={checked}
                  onChange={(e) => setChecked(e.checked ?? false)}
                  className="mr-2"
                  disabled={loading}
                />
                <label htmlFor="rememberme" className="text-sm">
                  Recordarme
                </label>
              </div>
              <a
                className="font-medium no-underline text-sm cursor-pointer"
                style={{ color: 'var(--primary-color)' }}
                onClick={() => router.push('/auth/recuperarcontra')}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              label={loading ? 'Ingresando...' : 'Iniciar sesión'}
              icon="pi pi-sign-in"
              iconPos="right"
              className="w-full p-2 text-base"
              disabled={loading}
            />

            <Button
              type="button"
              label="Iniciar con Google"
              icon="pi pi-google"
              iconPos="right"
              className="w-full p-2 text-base mt-3 p-button-outlined"
              onClick={handleLoginGoogle}
              disabled={loading}
            />

            <Button
              type="button"
              label="Crear cuenta"
              icon="pi pi-user-plus"
              iconPos="right"
              className="w-full p-2 text-base mt-3 p-button-outlined"
              onClick={() => router.push('/auth/Register')}
              disabled={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
