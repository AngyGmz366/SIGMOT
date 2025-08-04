/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useContext } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const TwoFactorPage = () => {
    const [code, setCode] = useState('');
    const router = useRouter();
    const { layoutConfig } = useContext(LayoutContext);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleVerify = () => {
        const normalized = code.replace(/\D/g, '');

        if (normalized === '123456') {
            Swal.fire({
                icon: 'success',
                title: 'Código verificado',
                text: '¡Bienvenido al sistema!',
                confirmButtonColor: '#6366f1'
            }).then(() => {
                router.push('/dashboard');
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Código incorrecto',
                text: 'Verifica el código ingresado',
            });
        }
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
                                alt="Logo SIGMOT"
                                className="mb-2 w-2 h-auto"
                            />
                            <div className="text-900 text-2xl font-medium mb-2">
                                Verificación de Seguridad
                            </div>
                            <p className="text-sm text-gray-600">
                                Ingrese el código de 6 dígitos enviado a su correo electrónico <strong>xxxxx@gmail.com</strong>
                            </p>
                        </div>

                        <input
                            type="text"
                            maxLength={6}
                            inputMode="numeric"
                            className="p-inputtext p-component text-center text-xl border-1 border-round mb-4"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.5rem',
                                backgroundColor: '#f1f5f9'
                            }}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />

                        <Button
                            label="Verificar código"
                            icon="pi pi-check"
                            className="w-full mb-3"
                            style={{ padding: '1rem', fontWeight: 'bold' }}
                            onClick={handleVerify}
                        />

                        <Button
                            label="Reenviar código"
                            icon="pi pi-refresh"
                            className="w-full p-button-text text-blue-600"
                            onClick={() =>
                                Swal.fire('Código reenviado', 'Revisa tu bandeja de entrada.', 'info')
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorPage;
