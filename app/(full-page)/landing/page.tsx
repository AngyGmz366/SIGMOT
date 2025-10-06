'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-column align-items-center justify-content-center min-h-screen bg-gray-50">
      {/* LOGO SIGMOT */}
      <div className="text-center mb-4">
        <img
          src="/images/login/LOGO-SIGMOT.png"
          alt="Logo SIGMOT"
          className="mb-3"
          style={{ width: '150px', height: 'auto' }}
        />
        <h1 className="text-3xl font-semibold text-gray-800">Sistema de Gestión de Transporte - SIGMOT</h1>
        <p className="text-gray-600 mt-2">Bienvenido al panel principal</p>
      </div>

      {/* BOTONES DE ACCESO */}
      <div className="flex flex-column gap-3 w-10 md:w-4 text-center">
        <Button
          label="Iniciar Sesión"
          icon="pi pi-sign-in"
          className="p-button-rounded p-button-lg bg-blue-600 border-none text-white"
          onClick={() => router.push('/auth/login')}
        />

        <Button
          label="Crear Cuenta"
          icon="pi pi-user-plus"
          className="p-button-outlined p-button-rounded p-button-lg border-blue-600 text-blue-600"
          onClick={() => router.push('/auth/register')}
        />
      </div>

      {/* PIE DE PÁGINA SIMPLE */}
      <footer className="mt-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Proyecto SIGMOT · Todos los derechos reservados
      </footer>
    </div>
  );
}
