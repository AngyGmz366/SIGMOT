import FormReservacion from './components/FormReservacion';

export default function NuevaReservacionPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center md:text-left">
        Nueva Reservación
      </h1>

      <div className="card shadow-2 border-round-xl p-3 md:p-5 bg-white">
        <FormReservacion />
      </div>
    </div>
  );
}
