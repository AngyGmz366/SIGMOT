'use client';

import React from 'react';
import Link from 'next/link';

const NotFoundPage = () => {
    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden bg-[#f5f1eb]">
            <div className="flex flex-column align-items-center justify-content-center px-4">
                <img src="/img/logo-sigmot.svg" alt="SIGMOT Logo" className="mb-5 w-8rem" />

                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, rgba(139, 69, 19, 0.3) 10%, rgba(255, 255, 255, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center shadow-2" style={{ borderRadius: '53px' }}>
                        <span className="text-[#8b4513] font-bold text-3xl">404</span>
                        <h1 className="text-900 font-bold text-5xl mb-2">Página no encontrada</h1>
                        <div className="text-600 mb-5 text-center">La ruta que intentas visitar no existe o ha sido movida.</div>

                        <Link href="/" className="w-full flex align-items-center mb-4 py-4 border-300 border-bottom-1 hover:surface-hover transition-colors">
                            <span className="flex justify-content-center align-items-center bg-yellow-700 text-white border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="pi pi-home text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 text-xl font-medium mb-1">Volver al inicio</span>
                                <span className="text-600 text-lg">Explora el panel principal de SIGMOT</span>
                            </span>
                        </Link>

                        <Link href="/soporte" className="w-full flex align-items-center mb-4 py-4 border-300 border-bottom-1 hover:surface-hover transition-colors">
                            <span className="flex justify-content-center align-items-center bg-cyan-700 text-white border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="pi pi-info-circle text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 text-xl font-medium mb-1">Centro de Soporte</span>
                                <span className="text-600 text-lg">Consulta nuestras preguntas frecuentes</span>
                            </span>
                        </Link>

                        <Link href="/contacto" className="w-full flex align-items-center py-4 hover:surface-hover transition-colors">
                            <span className="flex justify-content-center align-items-center bg-orange-700 text-white border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="pi pi-envelope text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 text-xl font-medium mb-1">Contáctanos</span>
                                <span className="text-600 text-lg">Estamos aquí para ayudarte</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

