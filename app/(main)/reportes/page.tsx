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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Interfaces
interface Reporte {
  id: number
  tipo: string
  fecha: string
  total: number
}

// Opciones de pie chart
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

// Datos de pasajeros
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

// ==================== Reutilizables para secciones y tablas ====================
type ColumnDef = { field: string; header: string; body?: (row: any) => React.ReactNode };

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="report-card">
      <h3 className="report-section-title">{title}</h3>
      {children}
    </section>
  );
}

    function ReportTable({
      title,
      columns,
      data,
      onView,
    }: {
      title: string;
      columns: ColumnDef[];
      data: any[];
      onView?: (row: any) => void;
    }) {
      const accionesBody = (row: any) => (
        <div className="report-actions">
          <button
            type="button"
            className="p-button p-component btn-detalle"
            onClick={() => onView?.(row)}
            title="Ver detalle"
          >
            <span className="p-button-icon pi pi-eye" />
            <span className="p-button-label">Ver detalle</span>
          </button>
        </div>
      );

      return (
        <ReportSection title={title}>
          <DataTable value={data} stripedRows responsiveLayout="scroll">
            {columns.map((c, i) => (
              <Column key={i} field={c.field} header={c.header} body={c.body ? (row) => c.body!(row) : undefined} />
            ))}
            {/* Columna de acciones */}
            {onView && <Column header="Acciones" body={accionesBody} style={{ width: 140 }} />}
          </DataTable>
        </ReportSection>
      );
    }

const ReportesPage = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [reporteActual, setReporteActual] = useState<Reporte | null>(null);
  const toast = useRef<Toast>(null);
  
  const [detalleVisible, setDetalleVisible] = useState(false)
  const [reporteDetalle, setReporteDetalle] = useState<Reporte | null>(null)

  const [confirmVisible, setConfirmVisible] = useState(false)
  const [reporteAEliminar, setReporteAEliminar] = useState<Reporte | null>(null)
  const [searchText, setSearchText] = useState('');

    // Detalle genérico
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleInfo, setDetalleInfo] = useState<{ seccion: string; row: any } | null>(null);


  // === Estado del modal de detalle ===
const [detalleTitulo, setDetalleTitulo] = useState<string>('');
const [detalleFila, setDetalleFila] = useState<any>(null);

// Formatea "total_l" -> "Total L", "fechaVenta" -> "Fecha Venta"
function labelize(key: string) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Si quieres formateo rápido para fechas y dinero
function prettyValue(k: string, v: any) {
  if (v == null) return '-';
  const key = k.toLowerCase();
  if (key.includes('fecha')) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
  }
  if (key.includes('total') || key.includes('monto') || key.includes('salario')) {
    const n = Number(v);
    return isNaN(n) ? String(v) : `L. ${n.toLocaleString()}`;
  }
  return String(v);
}

function abrirDetalle(seccion: string, row: any) {
  setDetalleInfo({ seccion, row });
  setDetalleOpen(true);
}

function cerrarDetalle() {
  setDetalleVisible(false);
  setDetalleFila(null);
}

  useEffect(() => {
    setReportes([
      { id: 1, tipo: 'Boletos', fecha: '2025-07-10', total: 350 },
      { id: 2, tipo: 'Facturación', fecha: '2025-07-11', total: 420 }
    ]);
  }, []);

  const abrirNuevo = () => {
    setReporteActual({ id: 0, tipo: '', fecha: '', total: 0 });
    setDialogVisible(true);
  };

  const guardarReporte = () => {
    if (!reporteActual) return;

    if (reporteActual.id === 0) {
      const nuevo = { ...reporteActual, id: new Date().getTime() };
      setReportes([...reportes, nuevo]);
    } else {
      setReportes(reportes.map(r => (r.id === reporteActual.id ? reporteActual : r)));
    }

    setDialogVisible(false);
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Reporte guardado correctamente' });
  };

  const editarReporte = (r: Reporte) => {
    setReporteActual({ ...r });
    setDialogVisible(true);
  };

  const confirmarEliminacion = (reporte: Reporte) => {
    setReporteAEliminar(reporte)
    setConfirmVisible(true)
  }
  
  const eliminarConfirmado = () => {
    if (!reporteAEliminar) return
    setReportes(reportes.filter(r => r.id !== reporteAEliminar.id))
    setConfirmVisible(false)
    toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Reporte eliminado correctamente' })
  }

  const verDetalle = (reporte: Reporte) => {
    setReporteDetalle(reporte)
    setDetalleVisible(true)
  }

