/* eslint-disable @next/next/no-img-element */
'use client';

import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useContext, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';

const ActualizarContrasena = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [nueva, setNueva] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const actualizar = () => {
        if (nueva !== confirmar) {
            alert('⚠️ Las contraseñas no coinciden');
            return;
        }

        // Aquí llamas a tu API, pasando también el token de recuperación
        console.log('Nueva contraseña:', nueva);
        console.log('Token recibido:', token);

        // Redirigir al login después de actualizar
        // router.push('/auth/login');
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
                                alt="Logo SAENZ"
                                className="mb-2 w-2 h-auto"
                            />
                            <div className="text-900 text-2xl font-medium mb-2">Actualizar Contraseña</div>
                            <p className="text-sm text-gray-600">Crea tu nueva contraseña para continuar</p>
                        </div>

                        <div>
                            <label htmlFor="nueva" className="block text-900 text-base font-medium mb-2">
                                Nueva Contraseña
                            </label>
                            <Password
                                inputId="nueva"
                                value={nueva}
                                onChange={(e) => setNueva(e.target.value)}
                                toggleMask
                                placeholder="Nueva contraseña"
                                className="w-full mb-4"
                                inputStyle={{ backgroundColor: '#f1f5f9' }}
                            />

                            <label htmlFor="confirmar" className="block text-900 text-base font-medium mb-2">
                                Confirmar Contraseña
                            </label>
                            <Password
                                inputId="confirmar"
                                value={confirmar}
                                onChange={(e) => setConfirmar(e.target.value)}
                                toggleMask
                                placeholder="Confirmar contraseña"
                                className="w-full mb-4"
                                inputStyle={{ backgroundColor: '#f1f5f9' }}
                            />

                            <Button
                                label="Actualizar"
                                className="w-full p-2 text-base"
                                onClick={() => router.push('/auth/login')}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActualizarContrasena;
