'use client'

import React, { useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Chart } from 'primereact/chart'

const ReportesPage = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
  const [fechaFin, setFechaFin] = useState<Date | null>(null)

  const estadisticas = [
    { titulo: 'Ventas del día', valor: 'L. 12,500' },
    { titulo: 'Boletos vendidos', valor: '342' },
    { titulo: 'Ocupación promedio', valor: '78%' }
  ]

  const datosGrafico = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      {
        label: 'Ventas mensuales (L)',
        data: [12000, 15000, 11000, 17000, 14500],
        fill: false,
        borderColor: '#4bc0c0'
      }
    ]
  }

  const reportes = [
    { id: 1, cliente: 'Juan Pérez', ruta: 'Tegucigalpa - SPS', fecha: '2025-07-10', total: 'L. 350' },
    { id: 2, cliente: 'Ana Mejía', ruta: 'Tegucigalpa - La Ceiba', fecha: '2025-07-11', total: 'L. 420' }
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Reportes Generales</h2>

      {/* Filtros de fecha */}
      <div className="flex gap-4 items-center">
        <span>Desde:</span>
        <Calendar
  value={fechaInicio}
  onChange={(e) => setFechaInicio(e.value as Date)}
  showIcon
/>
<Calendar
  value={fechaFin}
  onChange={(e) => setFechaFin(e.value as Date)}
  showIcon
/>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        {estadisticas.map((e, i) => (
          <Card key={i} title={e.titulo}>
            <p className="text-xl font-semibold">{e.valor}</p>
          </Card>
        ))}
      </div>

      {/* Gráfico de ventas */}
      <div>
        <Chart type="line" data={datosGrafico} />
      </div>

      {/* Tabla de reportes */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Reportes de Boletos</h3>
        <DataTable value={reportes} stripedRows responsiveLayout="scroll">
          <Column field="cliente" header="Cliente" sortable />
          <Column field="ruta" header="Ruta" sortable />
          <Column field="fecha" header="Fecha" sortable />
          <Column field="total" header="Total" sortable />
        </DataTable>
      </div>
    </div>
  )
}

export default ReportesPage
