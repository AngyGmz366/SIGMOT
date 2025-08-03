import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Ruta } from '../Types/rutas.types';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

interface HorariosTablaProps {
  ruta?: Ruta;
}

const HorariosTabla: React.FC<HorariosTablaProps> = ({ ruta }) => {
  if (!ruta || !Array.isArray(ruta.paradas) || ruta.paradas.length === 0) return null;


  const horarios = ruta.paradas[0]?.horario ?? [];

  const filasTabla = ruta.paradas.map(parada => {
    const fila: any = { nombre: parada.nombre, tarifa: parada.tarifa };
    parada.horario.forEach((hora, idx) => {
      fila[`hora${idx}`] = hora;
    });
    return fila;
  });

  return (
    <Card title="🕓 Horarios y Paradas" style={{ marginTop: '2rem' }}>
      <DataTable value={filasTabla} responsiveLayout="scroll" stripedRows tableStyle={{ minWidth: '100%' }}>
        <Column
          field="nombre"
          header="Parada"
          style={{ fontWeight: 'bold', width: '200px' }}
          body={(rowData) => (
            <div>
              <strong>{rowData.nombre}</strong><br />
              <Tag severity="info" value={`Lps. ${rowData.tarifa}`} />
            </div>
          )}
        />
        {horarios.map((hora, idx) => (
          <Column
            key={idx}
            field={`hora${idx}`}
            header={`Horario ${idx + 1}`}
            style={{ textAlign: 'center' }}
          />
        ))}
      </DataTable>
    </Card>
  );
};

export default HorariosTabla;
