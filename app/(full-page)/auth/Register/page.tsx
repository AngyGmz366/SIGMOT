'use client';
//comentario
import React, { useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

type FormState = {
  nombres: string;
  correo: string;
  telefono: string;
  genero: number | null;
  fechaNacimiento: Date | null;
  contrasena: string;
  repetirContrasena: string;
  codigoVerificacion: string;
};

type ErrorState = Partial<Record<keyof FormState, string>> & { general?: string };

const DEFAULT_GENERO_ID = 4;

const generosOpts = [
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 },
  { label: 'Otro', value: 3 },
  { label: 'Prefiero no decir', value: DEFAULT_GENERO_ID },
];

const esMayorDeEdad = (fecha: Date | null): boolean => {
  if (!fecha) return false;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();

  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  return edad >= 18;
};

const PHONE_REGEX = /^[23789]\d{7}$/;

const RegistroUsuario: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    nombres: '',
    correo: '',
    telefono: '',
    genero: null,
    fechaNacimiento: null,
    contrasena: '',
    repetirContrasena: '',
    codigoVerificacion: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});

  const setField = (k: keyof FormState, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const phoneSanitized = useMemo(
    () => form.telefono.replace(/[^\d]/g, ''),
    [form.telefono]
  );

  const handleTelefonoChange = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
    setField('telefono', soloNumeros);

    if (touched.telefono) {
      setErrors((prev) => ({
        ...prev,
        telefono: validarTelefono(soloNumeros),
      }));
    }
  };

  const validarTelefono = (telefono: string): string | undefined => {
    if (!telefono.trim()) return 'Teléfono requerido.';
    if (!/^\d+$/.test(telefono)) return 'El teléfono solo debe contener números.';
    if (!PHONE_REGEX.test(telefono))
      return 'El teléfono debe tener 8 dígitos válidos.';
    return undefined;
  };

  // Validaciones
  const validateLocal = (): ErrorState => {
    const err: ErrorState = {};

    if (!form.nombres.trim()) err.nombres = 'Nombre completo requerido.';

    if (!form.correo.trim()) err.correo = 'Correo requerido.';
    else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(form.correo.trim())) {
        err.correo = 'Formato de correo no válido.';
      }
    }

    const telefonoError = validarTelefono(phoneSanitized);
    if (telefonoError) err.telefono = telefonoError;

    if (!form.contrasena) err.contrasena = 'Contraseña requerida.';
    else if (form.contrasena.length < 8) err.contrasena = 'Mínimo 8 caracteres.';

    if (!form.repetirContrasena) err.repetirContrasena = 'Repite la contraseña.';
    else if (form.contrasena !== form.repetirContrasena) {
      err.repetirContrasena = 'Las contraseñas no coinciden.';
    }

    if (!form.fechaNacimiento) {
      err.fechaNacimiento = 'Selecciona tu fecha de nacimiento.';
    } else if (!esMayorDeEdad(form.fechaNacimiento)) {
      err.fechaNacimiento = 'Debes ser mayor de 18 años.';
    }

    const codigo = form.codigoVerificacion.trim();

    if (!codigo) {
      err.codigoVerificacion = 'Debes ingresar el código.';
    } else if (!/^\d+$/.test(codigo)) {
      err.codigoVerificacion = 'El código solo debe contener números.';
    } else if (codigo.length !== 6) {
      err.codigoVerificacion = 'El código debe tener exactamente 6 dígitos.';
    }

    return err;
  };

  const touchField = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Enviar código de verificación
  const handleSendCode = async () => {
    if (!form.correo.trim()) {
      return Swal.fire('Error', 'Ingresa primero un correo válido.', 'error');
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form.correo.trim())) {
      return Swal.fire('Error', 'Formato de correo inválido.', 'error');
    }

    setSendingCode(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.correo.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo enviar el código');

      Swal.fire('Código enviado', 'Revisa tu bandeja de entrada.', 'success');
    } catch (e: any) {
      Swal.fire('Error', e?.message || 'No se pudo enviar el código.', 'error');
    } finally {
      setSendingCode(false);
    }
  };

  // Enviar correo de bienvenida
  const sendWelcomeEmail = async (email: string, nombres: string) => {
    try {
      await fetch('/api/auth/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombres }),
      });
    } catch (error) {
      console.error('Error enviando correo de bienvenida:', error);
    }
  };

  // REGISTRO LOCAL
  const handleSubmitLocal = async () => {
    const v = validateLocal();
    setErrors(v);
    setTouched({
      nombres: true,
      correo: true,
      telefono: true,
      genero: true,
      fechaNacimiento: true,
      contrasena: true,
      repetirContrasena: true,
      codigoVerificacion: true,
    });

    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: form.nombres.trim(),
          apellidos: '',
          telefono: phoneSanitized,
          genero_id: form.genero ?? DEFAULT_GENERO_ID,
          fecha_nacimiento: form.fechaNacimiento?.toISOString().slice(0, 10),
          email: form.correo.trim(),
          password: form.contrasena,
          rolDefecto: 3,
          tipoPersona: 1,
          estadoUsuario: 1,
          codigoVerificacion: form.codigoVerificacion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Error registrando');

      await sendWelcomeEmail(form.correo.trim(), form.nombres.trim());

      await Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: 'Correo verificado y cuenta registrada correctamente. Te hemos enviado un correo de bienvenida.',
        confirmButtonColor: '#6366f1',
      });

      router.push('/auth/login');
    } catch (e: any) {
      Swal.fire('Error', e?.message || 'No se pudo registrar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // REGISTRO CON GOOGLE
  const handleRegisterGoogle = async () => {
    const v = validateLocal();
    setErrors(v);
    setTouched({
      nombres: true,
      correo: true,
      telefono: true,
      genero: true,
      fechaNacimiento: true,
      contrasena: true,
      repetirContrasena: true,
      codigoVerificacion: true,
    });

    if (v.nombres || v.telefono || v.fechaNacimiento) {
      return Swal.fire(
        'Error',
        'Completa correctamente nombre, teléfono y fecha de nacimiento antes de continuar con Google.',
        'error'
      );
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          nombres: form.nombres?.trim() || result.user.displayName || '',
          apellidos: '',
          telefono: phoneSanitized,
          genero_id: form.genero ?? DEFAULT_GENERO_ID,
          fecha_nacimiento: form.fechaNacimiento?.toISOString().slice(0, 10),
          rolDefecto: 3,
          tipoPersona: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Error registrando con Google');

      const userName = form.nombres?.trim() || result.user.displayName || '';
      const userEmail = result.user.email || '';
      if (userEmail) {
        await sendWelcomeEmail(userEmail, userName);
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Registro completado con Google. Te hemos enviado un correo de bienvenida.',
        confirmButtonColor: '#6366f1',
      });

      router.push('/dashboard');
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') return;
      Swal.fire('Error', e?.message || 'No se pudo registrar con Google.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
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
              <div className="text-900 text-2xl font-semibold mb-2">Crear cuenta</div>
            </div>

            {/* Nombre */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
              <InputText
                value={form.nombres}
                onChange={(e) => setField('nombres', e.target.value)}
                onBlur={() => touchField('nombres')}
                className="w-full"
                placeholder="Ej: Juan Pérez"
              />
              {touched.nombres && errors.nombres && (
                <small className="p-error">{errors.nombres}</small>
              )}
            </div>

            {/* Teléfono */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
              <InputText
                value={form.telefono}
                onChange={(e) => handleTelefonoChange(e.target.value)}
                onBlur={() => {
                  touchField('telefono');
                  setErrors((prev) => ({
                    ...prev,
                    telefono: validarTelefono(phoneSanitized),
                  }));
                }}
                maxLength={8}
                keyfilter="int"
                placeholder="Ej. 98765432"
                className={`w-full ${touched.telefono && errors.telefono ? 'p-invalid' : ''}`}
              />
              {touched.telefono && errors.telefono && (
                <small className="p-error">{errors.telefono}</small>
              )}
            </div>

            {/* Género */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Género</label>
              <Dropdown
                value={form.genero}
                options={generosOpts}
                onChange={(e: DropdownChangeEvent) => setField('genero', e.value)}
                placeholder="Seleccione género"
                className="w-full"
              />
            </div>

            {/* Fecha nacimiento */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Fecha de Nacimiento
              </label>
              <Calendar
                value={form.fechaNacimiento}
                onChange={(e) => setField('fechaNacimiento', e.value as Date)}
                onBlur={() => touchField('fechaNacimiento')}
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                className="w-full"
                placeholder="Seleccione su fecha de nacimiento"
              />
              {touched.fechaNacimiento && errors.fechaNacimiento && (
                <small className="p-error">{errors.fechaNacimiento}</small>
              )}
            </div>

            {/* Correo + botón enviar código */}
            <div className="mb-3 flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <InputText
                  type="email"
                  value={form.correo}
                  onChange={(e) => setField('correo', e.target.value)}
                  onBlur={() => touchField('correo')}
                  className="w-full"
                  placeholder="Ej: usuario@correo.com"
                />
                {touched.correo && errors.correo && (
                  <small className="p-error">{errors.correo}</small>
                )}
              </div>
              <div className="flex align-items-end">
                <Button
                  label={sendingCode ? 'Enviando...' : 'Enviar código'}
                  icon="pi pi-send"
                  onClick={handleSendCode}
                  disabled={sendingCode || !form.correo}
                />
              </div>
            </div>

            {/* Código de verificación */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Código de verificación
              </label>
              <InputText
                value={form.codigoVerificacion}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setField('codigoVerificacion', soloNumeros);
                }}
                onBlur={() => touchField('codigoVerificacion')}
                maxLength={6}
                keyfilter="int"
                placeholder="Ej: 123456"
                className={`w-full ${
                  touched.codigoVerificacion && errors.codigoVerificacion ? 'p-invalid' : ''
                }`}
              />
              {touched.codigoVerificacion && errors.codigoVerificacion && (
                <small className="p-error">{errors.codigoVerificacion}</small>
              )}
            </div>

            {/* Contraseñas */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
              <Password
                value={form.contrasena}
                onChange={(e) => setField('contrasena', e.target.value)}
                onBlur={() => touchField('contrasena')}
                toggleMask
                className="w-full"
                feedback
                promptLabel="Ingresa una contraseña"
                weakLabel="Débil"
                mediumLabel="Media"
                strongLabel="Fuerte"
              />
              {touched.contrasena && errors.contrasena && (
                <small className="p-error">{errors.contrasena}</small>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Repetir Contraseña
              </label>
              <Password
                value={form.repetirContrasena}
                onChange={(e) => setField('repetirContrasena', e.target.value)}
                onBlur={() => touchField('repetirContrasena')}
                toggleMask
                feedback={false}
                className="w-full"
              />
              {touched.repetirContrasena && errors.repetirContrasena && (
                <small className="p-error">{errors.repetirContrasena}</small>
              )}
            </div>

            {/* Botón registro LOCAL */}
            <Button
              label={loading ? 'Registrando…' : 'Registrarse'}
              icon="pi pi-user-plus"
              className="w-full p-2 text-base mb-2"
              style={{
                backgroundColor: '#6c5ce7',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
              }}
              onClick={handleSubmitLocal}
              disabled={loading}
            />

            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-1 border-top surface-200" />
              <span className="px-2 text-sm text-500">o</span>
              <div className="flex-1 border-top surface-200" />
            </div>

            {/* Botón registro con Google */}
            <Button
              type="button"
              label="Registrarme con Google"
              icon="pi pi-google"
              className="w-full p-2 text-base p-button-outlined"
              onClick={handleRegisterGoogle}
              disabled={loading}
            />

            <Button
              label="¿Ya tienes cuenta? Inicia sesión"
              className="w-full p-2 text-base p-button-outlined mt-3"
              onClick={() => router.push('/auth/login')}
              style={{
                border: '1px solid #6c5ce7',
                color: '#6c5ce7',
                fontWeight: 'bold',
                backgroundColor: 'white',
              }}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroUsuario;