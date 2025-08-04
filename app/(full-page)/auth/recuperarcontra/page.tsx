/* eslint-disable @next/next/no-img-element */
'use client';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';

const RecuperarContrasena = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [correo, setCorreo] = useState('');
    const router = useRouter();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const enviarCorreo = () => {
        // Aquí iría tu lógica para llamar al backend
        console.log('Enviando correo a:', correo);
        // router.push('/auth/ActualizarContrasena'); // si deseas redirigir luego
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
                            <div className="text-900 text-2xl font-medium mb-2">¿Olvidaste tu contraseña?</div>
                        </div>

                        <div>
                            <label htmlFor="correo" className="block text-900 text-base font-medium mb-2">
                                Ingresa tu Correo Electrónico
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
                                label="Enviar correo"
                                className="w-full p-2 text-base"
                               onClick={() => router.push('/auth/actualizarcontra?token=simulado123')}
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
