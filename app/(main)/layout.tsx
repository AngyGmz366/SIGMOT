'use client';

import Layout from '../../layout/layout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* Auto logout solo visual */
function useAutoLogout(timeoutMs: number = 15 * 60 * 1000) {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.warn('⏰ Sesión cerrada por inactividad');
        fetch('/api/auth/logout', { method: 'POST' });
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
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useAutoLogout();
  return <Layout>{children}</Layout>;
}
// app/%28main%29/layout.tsx