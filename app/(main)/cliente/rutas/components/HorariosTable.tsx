import React from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Props {
  horarios: string[];
}

const HorariosTabla: React.FC<Props> = ({ horarios = [] }) => {
  if (!horarios.length) return null;

  const row: any = {};
  horarios.forEach((h, i) => (row[`h${i}`] = h.replace(/^0/, "")));

  return (
    <Card title="🕓 Horarios">
      <DataTable value={[row]} responsiveLayout="scroll" tableStyle={{ minWidth: "100%" }}>
        {horarios.map((_, i) => (
          <Column key={i} field={`h${i}`} header={`Horario ${i + 1}`} style={{ textAlign: "center" }} />
        ))}
      </DataTable>
    </Card>
  );
};

export default HorariosTabla;
