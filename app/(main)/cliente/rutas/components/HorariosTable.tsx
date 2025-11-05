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
      <div className="overflow-x-auto">
        <DataTable
          value={data}
          responsiveLayout="stack"
          breakpoint="960px"
          stripedRows
          scrollable
          scrollHeight="400px"
          tableStyle={{ minWidth: "600px" }}
          emptyMessage="No hay rutas activas con horarios."
          className="text-sm"
        >
          {/* Columna de ruta */}
          <Column 
            field="ruta" 
            header="Ruta" 
            style={{ minWidth: "160px", fontWeight: "bold" }} 
            body={(data) => (
              <span className="font-semibold text-primary">{data.ruta}</span>
            )}
          />

          {/* Columnas de horarios, dinámicamente creadas según la cantidad de horarios */}
          {[...Array(maxHorarios)].map((_, i) => (
            <Column
              key={i}
              field={`h${i}`}
              header={`Hora ${i + 1}`}
              style={{ textAlign: "center", minWidth: "100px" }}
              body={(data) => (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {data[`h${i}`]}
                </span>
              )}
            />
          ))}
        </DataTable>
      </div>
      
      {/* Información responsive */}
      <div className="mt-3 text-xs text-gray-500 text-center md:text-left">
        <i className="pi pi-info-circle mr-1"></i>
        Desliza horizontalmente para ver todos los horarios en dispositivos móviles
      </div>
    </Card>
  );
};

export default HorariosTabla;