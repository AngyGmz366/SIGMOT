/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
    const router = useRouter();
    const { layoutConfig } = useContext(LayoutContext);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const validate = () => {
        const errs: typeof errors = {};
        if (!email.trim()) errs.email = 'El correo es obligatorio.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Formato de correo inválido.';

        if (!password.trim()) errs.password = 'La contraseña es obligatoria.';
        else if (password.length < 4) errs.password = 'Debe tener al menos 8 caracteres.';
        return errs;
    };

    const showError = (field: keyof typeof errors) =>
        Boolean(errors[field] && touched[field]);

    const handleBlur = (field: keyof typeof errors) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valErrors = validate();
        setErrors(valErrors);
        setTouched({ email: true, password: true });

        if (Object.keys(valErrors).length > 0) return;

        // Aquí iría el fetch/axios hacia tu API de SIGMOT
        router.push('/auth/twofactor');
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '40px',
                        padding: '0.2rem',
                        background: 'linear-gradient(to bottom, #6366f1 5%, transparent 10%)'
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="py-6 px-4 sm:px-6"
                        style={{
                            borderRadius: '40px',
                            backgroundColor: '#ffffff',
                            maxWidth: '500px',
                            width: '100%'
                        }}
                        noValidate
                    >
                        <div className="text-center mb-4">
                            <img
                                src="/demo/images/login/LOGO-SIGMOT.png"
                                alt="Logo SIGMOT"
                                className="mb-2 w-2 h-auto"
                            />
                            <div className="text-900 text-2xl font-medium mb-2">Inicio de Sesión</div>
                        </div>

                        {/* Correo */}
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
                        />
                        {showError('email') && (
                            <small className="text-danger">{errors.email}</small>
                        )}

                        {/* Contraseña */}
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
                        />
                        {showError('password') && (
                            <small className="text-danger">{errors.password}</small>
                        )}

                        <div className="flex align-items-center justify-content-between mb-4 mt-3 gap-3">
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="rememberme"
                                    checked={checked}
                                    onChange={(e) => setChecked(e.checked ?? false)}
                                    className="mr-2"
                                />
                                <label htmlFor="rememberme" className="text-sm">Recordarme</label>
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
                            label="Iniciar sesión"
                            className="w-full p-2 text-base"
                        />
                        <Button
                            type="button"
                            label="Crear cuenta"
                            className="w-full p-2 text-base mt-3 p-button-outlined"
                            onClick={() => router.push('/auth/Register')}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}


//export default LoginPage;
