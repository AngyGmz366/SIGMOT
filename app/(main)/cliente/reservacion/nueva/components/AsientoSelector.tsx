'use client';
import { InputNumber } from 'primereact/inputnumber';
import { useState } from 'react';

export default function AsientoSelector({ formData, setFormData }: any) {
  const [disponibles] = useState<number[]>(
    Array.from({ length: 40 }, (_, i) => i + 1)
      .filter(n => ![4, 13, 17, 25, 33].includes(n)) // Asientos ocupados de ejemplo
  );

  const totalAsientos = 40;

  const generarMapaBus = () => {
    const filas: JSX.Element[] = [];

    for (let fila = 0; fila < Math.ceil(totalAsientos / 4); fila++) {
      const asientoIzq1 = fila * 4 + 1;
      const asientoIzq2 = fila * 4 + 2;
      const asientoDer1 = fila * 4 + 3;
      const asientoDer2 = fila * 4 + 4;

      const celdaAsiento = (numero: number) => {
        const disponible = disponibles.includes(numero);
        const seleccionado = numero === formData.asiento;
        return (
          <button
            key={numero}
            className={`
              w-10 h-10 rounded-lg text-sm font-semibold
              flex items-center justify-center border
              ${seleccionado ? 'bg-blue-500 text-white' :
                disponible ? 'bg-green-500 text-white hover:bg-green-600' :
                'bg-red-500 text-white cursor-not-allowed'}
            `}
            onClick={() => disponible && setFormData({ ...formData, asiento: numero })}
            disabled={!disponible}
          >
            {numero}
          </button>
        );
      };

      filas.push(
        <div key={fila} className="grid grid-cols-5 gap-2 justify-items-center">
          {asientoIzq1 <= totalAsientos ? celdaAsiento(asientoIzq1) : <div />}
          {asientoIzq2 <= totalAsientos ? celdaAsiento(asientoIzq2) : <div />}
          <div className="w-10 h-10" /> {/* Pasillo */}
          {asientoDer1 <= totalAsientos ? celdaAsiento(asientoDer1) : <div />}
          {asientoDer2 <= totalAsientos ? celdaAsiento(asientoDer2) : <div />}
        </div>
      );
    }

    return filas;
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block mb-2 font-medium">Selección de Asiento</label>
        <InputNumber
          value={formData.asiento}
          onValueChange={(e) => setFormData({ ...formData, asiento: e.value })}
          className="w-full"
          placeholder="Número de asiento"
          min={1}
          max={40}
        />
      </div>

      {/* Conductor */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-yellow-300 flex justify-center items-center rounded-full shadow">
            🚌
          </div>
          <span className="text-sm mt-1 text-gray-600">Conductor</span>
        </div>
      </div>

      {/* Mapa de asientos */}
      <div className="flex flex-col gap-2 items-center">
        {generarMapaBus()}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mt-4 text-sm justify-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-sm" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
