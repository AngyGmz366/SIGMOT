import { useIncidencias } from '../hooks/useIncidencias';

export const incidenciasMock = [
  { id: 1, fecha: '2025-07-20', tipo: 'Queja', estado: 'Abierto', descripcion: 'El bus llegó tarde' },
  { id: 2, fecha: '2025-07-22', tipo: 'Sugerencia', estado: 'Cerrado', descripcion: 'Agregar más horarios nocturnos' },
  { id: 3, fecha: '2025-07-25', tipo: 'Problema técnico', estado: 'En proceso', descripcion: 'Fallo en la compra de boletos en línea' }
];
