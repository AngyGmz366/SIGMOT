import FormReservacion from './components/FormReservacion';

export default function NuevaReservacionPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Reservación</h1>
      <FormReservacion />
    </div>
  );
}