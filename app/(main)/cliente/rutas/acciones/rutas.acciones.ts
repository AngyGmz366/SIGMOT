// ✅ /actions/rutas.actions.ts (simulación básica)
import { Ruta } from '../Types/rutas.types';

export const obtenerRutasMock = (): Ruta[] => [
  {
    id: 'teguc-sanpedro',
    nombre: 'Tegucigalpa → San Pedro Sula',
    origen: 'Tegucigalpa',
    destino: 'San Pedro Sula',
    estado: 'activo',
    tiempoEstimado: '3h 40min',
    coordenadas: [
      [14.072275, -87.192136],
      [14.600000, -87.800000],
      [15.505683, -88.025094],
    ],
    paradas: [
      {
        nombre: 'Tegucigalpa Terminal',
        posicion: [14.072275, -87.192136],
        horario: ['06:00', '12:00', '18:00'],
        tarifa: 200,
      },
      {
        nombre: 'Parada intermedia',
        posicion: [14.600000, -87.800000],
        horario: ['08:00', '14:00', '20:00'],
        tarifa: 100,
      },
      {
        nombre: 'San Pedro Sula Terminal',
        posicion: [15.505683, -88.025094],
        horario: ['10:00', '16:00', '22:00'],
        tarifa: 0,
      },
    ],
  },
  {
    id: 'sanpedro-teguc',
    nombre: 'San Pedro Sula → Tegucigalpa',
    origen: 'San Pedro Sula',
    destino: 'Tegucigalpa',
    estado: 'inactivo',
    tiempoEstimado: '3h 40min',
    coordenadas: [
      [15.505683, -88.025094],
      [14.600000, -87.800000],
      [14.072275, -87.192136],
    ],
    paradas: [
      {
        nombre: 'San Pedro Sula Terminal',
        posicion: [15.505683, -88.025094],
        horario: ['07:00', '13:00', '19:00'],
        tarifa: 200,
      },
      {
        nombre: 'Parada intermedia',
        posicion: [14.600000, -87.800000],
        horario: ['09:00', '15:00', '21:00'],
        tarifa: 100,
      },
      {
        nombre: 'Tegucigalpa Terminal',
        posicion: [14.072275, -87.192136],
        horario: ['11:00', '17:00', '23:00'],
        tarifa: 0,
      },
    ],
  },
];
