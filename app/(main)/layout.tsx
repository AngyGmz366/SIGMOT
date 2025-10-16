'use client';

import Layout from '../../layout/layout';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast'; // Importa el Toast de PrimeReact
import '../../styles/layout/layout.scss';  // Ruta correcta desde app/layout hasta styles/layout



function useAutoLogout(timeoutMs: number = 15 * 60 * 1000) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const toast = useRef<Toast>(null); // Usamos el ref del Toast

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fetch('/api/auth/logout', { method: 'POST' });
        console.warn('⏰ Sesión cerrada por inactividad');
        setShowToast(true); // Mostrar el mensaje emergente
        toast.current?.show({
          severity: 'success', // Usamos 'success' para el mensaje de éxito
          summary: 'Éxito',
          detail: 'Sesión cerrada por inactividad. Redirigiendo a la página de login...',
          life: 10000, // Duración de 5 segundos
        });
        router.replace('/auth/login');
      }, timeoutMs);
    };

    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(timer);
      ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
        window.removeEventListener(evt, resetTimer)
      );
    };
  }, [router, timeoutMs]);

  return { toast }; // Solo devolvemos el ref para el Toast
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useAutoLogout(); // Usamos el hook para obtener el ref

  return (
    <Layout>
      <Toast ref={toast} /> {/* Agregamos el Toast aquí con ref */}
      {children}
    </Layout>
  );
}
