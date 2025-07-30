/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                {/* Logo SIGMOT */}
                <img
                    src="/demo/images/login/LOGO-SIGMOT.png"
                    alt="Logo SIGMOT"
                    className="mb-4"
                   style={{
                     position: 'absolute',
                     top: '3rem',
                     width: '100px',         // Tamaño más grande
                     height: 'auto',
                     zIndex: 1
                    }}
                />

                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Bienvenido a SAENZ</div>
                            <span className="text-600 font-medium">Inicia sesión para continuar</span>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                Correo electrónico
                            </label>
                            <InputText
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Dirección de correo"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Contraseña
                            </label>
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="rememberme"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="rememberme">Recordarme</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <Button label="Iniciar sesión" className="w-full p-3 text-xl" onClick={() => router.push('/auth/twofactor')} />
                            <Button
                                label="Crear cuenta"
                                className="w-full p-3 text-xl mt-3 p-button-outlined"
                                onClick={() => router.push('/auth/Register')}

                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
// This code is a React component for a login page using Next.js and PrimeReact.
// It includes a logo, input fields for email and password, a checkbox for remembering the user,
// and a button to submit the login form. The layout is styled with classes from PrimeReact and custom styles.
// The component uses the LayoutContext to apply specific styles based on the layout configuration. 