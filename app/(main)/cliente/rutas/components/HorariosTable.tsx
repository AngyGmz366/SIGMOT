import React from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Ruta {
  origen: string;
  destino: string;
  horarios: string[];
}

interface Props {
  rutas: Ruta[];
}

const HorariosTabla: React.FC<Props> = ({ rutas = [] }) => {
  if (!rutas.length) return null;

  // Convertimos cada ruta en una fila
  const data = rutas.map((r, idx) => {
    const row: any = {
      id: idx + 1,
      ruta: `${r.origen} → ${r.destino}`,
    };
    (r.horarios ?? []).forEach((h, i) => {
      row[`h${i}`] = h.replace(/^0/, ""); // quitar ceros iniciales
    });
    return row;
  });

  // Encontramos el máximo número de horarios entre todas las rutas
  const maxHorarios = Math.max(...rutas.map((r) => r.horarios?.length ?? 0));

  return (
    <Card title="🕓 Horarios por Ruta" className="shadow-2 mb-4">
      <DataTable
        value={data}
        responsiveLayout="scroll"
        stripedRows
        tableStyle={{ minWidth: "100%" }}
        emptyMessage="No hay rutas activas con horarios."
      >
        <Column field="ruta" header="Ruta" style={{ minWidth: "14rem", fontWeight: "bold" }} />
        {[...Array(maxHorarios)].map((_, i) => (
          <Column
            key={i}
            field={`h${i}`}
            header={`Horario ${i + 1}`}
            style={{ textAlign: "center" }}
          />
        ))}
      </DataTable>
    </Card>
  );
};

export default HorariosTabla;
