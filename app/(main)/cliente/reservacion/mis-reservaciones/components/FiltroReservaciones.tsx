'use client';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

export default function FiltrosReservaciones({ filters, setFilters }: any) {
  const estados = [
    { label: 'Todas', value: null },
    { label: 'Confirmadas', value: 'confirmada' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Canceladas', value: 'cancelada' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block mb-2 font-medium">Estado</label>
        <Dropdown
          value={filters.estado}
          options={estados}
          onChange={(e) => setFilters({...filters, estado: e.value})}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Desde</label>
        <Calendar
          value={filters.desde}
          onChange={(e) => setFilters({...filters, desde: e.value})}
          className="w-full"
          dateFormat="dd/mm/yy"
          showIcon
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Hasta</label>
        <Calendar
          value={filters.hasta}
          onChange={(e) => setFilters({...filters, hasta: e.value})}
          className="w-full"
          dateFormat="dd/mm/yy"
          showIcon
        />
      </div>
    </div>
  );
}