import { auth } from '../utils/firebiseClient';
import { onAuthStateChanged } from 'firebase/auth';

export async function cargarReservacionesCliente() {
  try {
    // Obtener token de Firebase (como en FormReservacion)
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const { getAuth } = await import('firebase/auth');
      const firebaseAuth = getAuth();
      const user = firebaseAuth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('⚠️ Usuario no autenticado');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo obtener token Firebase', e);
    }

    const res = await fetch('/api/clientes/reservas', {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Error al obtener reservaciones');
    const data = await res.json();
    return data.items || [];
  } catch (err: any) {
    console.error('❌ Error cargando reservaciones:', err);
    return [];
  }
}
