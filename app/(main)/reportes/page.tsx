'use client'

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'react-chartjs-2';

// INTERFAZ DE DATOS
interface Reporte {
  id: number
  tipo: string
  fecha: string
  total: number
}

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        font: { size: 20 },
      },
    },
    datalabels: {
      formatter: (value: number, context: any) => {
        const data = context.chart.data.datasets[0].data;
        const total = data.reduce((acc: number, val: number) => acc + val, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `${percentage}%`;
      },
      color: "#fff",
      font: {
        weight: "bold" as const,
        size: 14,
      },
    },
  },
};

const datos = {
  niños: 25,
  hombres: 42,
  mujeres: 30,
};

const pieData = {
  labels: ['Niños', 'Hombres', 'Mujeres'],
  datasets: [
    {
      data: [datos.niños, datos.hombres, datos.mujeres],
      backgroundColor: ['#3b82f6', '#2dd4bf', '#f472b6'],
      borderWidth: 1,
    },
  ],
};


// COMPONENTE PRINCIPAL
const ReportesPage = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
  const [fechaFin, setFechaFin] = useState<Date | null>(null)

  const [reportes, setReportes] = useState<Reporte[]>([])
  const [dialogVisible, setDialogVisible] = useState(false)
  const [reporteActual, setReporteActual] = useState<Reporte | null>(null)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    setReportes([
      { id: 1, tipo: 'Boletos', fecha: '2025-07-10', total: 350 },
      { id: 2, tipo: 'Facturación', fecha: '2025-07-11', total: 420 }
    ])
  }, [])

  const abrirNuevo = () => {
    setReporteActual({ id: 0, tipo: '', fecha: '', total: 0 })
    setDialogVisible(true)
  }

  const guardarReporte = () => {
    if (!reporteActual) return

    if (reporteActual.id === 0) {
      const nuevo = { ...reporteActual, id: new Date().getTime() }
      setReportes([...reportes, nuevo])
    } else {
      setReportes(reportes.map(r => (r.id === reporteActual.id ? reporteActual : r)))
    }

    setDialogVisible(false)
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Reporte guardado correctamente' })
  }

  const editarReporte = (r: Reporte) => {
    setReporteActual({ ...r })
    setDialogVisible(true)
  }

  const eliminarReporte = (id: number) => {
    setReportes(reportes.filter(r => r.id !== id))
  }

  const accionesTemplate = (rowData: Reporte) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="btn-editar" rounded text severity="warning" onClick={() => editarReporte(rowData)} />
      <Button icon="pi pi-trash" className="btn-eliminar" rounded text severity="danger" onClick={() => eliminarReporte(rowData.id)} />
    </div>
  )

  const leftToolbarTemplate = () => (
    <Button label="Nuevo Reporte" icon="pi pi-plus" className="btn-morado" onClick={abrirNuevo} />
  )

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
        backgroundColor: '#6366f1', // azul morado
      }
    ]
  }

  const opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    }
  }


  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Reportes Generales</h2>

      <Toast ref={toast} />

      {/* Filtros de fecha */}
            <div className="flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="desde" className="text-base font-medium leading-[44px]">Desde:</label>
          <Calendar
            id="desde"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value as Date)}
            showIcon
            inputClassName="text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="hasta" className="text-base font-medium leading-[44px]">Hasta:</label>
          <Calendar
            id="hasta"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value as Date)}
            showIcon
            inputClassName="text-base"
          />
        </div>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {estadisticas.map((e, i) => (
        <div
           key={i}
          className="rounded-xl border border-gray-300 shadow-sm p-2 bg-white flex flex-col items-start justify-between"
           >
          <div className="text-sm text-gray-3000 font-medium">
              {e.titulo}: {e.valor}
                  </div>
          </div>
         ))}
        </div>

            {/* Gráfico de ventas */}
            <div>
            <Chart type="bar" data={datosGrafico} options={opcionesGrafico} style={{ width: "100%", maxWidth: "500px", height: "350px" }} />
            </div>

            {/* Gráfico de personas */}
            <div className="mt-10 text-left">
        <h2 className="text-lg font-semibold mb-2">Distribución de pasajeros</h2>

        <div className="flex justify-center gap-6 text-base text-gray-700 font-medium mb-4">
          <span>Niños: {datos.niños}</span>
          <span>Hombres: {datos.hombres}</span>
          <span>Mujeres: {datos.mujeres}</span>
        </div>

        <div className="ml-0" style={{ width: "390px", height: "390px" }}>
         <Chart type="pie" data={pieData} options={pieOptions} />
          </div>      
      </div>


      {/* Tabla de reportes */}
      <div>
        <Toolbar className="mb-4" left={leftToolbarTemplate} />
        <DataTable value={reportes} stripedRows responsiveLayout="scroll">
          <Column field="tipo" header="Tipo" sortable />
          <Column field="fecha" header="Fecha" sortable />
          <Column field="total" header="Total (L)" sortable />
          <Column body={accionesTemplate} header="Acciones" />
        </DataTable>
      </div>

      {/* Formulario unificado */}
      <Dialog
        header={reporteActual?.id ? 'Editar Reporte' : 'Nuevo Reporte'}
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setDialogVisible(false)}
        className="p-fluid shadow-2 border-round-xl"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); guardarReporte() }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="p-float-label w-full mt-2">
            <InputText
               id="tipo"
                value={reporteActual?.tipo || ''}
                onChange={(e) => setReporteActual({ ...reporteActual!, tipo: e.target.value })}
                 className="w-full"
            />
            <label htmlFor="tipo">Tipo</label>
          </div>

          <div className="p-float-label w-full">
            <InputText
              id="fecha"
              value={reporteActual?.fecha || ''}
              onChange={(e) => setReporteActual({ ...reporteActual!, fecha: e.target.value })}
              className="w-full"
            />
            <label htmlFor="fecha">Fecha</label>
          </div>

          <div className="p-float-label w-full">
            <InputNumber
              id="total"
              value={reporteActual?.total || 0}
              onValueChange={(e) => setReporteActual({ ...reporteActual!, total: e.value ?? 0 })}
              className="w-full"
            />
            <label htmlFor="total">Total (L)</label>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-center md:justify-end mt-4 gap-2">
            <Button label="Cancelar" icon="pi pi-times" className="btn-cancelar" onClick={() => setDialogVisible(false)} />
            <Button label="Guardar" icon="pi pi-check" className="btn-guardar" type="submit" />
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default ReportesPage
