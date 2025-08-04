/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2';

const VerificarOtp = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [codigo, setCodigo] = useState('');
    const searchParams = useSearchParams();
    const correo = searchParams.get('correo') ?? '';
    const router = useRouter();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const verificarCodigo = () => {
        if (codigo === '123456') {
            Swal.fire({
                icon: 'success',
                title: 'Código correcto',
                text: 'Ahora puedes actualizar tu contraseña',
                confirmButtonColor: '#6366f1'
            }).then(() => {
                router.push('/auth/actualizarcontra?token=abc123'); // token simulado
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
                                alt="Logo SAENZ"
                                className="mb-2 w-2 h-auto"
                            />
                            <div className="text-900 text-2xl font-medium mb-2">Verificar Código</div>
                           <p className="text-sm text-gray-600">
                                Se ha enviado un código al correo <strong>xxxxx@gmail.com</strong>
                            </p>

                        </div>

                        <div>
                            <label htmlFor="codigo" className="block text-900 text-base font-medium mb-2">
                                Código de verificación
                            </label>
                            <InputText
                                id="codigo"
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                
                                className="w-full mb-4"
                                style={{ padding: '0.75rem', backgroundColor: '#f1f5f9' }}
                            />

                            <Button
                                label="Verificar código"
                                className="w-full p-2 text-base"
                                onClick={verificarCodigo}
                            />

                            <Button
                                label="Reenviar código"
                                className="w-full p-button-text text-blue-600 mt-3"
                                icon="pi pi-refresh"
                                onClick={() => Swal.fire('Código reenviado', '', 'info')}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VerificarOtp;
