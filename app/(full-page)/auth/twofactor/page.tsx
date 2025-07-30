'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';

const TwoFactorPage = () => {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleVerify = () => {
    const normalized = code.replace(/\D/g, ''); // eliminar espacios, guiones, etc.

    if (normalized === '123456') {
      alert('✅ Código correcto');
      router.push('/');
    } else {
      alert('❌ Código incorrecto');
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen bg-gray-100 px-4">
      <div
        className="bg-white p-5 border-round shadow-2 text-center"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h2 className="text-2xl font-bold mb-3">Verificación de Seguridad</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ingrese el código de 6 dígitos enviado a su correo electrónico
        </p>

        {/* ✅ Input único para el código */}
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
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <Button
          label="Verificar código"
          icon="pi pi-check"
          className="w-full mb-3"
          style={{ padding: '1rem', backgroundColor: '#635bff', fontWeight: 'bold' }}
          onClick={handleVerify}
        />

        <Button
          label="Reenviar código"
          link
          className="text-sm"
          onClick={() => alert('Código reenviado')}
        />
      </div>
    </div>
  );
};

export default TwoFactorPage;
