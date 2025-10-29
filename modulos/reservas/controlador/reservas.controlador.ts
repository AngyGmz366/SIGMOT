// /modulos/reservas/controlador/reservas.controlador.ts

export async function cargarReservacionesCliente() {
  try {
    const res = await fetch('/api/clientes/reservas', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // fuerza datos actualizados
    });

    if (!res.ok) throw new Error('Error al obtener reservaciones');

    const data = await res.json();

    return data.items || [];
  } catch (err: any) {
    console.error('❌ Error cargando reservaciones:', err);
    return [];
  }
}