// -------------------- RECOLECTOR DE TABLAS PARA EXPORTAR --------------------
// Nota: ahora mismo tus DataTable usan [] como value. Estas funciones
// exportarán igual (tablas vacías) hasta que conectes los arrays reales.
// Cuando tengas data, podrás reemplazar cada value={[]} por el array correcto
// y aquí solo mapeas esos arrays.

  const buildAllTablesForExport = () => {
    // Define aquí las "columnas" visibles de cada tabla (en el mismo orden)
    // y de dónde vendrán sus filas (por ahora vacías).
    // Cuando conectes datos reales, reemplaza `rows: []` por tu array (e.g. repEmpleados).
    return [
      {
        title: 'Reportes de Empleados',
        columns: ['Nombre', 'Departamento', 'Salario (L)'],
        rows: [] as any[],
        mapRow: (r: any) => [r.nombre, r.departamento, r.salario],
      },
      {
        title: 'Reportes de Boletos',
        columns: ['Tipo', 'Cliente', 'Origen', 'Destino', 'Fecha', 'Estado', 'Metodo de Pago', 'Total (L)'],
        rows: [],
        mapRow: (r: any) => [r.tipo, r.cliente, r.origen, r.destino, r.fecha, r.estado, r.metodo_pago, r.total],
      },
      {
        title: 'Reportes de Ventas / Facturación',
        columns: ['N° Factura', 'Cliente', 'Fecha', 'Método de Pago', 'Total (L)'],
        rows: [],
        mapRow: (r: any) => [r.numero, r.cliente, r.fecha, r.metodo, r.total],
      },
      {
        title: 'Reportes de Encomiendas',
        columns: ['Código', 'Remitente', 'Destinatario', 'Destino', 'Estado', 'Fecha'],
        rows: [],
        mapRow: (r: any) => [r.codigo, r.remitente, r.destinatario, r.destino, r.estado, r.fecha],
      },
      {
        title: 'Reportes de Rutas',
        columns: ['ID', 'Origen', 'Destino', 'Estado', 'Tiempo Estimado', 'Precio', 'Horarios', 'Unidades', 'Descripción'],
        rows: [],
        mapRow: (r: any) => [r.id, r.origen, r.destino, r.estado, r.tiempo_estimado, r.precio, r.horarios, r.unidades, r.descripcion],
      },
      {
        title: 'Reportes de Mantenimiento',
        columns: ['Vehículo', 'Placa', 'Tipo de Servicio', 'Fecha Programada', 'Fecha Realizada', 'Próximo Mantenimiento', 'Kilometraje', 'Taller', 'Costo (L)'],
        rows: [],
        mapRow: (r: any) => [r.vehiculo, r.placa, r.tipo_servicio, r.fecha_programada, r.fecha_realizada, r.proximo_mantenimiento, r.kilometraje, r.taller, r.costo],
      },
      {
        title: 'Reportes de Incidencias',
        columns: ['Título', 'Categoría', 'Estado', 'Responsable', 'Fecha'],
        rows: [],
        mapRow: (r: any) => [r.titulo, r.categoria, r.estado, r.responsable, r.fecha],
      },
      {
        title: 'Reportes de Reservaciones',
        columns: ['ID', 'Cliente', 'Tipo', 'Ruta', 'Unidad', 'Asientos/Costo', 'Estado'],
        rows: [],
        mapRow: (r: any) => [r.id, r.cliente, r.tipo, r.ruta, r.asiento_costo, r.estado],
      },
      {
        title: 'Reportes de Unidades',
        columns: ['Placa', 'Marca', 'Modelo', 'Asientos', 'Descripción', 'Año', 'Estado'],
        rows: [],
        mapRow: (r: any) => [r.placa, r.marca, r.modelo, r.asientos, r.descripcion, r.anio, r.estado],
      },
      {
        title: 'Reportes de Clientes',
        columns: ['Nombre', 'Identidad', 'Teléfono', 'Correo', 'Estado'],
        rows: [],
        mapRow: (r: any) => [r.nombre, r.identidad, r.telefono, r.correo, r.estado],
      },
      {
        title: 'Reportes de Personas',
        columns: ['Nombres', 'Apellidos','DNI', 'Tipo Persona', 'Género', 'Teléfono', 'Correo', 'Departamento', 'Municipio'],
        rows: [],
        mapRow: (r: any) => [r.nombres, r.apellidos, r.dni, r.tipo_persona, r.genero, r.telefono, r.correo, r.departamento, r.municipio],
      },
    ];
  };

      // ======= Paleta corporativa (azul/amarillo/rojo del logo) =======
      const PDF_COLORS = {
        primary:   "#1976d2", // Azul más oscuro (cabeceras de tabla)
        secondary: "#42a5f5", // Azul medio (barra header)
        accent:    "#90caf9", // Azul claro (barra secundaria)
        text:      "#000000", // Negro para textos y títulos de secciones
        zebra:     "#e3f2fd", // Azul muy claro para filas alternas
      };
      // Convierte el logo por ruta a DataURL (base64) para jsPDF
      async function toDataURL(path: string): Promise<string | null> {
        try {
          const res = await fetch(path);
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      }

      // Dibuja encabezado + pie con logo y paginación
      function paintHeaderFooter(doc: any, logoDataURL: string | null, meta: {
        title: string;
        by?: string;
        at?: string;
        filters?: string[];
      }) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const HEADER_H = 86;
        const FOOTER_H = 36;

        const drawHeader = () => {
          // barra superior
          doc.setFillColor(PDF_COLORS.primary);
          doc.rect(0, 0, pageWidth, 6, "F");

         // antes estaba 140 x 50 aprox
          const LOGO_W = 90;   // ancho deseado
          const LOGO_H = 70;    // alto deseado
          const LOGO_X = 32;    // margen izquierdo
          const LOGO_Y = 20;    // margen superior

          if (logoDataURL) {
            doc.addImage(logoDataURL, "PNG", LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
          }

          // textos derecha
          doc.setTextColor(PDF_COLORS.text);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text(meta.title, pageWidth - 32, 32, { align: "right" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const lines: string[] = [];
          if (meta.by) lines.push(meta.by);
          if (meta.at) lines.push(meta.at);
          if (meta.filters?.length) lines.push(...meta.filters);
          lines.forEach((line, i) => {
            doc.text(line, pageWidth - 32, 50 + i * 12, { align: "right" });
          });

          // franja inferior del header
          doc.setFillColor(PDF_COLORS.secondary);
          doc.rect(0, HEADER_H - 10, pageWidth, 10, "F");
          doc.setFillColor(PDF_COLORS.accent);
          doc.rect(0, HEADER_H - 10, pageWidth * 0.35, 10, "F");
        };

        const drawFooter = (pageNum: number, pageCount: number) => {
          doc.setFontSize(9);
          doc.setTextColor(PDF_COLORS.text);
          // línea superior
          doc.setDrawColor(PDF_COLORS.zebra);
          doc.line(32, pageHeight - FOOTER_H, pageWidth - 32, pageHeight - FOOTER_H);
          // leyenda
          doc.text("SIGMOT · Sistema de Gestión y Monitoreo de Transportes", 32, pageHeight - 16);
          // paginación
          doc.text(`Página ${pageNum} de ${pageCount}`, pageWidth - 32, pageHeight - 16, { align: "right" });
        };
        // puebla todas las páginas
        const pages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          drawHeader();
          drawFooter(i, pages);
        }

        return { HEADER_H, FOOTER_H };
      }

  // -------------------- EXPORTAR A PDF (TODAS LAS TABLAS) --------------------
  const exportReportesPDF = async () => {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true }); // A4 vertical
  const tables = buildAllTablesForExport();

  // meta del reporte
  const meta = {
    title: "Reportes SAENZ",
    by: "Usuario: ",
    at: new Date().toLocaleString(),
    filters: [
      `Periodo: ${fechaInicio ? fechaInicio.toLocaleDateString() : "—"} a ${fechaFin ? fechaFin.toLocaleDateString() : "—"}`
    ],
  };

  // carga logo desde TU ruta existente en el proyecto
  const logoDataURL = await toDataURL("/demo/images/login/LOGO-SIGMOT.png");

  // márgenes y posición inicial (después del header)
  const { HEADER_H } = { HEADER_H: 86 };
  let y = HEADER_H + 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  tables.forEach((t, idx) => {
    // título de sección
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(PDF_COLORS.text);
    if (idx > 0) y += 10;
    doc.text(t.title, 40, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [t.columns],
      body: t.rows.map(t.mapRow),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 5, textColor: PDF_COLORS.text },
      headStyles: { fillColor: PDF_COLORS.primary, textColor: "#FFFFFF", fontStyle: "bold" },
      alternateRowStyles: { fillColor: PDF_COLORS.zebra },
      margin: { left: 40, right: 40, top: HEADER_H + 8, bottom: 50 },
      pageBreak: "auto",
    });

    // siguiente Y
    // @ts-ignore
    y = (doc as any).lastAutoTable?.finalY ?? (y + 60);
    y += 18;

    // salto si falta espacio
    if (pageHeight - y < 120 && idx < tables.length - 1) {
      doc.addPage();
      y = HEADER_H + 16;
    }
  });

  // pintar header/footer en TODAS las páginas al final
  paintHeaderFooter(doc, logoDataURL, meta);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Reportes_Generales_${stamp}.pdf`);
};
    // Limpia nombres de hoja para Excel
  const toSafeSheetName = (raw: string, fallback = 'Hoja') => {
    // Prohibidos: : \ / ? * [ ]
    const forbidden = /[:\\\/\?\*\[\]]/g;
    // quitar prohibidos y recortar
    let name = (raw || fallback).replace(forbidden, ' ').trim();
    // Excel no permite > 31 chars
    name = name.slice(0, 31).trim();
    // No puede estar vacío ni empezar/terminar con comilla simple
    if (!name) name = fallback;
    if (name.startsWith("'")) name = name.slice(1);
    if (name.endsWith("'")) name = name.slice(0, -1);
    // Si después de todo queda vacío:
    if (!name) name = fallback;
    return name;
  };
  // -------------------- EXPORTAR A EXCEL (12 HOJAS) --------------------
  const exportReportesExcel = () => {
    const wb = XLSX.utils.book_new();
    const tables = buildAllTablesForExport();

    tables.forEach((t) => {
      const rows = t.rows.map(t.mapRow);
      const sheetData = [t.columns, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      // asegurar nombre válido y único
          let safe = toSafeSheetName(t.title);
          const existing = new Set(wb.SheetNames);
          let suffix = 1;
          while (existing.has(safe)) {
            const base = toSafeSheetName(t.title.slice(0, 28)); // deja sitio para " (n)"
            safe = `${base} (${suffix++})`.slice(0, 31);
          }
          XLSX.utils.book_append_sheet(wb, ws, safe);
        // máx 31 chars
            });

    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Reportes_Generales_${stamp}.xlsx`);
  };

  // -------------------- BÚSQUEDA (placeholder simple) --------------------
  const onSearch = () => {
    // Por ahora solo notifica. Luego, puedes aplicar este 'searchText'
    // para filtrar los arrays que alimentan cada DataTable.
    toast.current?.show({
      severity: 'info',
      summary: 'Búsqueda',
      detail: `Buscar: "${searchText}"  |  Rango: ${fechaInicio ? fechaInicio.toLocaleDateString() : '—'} a ${fechaFin ? fechaFin.toLocaleDateString() : '—'}`,
    });
  };

  const accionesTemplate = (rowData: Reporte) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" className="btn-ver" rounded text severity="info" onClick={() => verDetalle(rowData)} />
      <Button icon="pi pi-pencil" className="btn-editar" rounded text severity="warning" onClick={() => editarReporte(rowData)} />
      <Button icon="pi pi-trash" className="btn-eliminar" rounded text severity="danger" onClick={() => confirmarEliminacion(rowData)} />
    </div>
  )
  const leftToolbarTemplate = () => (
    <Button label="Nuevo Reporte" icon="pi pi-plus" className="btn-verde" onClick={abrirNuevo} />
  );

  const estadisticas = [
    { titulo: 'Ventas del día', valor: 'L. 12,500' },
    { titulo: 'Boletos vendidos', valor: '342' },
    { titulo: 'Ocupación promedio', valor: '78%' }
  ];

  const datosGrafico = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      {
        label: 'Ventas mensuales (L)',
        data: [12000, 15000, 11000, 17000, 14500],
        backgroundColor: '#6366f1',
      }
    ]
  };

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
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Reportes Generales</h2>

      <Toast ref={toast} />

     {/* Tarjetas estadísticas */}
