import Link from 'next/link';

export default function ReservacionPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Módulo de Reservaciones</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/main/cliente/reservacion/nueva" 
          className="border rounded-lg p-6 hover:bg-blue-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">📝 Nueva Reservación</h2>
          <p className="text-gray-600">Crear nueva reserva de viaje o encomienda</p>
        </Link>

        <Link 
          href="/main/cliente/reservacion/mis-reservaciones" 
          className="border rounded-lg p-6 hover:bg-blue-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">📋 Mis Reservaciones</h2>
          <p className="text-gray-600">Ver y gestionar mis reservas existentes</p>
        </Link>
      </div>
    </div>
  );
}