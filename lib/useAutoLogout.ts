'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Cierra la sesión automáticamente tras un período de inactividad.
 * @param timeoutMs Tiempo de inactividad (por defecto 15 min)
 */
export default function useAutoLogout(timeoutMs: number = 15 * 60 * 1000) {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.warn('⏰ Sesión cerrada por inactividad');
        localStorage.removeItem('auth_token');
        fetch('/api/auth/logout', { method: 'POST' }); // registra bitácora
        router.replace('/auth/inicio');
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
}
