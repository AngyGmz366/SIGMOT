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
              

                <div
                    style={{
                        borderRadius: '40px',
                        padding: '0.2rem',
                        background: 'linear-gradient(to bottom, #6366f1 5%, transparent 10%)'
                    }}
                >
                    <div
                        className="py-6 px-4 sm:px-6"
                        style={{
                            borderRadius: '40px',
                            backgroundColor: '#ffffff',
                            maxWidth: '500px',
                            width: '100%'
                        }}
                    >
                        <div className="text-center mb-4">
                            <img
                                src="/demo/images/login/LOGO-SIGMOT.png"
                                alt="Logo SAENZ"
                                className="mb-2"
                                style={{ width: '100px', height: 'auto' }}
                            />
                            <div className="text-900 text-2xl font-medium mb-2">Bienvenido a SAENZ</div>
                            <span className="text-600 font-medium text-sm">Inicia sesión para continuar</span>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-900 text-base font-medium mb-2">
                                Correo electrónico
                            </label>
                            <InputText
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Dirección de correo"
                                className="w-full mb-4"
                                style={{ padding: '0.75rem', backgroundColor: '#f1f5f9' }}
                            />

                            <label htmlFor="password" className="block text-900 font-medium text-base mb-2">
                                Contraseña
                            </label>
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                toggleMask
                                className="w-full mb-4"
                                inputClassName="w-full p-2"
                                inputStyle={{ backgroundColor: '#f1f5f9' }}
                            />

                            <div className="flex align-items-center justify-content-between mb-4 gap-3">
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
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <Button
                                label="Iniciar sesión"
                                className="w-full p-2 text-base"
                                onClick={() => router.push('/auth/twofactor')}
                            />
                            <Button
                                label="Crear cuenta"
                                className="w-full p-2 text-base mt-3 p-button-outlined"
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