<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 mt-6">
  {estadisticas.map((e, i) => (
    <div
      key={i}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center justify-center text-center transition-all duration-100 hover:shadow-md"
    >
      <div className="text-xs text-gray-200 uppercase tracking-wide">{e.titulo}</div>
      <div className="text-2xl font-bold text-indigo-300 mt-1">{e.valor}</div>
    </div>
  ))}
</div>


      {/* Gráficos: uno al lado del otro */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mt-10">
        {/* Gráfico de ventas */}
        <div className="flex-1 bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ventas Mensuales</h3>
          <Chart type="bar" data={datosGrafico} options={opcionesGrafico} style={{ width: '100%', height: '200px' }} />
        </div>

        {/* Gráfico de distribución de pasajeros */}
        <div className="flex-1 bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Distribución de pasajeros</h3>
          <div className="flex justify-around text-sm text-gray-700 font-medium mb-4">
            <span>Niños: { datos.niños } </span>
            <span>Hombres: { datos.hombres } </span>
            <span>Mujeres: { datos.mujeres } </span>
          </div>
          <div style={{ width: '100%', height: '200px' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
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

      {/* Diálogo de reporte */}
      <Dialog
        header={reporteActual?.id ? 'Editar Reporte' : 'Nuevo Reporte'}
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setDialogVisible(false)}
        className="p-fluid shadow-2 border-round-xl"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); guardarReporte(); }}
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
          {/* Modal de Detalle */}
          <Dialog
            header="Detalle del Reporte"
            visible={detalleVisible}
            style={{ width: '90vw', maxWidth: '600px' }}
            onHide={() => setDetalleVisible(false)}
            className="shadow-2 border-round-xl">
            <div className="detalle-vehiculo space-y-2">
              <p><strong>Tipo:</strong> {reporteDetalle?.tipo}</p>
              <p><strong>Fecha:</strong> {reporteDetalle?.fecha}</p>
              <p><strong>Total:</strong> L. {reporteDetalle?.total}</p>
            </div>
          </Dialog>

          {/* Modal de Confirmación */}
          <Dialog
            header="Confirmar"
            visible={confirmVisible}
            style={{ width: '90vw', maxWidth: '600px' }}
            onHide={() => setConfirmVisible(false)}
            className="shadow-2 border-round-xl">
            <div className="flex items-center gap-3">
              <i className="pi pi-exclamation-triangle text-xl text-yellow-500"></i>
              <p className="text-base">
                ¿Está seguro de eliminar el reporte de tipo <strong>{reporteAEliminar?.tipo}</strong>?
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button label="No" icon="pi pi-times" className="btn-cancelar" onClick={() => setConfirmVisible(false)} />
              <Button label="Sí" icon="pi pi-check" className="btn-guardar" onClick={eliminarConfirmado} />
            </div>
          </Dialog>

        {/* ==================== ACCIONES: REPORTES GENERALES (Buscar + Exportar) ==================== */}
        <section className="mt-10">
          <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Reportes Generales</h3>
              <p className="text-sm text-gray-600">Unifica la exportación de todas las tablas mostradas abajo.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              {/* Reutilizamos tu rango de fechas existente (fechaInicio/fechaFin) */}
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar en reportes..."
                  className="w-full md:w-16rem"
                />
              </span>
              <Button label="Buscar" icon="pi pi-filter" className="btn-morado" onClick={onSearch} />

              <Button
                label="Exportar PDF"
                icon="pi pi-file-pdf"
                className="p-button-danger"
                onClick={exportReportesPDF}
              />
              <Button
                label="Exportar Excel"
                icon="pi pi-file-excel"
                className="p-button-success"
                onClick={exportReportesExcel}
              />
            </div>
          </div>
        </section>
        {/* ================== Sección: Reportes de Empleados ================== */}
          <ReportTable
            title="Reportes de Empleados"
            data={[]} // usa tu arreglo real; si no, [].
            columns={[
              { field: 'nombre', header: 'Nombre' },
              { field: 'departamento', header: 'Departamento' },
              { field: 'salario', header: 'Salario (L)' },
            ]}
            onView={(row) => abrirDetalle('Empleados', row)}
          />
    {/* ================== Sección: Reportes de Boletos ================== */}

        <ReportTable
          title="Reportes de Boletos"
          data={[]}
          columns={[
            { field: 'tipo', header: 'Tipo' },
            { field: 'cliente', header: 'Cliente' },
            { field: 'origen', header: 'Origen' },
            { field: 'destino', header: 'Destino' },
            { field: 'fecha', header: 'Fecha' },
            { field: 'estado', header: 'Estado' },
            { field: 'metodo_pago', header: 'Metodo de Pago' },
            { field: 'total', header: 'Total (L)' },
          ]}
          onView={(row) => abrirDetalle('Boletos', row)}
        />
          {/* ==================== Reportes de Ventas / Facturación ==================== */}
      <ReportTable
        title="Reportes de Ventas / Facturación"
        data={[]}
        columns={[
          { field: 'numero',   header: 'Nº' },
          { field: 'cliente',  header: 'Cliente' },
          { field: 'documento',header: 'Documento' }, // factura/boleta
          { field: 'fecha',    header: 'Fecha' },
          { field: 'total',    header: 'Total (L)' },
          { field: 'estado',   header: 'Estado' },
        ]}
        onView={(row) => abrirDetalle('Ventas', row)}
      />
      {/* ==================== Reportes de Encomiendas ==================== */}
      <ReportTable
        title="Reportes de Encomiendas"
        data={[]}
        columns={[
          { field: 'codigo',      header: 'Código' },
          { field: 'remitente',   header: 'Remitente' },
          { field: 'destinatario',header: 'Destinatario' },
          { field: 'ruta',        header: 'Ruta' },
          { field: 'fecha',       header: 'Fecha' },
          { field: 'monto',       header: 'Monto (L)' },
          { field: 'estado',      header: 'Estado' },
        ]}
        onView={(row) => abrirDetalle('Encomiendas', row)}
      />

      {/* ==================== Reportes de Rutas ==================== */}
      <ReportTable
        title="Reportes de Rutas"
        data={[]}
        columns={[
          { field: 'id', header: 'ID' },
          { field: 'origen', header: 'Origen' },
          { field: 'destino',header: 'Destino' },
          { field: 'estado', header: 'Estado' },
          { field: 'tiempo_estimado', header: 'Tiempo Estimado' },
          { field: 'precio', header: 'Precio' },
          { field: 'horarios', header: 'Horarios' },
          { field: 'unidades', header: 'Unidades' },
          { field: 'descripcion', header: 'Descripción' },
        ]}
        onView={(row) => abrirDetalle('Rutas', row)}
      />

      {/* ==================== Reportes de Mantenimiento ==================== */}
      <ReportTable
        title="Reportes de Mantenimiento"
        data={[]}
        columns={[
          { field: 'vehiculo', header: 'Vehículo' },
          { field: 'placa', header: 'Placa' },
          { field: 'tipo_servicio',     header: 'Tipo de Servicio' },       // preventivo/correctivo
          { field: 'fecha_programada',    header: 'Fecha Programada' },
          { field: 'fecha_realizada', header: 'Fecha Realizada' },
          { field: 'proximo_mantenimiento', header: 'Próximo Mantenimiento' },
          { field: 'kilometraje', header: 'Kilometraje' },
          { field: 'costo',    header: 'Costo (L)' },
        ]}
        onView={(row) => abrirDetalle('Mantenimiento', row)}
      />

      {/* ==================== Reportes de Incidencias ==================== */}
      <ReportTable
        title="Reportes de Incidencias"
        data={[]}
        columns={[
          { field: 'id',        header: 'ID' },
          { field: 'titulo',    header: 'Título' },
          { field: 'categoria', header: 'Categoría' },
          { field: 'fecha',     header: 'Fecha' },
          { field: 'estado',    header: 'Estado' },
          { field: 'prioridad', header: 'Prioridad' },
        ]}
        onView={(row) => abrirDetalle('Incidencias', row)}
      />

      {/* ==================== Reportes de Reservaciones ==================== */}
      <ReportTable
        title="Reportes de Reservaciones"
        data={[]}
        columns={[
          { field: 'id',       header: 'ID' },
          { field: 'cliente',  header: 'Cliente' },
          { field: 'tipo',     header: 'Tipo' },
          { field: 'ruta',     header: 'Ruta' },
          { field: 'unidad',   header: 'Unidad' },
          { field: 'fecha',    header: 'Fecha' },
          { field: 'asiento/costo', header: 'Asientos/Costo' },
          { field: 'estado',   header: 'Estado' },
        ]}
        onView={(row) => abrirDetalle('Reservaciones', row)}
      />

      {/* ==================== Reportes de Unidades ==================== */}
      <ReportTable
        title="Reportes de Unidades"
        data={[]}
        columns={[
          { field: 'placa',  header: 'Placa' },
          { field: 'marca',  header: 'Marca' },
          { field: 'modelo', header: 'Modelo' },
          { field: 'asientos', header: 'Asientos' },
          { field: 'descripcion', header: 'Descripción' },
          { field: 'anio',   header: 'Año' },
          { field: 'estado', header: 'Estado' },

        ]}
        onView={(row) => abrirDetalle('Vehículos', row)}
      />

      {/* ==================== Reportes de Clientes ==================== */}
      <ReportTable
        title="Reportes de Clientes"
        data={[]}
        columns={[
          { field: 'id',      header: 'ID' },
          { field: 'nombre',  header: 'Nombre' },
          { field: 'telefono',header: 'Teléfono' },
          { field: 'correo',  header: 'Correo' },
          { field: 'estado',  header: 'Estado' },
        ]}
        onView={(row) => abrirDetalle('Clientes', row)}
      />

      {/* ==================== Reportes de Personas ==================== */}
      <ReportTable
        title="Reportes de Personas"
        data={[]}
        columns={[
          { field: 'id',      header: 'ID' },
          { field: 'nombres',  header: 'Nombres' },
          { field: 'apellidos', header: 'Apellidos' },
          { field: 'dni', header: 'DNI' },
          { field: 'tipo_persona',     header: 'Tipo Persona' },      // empleado/cliente/etc.
          { field: 'telefono',header: 'Teléfono' },
          { field: 'correo',  header: 'Correo' },
          { field: 'genero', header: 'Género' },
          { field: 'departamento',  header: 'Departamento' },
          { field: 'municipio', header: 'Municipio' },
        ]}
        onView={(row) => abrirDetalle('Personas', row)}
      />
                <Dialog
          header={`Detalle - ${detalleInfo?.seccion ?? ''}`}
          visible={detalleOpen}
          style={{ width: '90vw', maxWidth: '640px' }}
          onHide={() => setDetalleOpen(false)}
          className="shadow-2 border-round-xl"
        >
          {detalleInfo?.row ? (
            <div className="detalle-grid">
              {Object.entries(detalleInfo.row).map(([k, v]) => (
                <div key={k} className="detalle-item">
                  <div className="detalle-key">{k}</div>
                  <div className="detalle-val">{String(v ?? '')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay datos.</p>
          )}
        </Dialog>
    </div>
  );
};

export default ReportesPage;
