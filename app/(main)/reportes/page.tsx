'use client'

import React, { useEffect, useState, useRef } from 'react';
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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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

        //Función para tablas de reportes individual
        function ReportTable({
          title,
          columns,
          data,
          onView,
        }: {
          title: string;
          columns: { field: string; header: string; body?: (row: any) => React.ReactNode }[];
          data: any[];
          onView?: (row: any) => void;
        }) {
          // Función para exportar módulo individual a PDF
          const exportModuloPDF = async () => {
            const fechaGeneracion = new Date().toLocaleString('es-HN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          
            const filtrosAplicados: string[] = [];
          
            if (title?.trim()) {
              filtrosAplicados.push(`Módulo exportado: ${title}`);
            }
          
            const logoDataURL = await (async () => {
              try {
                const res = await fetch('/demo/images/logo.png');
                const blob = await res.blob();
          
                return await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(String(reader.result));
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } catch {
                return '';
              }
            })();
          
            const escaparHTML = (valor: any) => {
              const texto = valor === null || valor === undefined || valor === '' ? 'Vacío' : String(valor);
              return texto
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            };
          
            const html = `
              <html>
                <head>
                  <meta charset="utf-8" />
                  <title>${escaparHTML(title)} - SIGMOT</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      padding: 24px;
                      background: #f8f9fa;
                      color: #1f2937;
                    }
          
                    .header {
                      border: 1px solid #dbeafe;
                      background: white;
                      border-radius: 12px;
                      overflow: hidden;
                      margin-bottom: 24px;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    }
          
                    .topbar {
                      height: 8px;
                      background: #1976d2;
                    }
          
                    .header-content {
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                      gap: 24px;
                      padding: 20px 24px;
                    }
          
                    .logo-box img {
                      width: 180px;
                      max-width: 100%;
                      height: auto;
                      display: block;
                    }
          
                    .header-text {
                      flex: 1;
                      text-align: right;
                    }
          
                    .header-text h2 {
                      color: #1976d2;
                      margin: 0 0 8px 0;
                      font-size: 24px;
                    }
          
                    .header-text p {
                      margin: 4px 0;
                      font-size: 13px;
                      color: #4b5563;
                    }
          
                    .filters-box {
                      margin-top: 10px;
                      padding: 10px 12px;
                      background: #e3f2fd;
                      border-radius: 8px;
                      display: inline-block;
                      text-align: left;
                    }
          
                    .filters-box strong {
                      color: #1976d2;
                      display: block;
                      margin-bottom: 4px;
                    }
          
                    .filters-box ul {
                      margin: 0;
                      padding-left: 18px;
                    }
          
                    .filters-box li {
                      font-size: 12px;
                      color: #374151;
                      margin-bottom: 2px;
                    }
          
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      background: white;
                    }
          
                    th, td {
                      border: 1px solid #dbeafe;
                      padding: 8px;
                      font-size: 12px;
                      text-align: center;
                      vertical-align: middle;
                    }
          
                    th {
                      background: #1976d2;
                      color: white;
                      font-weight: bold;
                    }
          
                    tr:nth-child(even) {
                      background: #f2f6fc;
                    }
          
                    .footer-note {
                      margin-top: 24px;
                      text-align: center;
                      font-size: 11px;
                      color: #6b7280;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="topbar"></div>
                    <div class="header-content">
                      <div class="logo-box">
                        ${
                          logoDataURL
                            ? `<img src="${logoDataURL}" alt="Logo Transportes Saenz" />`
                            : ''
                        }
                      </div>
          
                      <div class="header-text">
                        <h2>${escaparHTML(title)} - Transportes Saenz</h2>
                        <p><strong>Fecha de generación:</strong> ${escaparHTML(fechaGeneracion)}</p>
          
                        <div class="filters-box">
                          <strong>Criterio aplicado</strong>
                          <ul>
                            ${filtrosAplicados.map((f) => `<li>${escaparHTML(f)}</li>`).join('')}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
          
                  <table>
                    <thead>
                      <tr>
                        ${columns.map(c => `<th>${escaparHTML(c.header)}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${data.map(row => `
                        <tr>
                          ${columns.map(c => `<td>${escaparHTML(row[c.field])}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
          
                  <div class="footer-note">
                    SIGMOT · Sistema de Gestión y Monitoreo de Transportes
                  </div>
          
                  <script>window.onload = () => window.print();</script>
                </body>
              </html>`;
          
            const w = window.open('', '_blank');
            if (w) {
              w.document.open();
              w.document.write(html);
              w.document.close();
            }
          };

          // Función para exportar módulo individual a Excel
          const exportModuloExcel = async () => {
            const workbook = new ExcelJS.Workbook();

            const COLORS = {
              primary: '1976D2',
              secondary: '42A5F5',
              accent: 'E3F2FD',
              white: 'FFFFFF',
              text: '1F2937',
              border: 'D1D5DB',
            };
          
            const safeName =
              title.replace(/[:\\/?*\[\]]/g, ' ').slice(0, 31).trim() || 'Hoja';
          
            const ws = workbook.addWorksheet(safeName);
            const totalColumns = columns.length;
          
            const getCellValue = (row: any, col: any) => {
              const value = row?.[col.field];
              return value === null || value === undefined || value === '' ? 'Vacío' : String(value);
            };
          
            ws.mergeCells(1, 1, 1, totalColumns);
            const titleCell = ws.getCell(1, 1);
            titleCell.value = `${title} - Transportes Saenz`;
            titleCell.font = {
              bold: true,
              size: 16,
              color: { argb: COLORS.white },
            };
            titleCell.alignment = {
              vertical: 'middle',
              horizontal: 'center',
            };
            titleCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: COLORS.primary },
            };
          
            ws.mergeCells(2, 1, 2, totalColumns);
            const dateCell = ws.getCell(2, 1);
            dateCell.value = `Fecha de generación: ${new Date().toLocaleString('es-HN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}`;
            dateCell.font = {
              italic: true,
              size: 11,
              color: { argb: COLORS.text },
            };
            dateCell.alignment = {
              vertical: 'middle',
              horizontal: 'center',
            };
            dateCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: COLORS.accent },
            };
          
            ws.addRow([]);
          
            const headerRow = ws.addRow(columns.map((c) => c.header));
            headerRow.height = 22;
          
            headerRow.eachCell((cell) => {
              cell.font = {
                bold: true,
                color: { argb: COLORS.white },
              };
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
              };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: COLORS.secondary },
              };
              cell.border = {
                top: { style: 'thin', color: { argb: COLORS.border } },
                left: { style: 'thin', color: { argb: COLORS.border } },
                bottom: { style: 'thin', color: { argb: COLORS.border } },
                right: { style: 'thin', color: { argb: COLORS.border } },
              };
            });
          
            data.forEach((row: any, index: number) => {
              const excelRow = ws.addRow(columns.map((c) => getCellValue(row, c)));
          
              excelRow.eachCell((cell) => {
                cell.alignment = {
                  vertical: 'middle',
                  horizontal: 'center',
                  wrapText: true,
                };
                cell.border = {
                  top: { style: 'thin', color: { argb: COLORS.border } },
                  left: { style: 'thin', color: { argb: COLORS.border } },
                  bottom: { style: 'thin', color: { argb: COLORS.border } },
                  right: { style: 'thin', color: { argb: COLORS.border } },
                };
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: {
                    argb: index % 2 === 0 ? 'FFFFFF' : COLORS.accent,
                  },
                };
                cell.font = {
                  size: 11,
                  color: { argb: COLORS.text },
                };
              });
            });
          
            ws.columns = columns.map((col, i) => {
              const values = [
                col.header,
                ...data.map((row: any) => {
                  const value = row?.[col.field];
                  return value === null || value === undefined || value === '' ? 'Vacío' : String(value);
                }),
              ];
          
              const maxLength = Math.min(
                Math.max(...values.map((v) => v.length), 12),
                30
              );
          
              return { width: maxLength + 2 };
            });
          
            ws.views = [{ state: 'frozen', ySplit: 4 }];
          
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
          
            const fecha = new Date().toISOString().slice(0, 10);
            saveAs(blob, `${title}_${fecha}.xlsx`);
          };
        
          // Función para exportar módulo individual a CSV
          const exportModuloCSV = () => {
            let csvContent = columns.map(c => `"${c.header}"`).join(',') + '\n';
            data.forEach((row) => {
              csvContent += columns.map(c => `"${row[c.field] || ''}"`).join(',') + '\n';
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const fecha = new Date().toISOString().slice(0, 10);
            link.setAttribute('href', url);
            link.setAttribute('download', `${title}_${fecha}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
        
          const accionesBody = (row: any) => (
            <Button
              icon="pi pi-eye"
              rounded
              text
              severity="help"
              onClick={() => onView?.(row)}
              tooltip="Ver detalle"
            />
          );
        
          return (
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
              {/* Header con título y botones exportar */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                
                {/* Botones Exportar Individual - HORIZONTAL */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    icon="pi pi-file-pdf"
                    label="PDF"
                    tooltip="Exportar PDF"
                    style={{ 
                      backgroundColor: '#ef4444', 
                      border: 'none',
                      color: 'white',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem'
                    }}
                    onClick={() => exportModuloPDF()}
                  />
                  <Button
                    icon="pi pi-file-excel"
                    label="Excel"
                    tooltip="Exportar Excel"
                    style={{ 
                      backgroundColor: '#16a34a', 
                      border: 'none',
                      color: 'white',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem'
                    }}
                    onClick={() => exportModuloExcel()}
                  />
                  <Button
                    icon="pi pi-file"
                    label="CSV"
                    tooltip="Exportar CSV"
                    style={{ 
                      backgroundColor: '#3b82f6', 
                      border: 'none',
                      color: 'white',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem'
                    }}
                    onClick={() => exportModuloCSV()}
                  />
                </div>
              </div>

              {/* Tabla */}
              <div className="p-6">
                <DataTable value={data} stripedRows responsiveLayout="scroll" paginator rows={10} emptyMessage="No hay datos disponibles">
                  {columns.map((c, i) => (
                    <Column key={i} field={c.field} header={c.header} body={c.body} sortable />
                  ))}
                  {onView && <Column header="Acciones" body={accionesBody} style={{ width: '100px' }} />}
                </DataTable>
              </div>
            </section>
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

  const textoSeguro = (valor: any) => {
    if (valor === null || valor === undefined) return '';
    return String(valor).trim();
  };
  
  const obtenerEstado = (r: any) => {
    return (
      textoSeguro(r.Estado) ||
      textoSeguro(r.estado) ||
      textoSeguro(r.Nombre_Estado) ||
      textoSeguro(r.Estado_Descripcion) ||
      'Sin estado'
    );
  };
  
  const obtenerHorario = (r: any) => {
    const horarioDirecto =
      textoSeguro(r.Horario) ||
      textoSeguro(r.horario);
  
    if (horarioDirecto) return horarioDirecto;
  
    const entrada =
      textoSeguro(r.Hora_Entrada) ||
      textoSeguro(r.HoraEntrada) ||
      textoSeguro(r.horaEntrada);
  
    const salida =
      textoSeguro(r.Hora_Salida) ||
      textoSeguro(r.HoraSalida) ||
      textoSeguro(r.horaSalida);
  
    if (entrada && salida) return `${entrada} - ${salida}`;
    if (entrada) return `Entrada: ${entrada}`;
    if (salida) return `Salida: ${salida}`;
  
    return '';
  };

  const buildAllTablesForExport = () => {
    const todasLasTablas = [
      {
        key: 'boletos',
        title: 'Reportes de Boletos',
        columns: ['Código', 'Cliente', 'Cédula', 'Teléfono', 'Origen', 'Destino', 'Unidad', 'Asiento', 'Método Pago', 'Estado', 'Precio (Lps)', 'Fecha'],
        rows: boletos,
        mapRow: (r: any) => [
          r.Codigo_Ticket || '',
          r.Cliente || '',
          r.Cedula || '',
          r.Telefono || '',
          r.Origen || '',
          r.Destino || '',
          r.Autobus || '',
          r.Numero_Asiento || '',
          r.MetodoPago || '',
          obtenerEstado(r),
          r.Precio_Total || '',
          r.Fecha_Hora_Compra || ''
        ],
      },
      {
        key: 'encomiendas',
        title: 'Reportes de Encomiendas',
        columns: ['ID', 'Cliente', 'Origen', 'Destino', 'Costo (Lps)', 'Descripción', 'Estado', 'Fecha Realizada'],
        rows: encomiendas,
        mapRow: (r: any) => [
          r.Id_Encomiendas_PK || '',
          r.Cliente || '',
          r.Origen || '',
          r.Destino || '',
          r.Costo || '',
          r.Descripcion || '',
          obtenerEstado(r),
          r.Fecha_Realizada || ''
        ],
      },
      {
        key: 'rutas',
        title: 'Reportes de Rutas',
        columns: ['ID', 'Origen', 'Destino', 'Distancia (km)', 'Tiempo', 'Precio (Lps)', 'Estado', 'Descripción'],
        rows: rutas,
        mapRow: (r: any) => [
          r.Id_Ruta_PK || '',
          r.Origen || '',
          r.Destino || '',
          r.Distancia || '',
          r.Tiempo_Estimado || '',
          r.Precio || '',
          obtenerEstado(r),
          r.Descripcion || ''
        ],
      },
      {
        key: 'mantenimiento',
        title: 'Reportes de Mantenimientos',
        columns: ['ID', 'Placa', 'Tipo', 'Estado', 'Fecha Prog.', 'Fecha Real.', 'Próximo', 'Km', 'Taller', 'Repuestos', 'Costo (Lps)'],
        rows: mantenimientos,
        mapRow: (r: any) => [
          r.Id_Mantenimiento_PK || '',
          r.Placa || '',
          r.Tipo_Mantenimiento || '',
          obtenerEstado(r),
          r.Fecha_Programada || '',
          r.Fecha_Realizada || '',
          r.Proximo_Mantenimiento || '',
          r.Kilometraje || '',
          r.Taller || '',
          r.Repuestos || '',
          r.Costo_Total || ''
        ],
      },
      {
        key: 'incidencias',
        title: 'Reportes de Incidencias',
        columns: ['ID', 'Usuario', 'Estado', 'Asunto', 'Descripción', 'Fecha Creación'],
        rows: incidencias,
        mapRow: (r: any) => [
          r.Id_Incidencia_PK || '',
          r.Usuario || '',
          obtenerEstado(r),
          r.Asunto || '',
          r.Descripcion || '',
          r.Fecha_Creacion || ''
        ],
      },
      {
        key: 'reservaciones',
        title: 'Reportes de Reservaciones',
        columns: ['ID', 'Cliente', 'Tipo', 'Estado', 'Fecha', 'Asiento'],
        rows: reservaciones,
        mapRow: (r: any) => [
          r.Id_Reserva_PK || '',
          r.Cliente || '',
          r.Tipo_Reserva || '',
          obtenerEstado(r),
          r.Fecha_Reserva || '',
          r.Asiento || ''
        ],
      },
      {
        key: 'unidades',
        title: 'Reportes de Unidades',
        columns: ['Placa', 'Marca', 'Modelo', 'Asientos', 'Descripción', 'Año', 'Estado'],
        rows: unidades,
        mapRow: (r: any) => [
          r.placa || '',
          r.marca || '',
          r.modelo || '',
          r.asientos || '',
          r.descripcion || '',
          r.anio || '',
          obtenerEstado(r)
        ],
      },
      {
        key: 'clientes',
        title: 'Reportes de Clientes',
        columns: ['ID', 'Nombre', 'DNI', 'Teléfono', 'Estado'],
        rows: clientes,
        mapRow: (r: any) => [
          r.Id_Cliente || '',
          r.Nombre_Completo || '',
          r.DNI || '',
          r.Telefono || '',
          obtenerEstado(r)
        ],
      },
      {
        key: 'personas',
        title: 'Reportes de Personas',
        columns: ['ID', 'Nombres', 'Apellidos', 'DNI', 'Teléfono', 'Género', 'Estado'],
        rows: personas,
        mapRow: (r: any) => [
          r.Id_Persona || '',
          r.Nombres || '',
          r.Apellidos || '',
          r.DNI || '',
          r.Telefono || '',
          r.Genero || '',
          obtenerEstado(r)
        ],
      },
      {
        key: 'empleados',
        title: 'Reportes de Empleados',
        columns: ['ID', 'Empleado', 'DNI', 'Teléfono', 'Cargo', 'Estado', 'Fecha Contratación', 'Horario'],
        rows: empleados,
        mapRow: (r: any) => [
          r.Id_Empleado_PK || '',
          r.Empleado || '',
          r.DNI || '',
          r.Telefono || '',
          r.Cargo || '',
          obtenerEstado(r),
          r.Fecha_Contratacion || '',
          obtenerHorario(r)
        ],
      },
    ];
  
    const filtro = searchText.trim().toLowerCase();
  
    if (!filtro) return todasLasTablas;
  
    return todasLasTablas.filter((tabla) =>
      tabla.key.toLowerCase().includes(filtro) ||
      tabla.title.toLowerCase().includes(filtro)
    );
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

      const getFechaGeneracionTexto = () =>
        new Date().toLocaleString('es-HN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      
      const getFiltrosAplicados = () => {
        const filtros: string[] = [];
      
        if (searchText.trim()) {
          filtros.push(`Módulo filtrado: ${searchText.trim()}`);
        }
      
        if (fechaInicio && fechaFin) {
          filtros.push(
            `Rango de fechas: ${fechaInicio.toLocaleDateString()} a ${fechaFin.toLocaleDateString()}`
          );
        } else if (fechaInicio) {
          filtros.push(`Fecha inicial: ${fechaInicio.toLocaleDateString()}`);
        } else if (fechaFin) {
          filtros.push(`Fecha final: ${fechaFin.toLocaleDateString()}`);
        }
      
        if (filtros.length === 0) {
          filtros.push('Sin filtros aplicados');
        }
      
        return filtros;
      };
      
      const escaparHTML = (valor: any) => {
        const texto = valor === null || valor === undefined || valor === '' ? 'Vacío' : String(valor);
        return texto
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };
      
      const getLogoDataURL = async () => {
        try {
          const res = await fetch('/demo/images/logo.png');
          const blob = await res.blob();
      
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          return '';
        }
      };

  // -------------------- EXPORTAR A PDF (TODAS LAS TABLAS) --------------------
  const exportReportesPDF = async () => {
    const tables = buildAllTablesForExport();
    const fechaGeneracion = getFechaGeneracionTexto();
    const filtrosAplicados = getFiltrosAplicados();
    const logoDataURL = await getLogoDataURL();
  
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reportes - SIGMOT</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              background: #f8f9fa;
              color: #1f2937;
            }
  
            .header {
              border: 1px solid #dbeafe;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 24px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
  
            .topbar {
              height: 8px;
              background: #1976d2;
            }
  
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 24px;
              padding: 20px 24px;
            }
  
            .logo-box {
              flex: 0 0 auto;
            }
  
            .logo-box img {
              width: 180px;
              max-width: 100%;
              height: auto;
              display: block;
            }
  
            .header-text {
              flex: 1;
              text-align: right;
            }
  
            .header-text h2 {
              color: #1976d2;
              margin: 0 0 8px 0;
              font-size: 24px;
            }
  
            .header-text p {
              margin: 4px 0;
              font-size: 13px;
              color: #4b5563;
            }
  
            .filters-box {
              margin-top: 10px;
              padding: 10px 12px;
              background: #e3f2fd;
              border-radius: 8px;
              display: inline-block;
              text-align: left;
            }
  
            .filters-box strong {
              color: #1976d2;
              display: block;
              margin-bottom: 4px;
            }
  
            .filters-box ul {
              margin: 0;
              padding-left: 18px;
            }
  
            .filters-box li {
              font-size: 12px;
              color: #374151;
              margin-bottom: 2px;
            }
  
            h3 {
              color: #1976d2;
              font-size: 17px;
              margin-top: 28px;
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 2px solid #90caf9;
            }
  
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              margin-bottom: 28px;
              border-radius: 10px;
              overflow: hidden;
            }
  
            th, td {
              border: 1px solid #dbeafe;
              padding: 8px;
              font-size: 12px;
              text-align: center;
              vertical-align: middle;
            }
  
            th {
              background: #1976d2;
              color: white;
              font-weight: bold;
            }
  
            tr:nth-child(even) {
              background: #f2f6fc;
            }
  
            .footer-note {
              margin-top: 24px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="topbar"></div>
            <div class="header-content">
              <div class="logo-box">
                ${
                  logoDataURL
                    ? `<img src="${logoDataURL}" alt="Logo Transportes Saenz" />`
                    : ''
                }
              </div>
  
              <div class="header-text">
                <h2>Reportes Generales - Transportes Saenz</h2>
                <p><strong>Fecha de generación:</strong> ${escaparHTML(fechaGeneracion)}</p>
  
                <div class="filters-box">
                  <strong>Filtros aplicados</strong>
                  <ul>
                    ${filtrosAplicados.map((f) => `<li>${escaparHTML(f)}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>
  
          ${tables.map(table => `
            <h3>${escaparHTML(table.title)}</h3>
            <table>
              <thead>
                <tr>
                  ${table.columns.map(col => `<th>${escaparHTML(col)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${table.rows.map(row => {
                  const mappedRow = table.mapRow(row);
                  return `
                    <tr>
                      ${mappedRow.map(cell => `<td>${escaparHTML(cell)}</td>`).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `).join('')}
  
          <div class="footer-note">
            SIGMOT · Sistema de Gestión y Monitoreo de Transportes
          </div>
  
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>`;
  
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
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
  const exportReportesExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const tables = buildAllTablesForExport();
  
    // Colores basados en tu PDF
    const COLORS = {
      primary: '1976D2',   // azul fuerte
      secondary: '42A5F5', // azul medio
      accent: 'E3F2FD',    // azul claro
      white: 'FFFFFF',
      text: '1F2937',
      border: 'D1D5DB',
    };
  
    tables.forEach((table) => {
      const safeName = table.title
        .replace(/[:\\/?*\[\]]/g, ' ')
        .slice(0, 31)
        .trim() || 'Hoja';
  
      const ws = workbook.addWorksheet(safeName);
  
      const totalColumns = table.columns.length;
  
      // Título principal
      ws.mergeCells(1, 1, 1, totalColumns);
      const titleCell = ws.getCell(1, 1);
      titleCell.value = `${table.title} - Transportes Saenz`;
      titleCell.font = {
        bold: true,
        size: 16,
        color: { argb: COLORS.white },
      };
      titleCell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.primary },
      };
  
      // Fecha de generación
      ws.mergeCells(2, 1, 2, totalColumns);
      const dateCell = ws.getCell(2, 1);
      dateCell.value = `Fecha de generación: ${new Date().toLocaleString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })}`;
      dateCell.font = {
        italic: true,
        size: 11,
        color: { argb: COLORS.text },
      };
      dateCell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      dateCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.accent },
      };
  
      // Fila vacía visual
      ws.addRow([]);
  
      // Encabezados
      const headerRow = ws.addRow(table.columns);
      headerRow.height = 22;
  
      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: COLORS.white },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.secondary },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: COLORS.border } },
          left: { style: 'thin', color: { argb: COLORS.border } },
          bottom: { style: 'thin', color: { argb: COLORS.border } },
          right: { style: 'thin', color: { argb: COLORS.border } },
        };
      });
  
      // Datos
      table.rows.forEach((row: any, index: number) => {
        const mappedRow = table.mapRow(row);
        const excelRow = ws.addRow(mappedRow);
  
        excelRow.eachCell((cell) => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          };
  
          cell.border = {
            top: { style: 'thin', color: { argb: COLORS.border } },
            left: { style: 'thin', color: { argb: COLORS.border } },
            bottom: { style: 'thin', color: { argb: COLORS.border } },
            right: { style: 'thin', color: { argb: COLORS.border } },
          };
  
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: index % 2 === 0 ? 'FFFFFF' : COLORS.accent,
            },
          };
  
          cell.font = {
            size: 11,
            color: { argb: COLORS.text },
          };
        });
      });
  
      // Ajuste automático de ancho de columnas
      ws.columns = table.columns.map((col, i) => {
        const values = [
          col,
          ...table.rows.map((row: any) => {
            const mapped = table.mapRow(row);
            return mapped[i] ? String(mapped[i]) : '';
          }),
        ];
  
        const maxLength = Math.min(
          Math.max(...values.map((v) => v.length), 12),
          30
        );
  
        return {
          width: maxLength + 2,
        };
      });
  
      // Congelar encabezados
      ws.views = [{ state: 'frozen', ySplit: 4 }];
  
      // Altura de filas
      ws.eachRow((row, rowNumber) => {
        if (rowNumber >= 4) row.height = 20;
      });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  
    const stamp = new Date().toISOString().slice(0, 10);
    saveAs(blob, `Reportes_Generales_${stamp}.xlsx`);
  };

  function exportReportesCSV(tables: any[]) {
    let csvContent = '';
    tables.forEach((table) => {
      csvContent += `\n"${table.title}"\n`;
      csvContent += table.columns.map((col: string) => `"${col}"`).join(',') + '\n';
      table.rows.forEach((row: any) => {
        const mappedRow = table.mapRow(row);
        csvContent += mappedRow.map((val: any) => `"${val || ''}"`).join(',') + '\n';
      });
      csvContent += '\n';
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Reportes_Generales_${fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  


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

      const [unidades, setUnidades] = useState<any[]>([]);
      const [encomiendas, setEncomiendas] = useState<any[]>([]);
      const [boletos, setBoletos] = useState<any[]>([]);
      const [rutas, setRutas] = useState<any[]>([]);
      const [mantenimientos, setMantenimientos] = useState<any[]>([]);
      const [incidencias, setIncidencias] = useState<any[]>([]);
      const [clientes, setClientes] = useState<any[]>([]);
      const [personas, setPersonas] = useState<any[]>([]);
      const [reservaciones, setReservaciones] = useState<any[]>([]);
      const [empleados, setEmpleados] = useState<any[]>([]);


      useEffect(() => {
        const fetchUnidades = async () => {
          try {
            const res = await fetch('/api/reportes/unidades');
            const json = await res.json();
            if (json.ok) {
              setUnidades(json.data);
              console.log('📊 Reportes de unidades cargados:', json.data);
            } else {
              console.error('⚠️ Error desde backend:', json.error);
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
          }
        };
        fetchUnidades();
      }, []);

      useEffect(() => {
        const fetchEncomiendas = async () => {
          try {
            const res = await fetch('/api/reportes/encomiendas');
            const json = await res.json();
    
            if (json.ok) {
              setEncomiendas(json.data);
              console.log('📦 Reportes de encomiendas cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de encomiendas.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
    
        fetchEncomiendas();
      }, []);

      useEffect(() => {
        const fetchBoletos = async () => {
          try {
            const res = await fetch('/api/reportes/boletos');
            const json = await res.json();
    
            if (json.ok) {
              setBoletos(json.data);
              console.log('Reportes de boletos cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se pudieron cargar los reportes de boletos.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con backend:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor de reportes.',
              life: 4000,
            });
          }
        };
    
        fetchBoletos();
      }, []);

      useEffect(() => {
        const fetchRutas = async () => {
          try {
            const res = await fetch('/api/reportes/rutas');
            const json = await res.json();
    
            if (json.ok) {
              setRutas(json.data);
              console.log('🛣️ Reportes de rutas cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de rutas.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
    
        fetchRutas();
      }, []);
      
      useEffect(() => {
        const fetchMantenimientos = async () => {
          try {
            const res = await fetch('/api/reportes/mantenimiento');
            const json = await res.json();
    
            if (json.ok) {
              setMantenimientos(json.data);
              console.log('🧰 Reportes de mantenimientos cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de mantenimientos.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
    
        fetchMantenimientos();
      }, []);

      useEffect(() => {
        const fetchIncidencias = async () => {
          try {
            const res = await fetch('/api/reportes/incidencias');
            const json = await res.json();
    
            if (json.ok) {
              setIncidencias(json.data);
              console.log('⚠️ Reportes de incidencias cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de incidencias.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
    
        fetchIncidencias();
      }, []);

      useEffect(() => {
        const fetchReservaciones = async () => {
          try {
            const res = await fetch('/api/reportes/reservaciones');
            const json = await res.json();
            
            if (json.ok) {
              setReservaciones(json.data);
              console.log('🎟️ Reportes de reservaciones cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de reservaciones.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
    
        fetchReservaciones();
      }, []);


      useEffect(() => {
        const fetchPersonas = async () => {
          try {
            const res = await fetch('/api/reportes/personas');
            const json = await res.json();
    
            if (json.ok) {
              setPersonas(json.data);
              console.log('👥 Reportes de personas cargados:', json.data);
            } else {
              console.warn('⚠️ Error desde backend:', json.error);
              toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Error al obtener los reportes de personas.',
                life: 3000,
              });
            }
          } catch (err) {
            console.error('❌ Error al conectar con el backend de reportes:', err);
            toast.current?.show({
              severity: 'error',
              summary: 'Error de conexión',
              detail: 'No se pudo conectar con el servidor.',
              life: 3000,
            });
          }
        };
        
        fetchPersonas();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('/api/reportes/clientes');
        const json = await res.json();

        if (json.ok) {
          setClientes(json.data);
          console.log('🧍‍♂️ Reportes de clientes cargados:', json.data);
        } else {
          console.warn('⚠️ Error desde backend:', json.error);
          toast.current?.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Error al obtener los reportes de clientes.',
            life: 3000,
          });
        }
      } catch (err) {
        console.error('❌ Error al conectar con el backend de reportes:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error de conexión',
          detail: 'No se pudo conectar con el servidor.',
          life: 3000,
        });
      }
    };

    fetchClientes();
  }, []);


  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await fetch('/api/reportes/empleados');
        const json = await res.json();
  
        if (json.ok) {
          setEmpleados(json.data);
          console.log('👥 Reportes de empleados cargados:', json.data);
        } else {
          console.warn('⚠️ Error desde backend:', json.error);
          toast.current?.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Error al obtener los reportes de empleados.',
            life: 3000,
          });
        }
      } catch (err) {
        console.error('❌ Error al conectar con el backend de reportes:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error de conexión',
          detail: 'No se pudo conectar con el servidor.',
          life: 3000,
        });
      }
    };
  
    fetchEmpleados();
  }, []);
      
    return (
      <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Reportes Generales</h2>
        <Toast ref={toast} />
    
        {/* ==================== BARRA DE BÚSQUEDA Y EXPORTACIÓN GENERAL ==================== */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6 mb-8">
        <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Exportación General</h3>
              <p className="text-sm text-gray-600">Búsqueda por módulo</p>
            </div>
    
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              {/* Búsqueda */}
              <span className="p-input-icon-left flex-1 sm:flex-initial">
                <i className="pi pi-search" />
                <InputText
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar módulo..."
                  className="w-full sm:w-64"
                />
              </span>
    
              {/* Botón Exportar con menú desplegable */}
              <div className="relative">
                <Button
                  label="Exportar como"
                  icon="pi pi-download"
                  className="p-button-info w-full sm:w-auto"
                  onClick={(e) => {
                    const menu = document.getElementById('export-menu');
                    if (menu) menu.classList.toggle('hidden');
                  }}
                />
                
                {/* Menú desplegable - CORREGIDO: ahora va hacia la derecha */}
                <div
                  id="export-menu"
                  className="hidden absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      exportReportesPDF();
                      document.getElementById('export-menu')?.classList.add('hidden');
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                  >
                    <i className="pi pi-file-pdf text-red-500 mr-3 text-lg"></i>
                    <span className="font-medium">PDF</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      exportReportesExcel();
                      document.getElementById('export-menu')?.classList.add('hidden');
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors border-t"
                  >
                    <i className="pi pi-file-excel text-green-600 mr-3 text-lg"></i>
                    <span className="font-medium">Excel (XLSX)</span>
                  </button>
                  
                  <button
                   onClick={() => {
                    exportReportesCSV(buildAllTablesForExport());
                    document.getElementById('export-menu')?.classList.add('hidden');
                  }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-t"
                  >
                    <i className="pi pi-file text-blue-500 mr-3 text-lg"></i>
                    <span className="font-medium">CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
    
        {/* ==================== MÓDULOS DE REPORTES ==================== */}
        <div className="space-y-8">
          {/* Boletos */}
          {(!searchText || 'boletos'.includes(searchText.toLowerCase())) && (
            <div>
           <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Boletos</h2>
            <ReportTable
              title="Reportes de Boletos"
              data={boletos}
              columns={[
                { field: 'Codigo_Ticket', header: 'Código Ticket' },
                { field: 'Cliente', header: 'Cliente' },
                { field: 'Cedula', header: 'Cédula' },
                { field: 'Telefono', header: 'Teléfono' },
                { field: 'Origen', header: 'Origen' },
                { field: 'Destino', header: 'Destino' },
                { field: 'Autobus', header: 'Unidad' },
                { field: 'Numero_Asiento', header: 'Asiento' },
                { field: 'MetodoPago', header: 'Método de Pago' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Precio_Total', header: 'Precio Total (Lps)' },
                { field: 'Fecha_Hora_Compra', header: 'Fecha Compra' },
              ]}
              onView={(row) => abrirDetalle('Boletos', row)}
            />
            </div>
          )}
          {/* Encomiendas */}
          {(!searchText || 'encomiendas'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Encomiendas</h2>
            <ReportTable
              title="Reportes de Encomiendas"
              data={encomiendas}
              columns={[
                { field: 'Id_Encomiendas_PK', header: 'ID' },
                { field: 'Cliente', header: 'Cliente' },
                { field: 'Origen', header: 'Origen' },
                { field: 'Destino', header: 'Destino' },
                { field: 'Costo', header: 'Costo (Lps)' },
                { field: 'Descripcion', header: 'Descripción' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Fecha_Realizada', header: 'Fecha Realizada' },
              ]}
              onView={(row) => abrirDetalle('Encomiendas', row)}
            />
            </div>
          )}
    
          {/* Rutas */}
          {(!searchText || 'rutas'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Rutas</h2>
            <ReportTable
              title="Reportes de Rutas"
              data={rutas}
              columns={[
                { field: 'Id_Ruta_PK', header: 'ID Ruta' },
                { field: 'Origen', header: 'Origen' },
                { field: 'Destino', header: 'Destino' },
                { field: 'Distancia', header: 'Distancia (km)' },
                { field: 'Tiempo_Estimado', header: 'Tiempo Estimado' },
                { field: 'Precio', header: 'Precio (Lps)' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Descripcion', header: 'Descripción' },
              ]}
              onView={(row) => abrirDetalle('Rutas', row)}
            />
            </div>
          )}
    
          {/* Mantenimientos */}
          {(!searchText || 'mantenimientos'.includes(searchText.toLowerCase()) || 'mantenimiento'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Mantenimientos</h2>
            <ReportTable
              title="Reportes de Mantenimientos"
              data={mantenimientos}
              columns={[
                { field: 'Id_Mantenimiento_PK', header: 'ID' },
                { field: 'Placa', header: 'Unidad' },
                { field: 'Tipo_Mantenimiento', header: 'Tipo' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Fecha_Programada', header: 'Fecha Programada' },
                { field: 'Fecha_Realizada', header: 'Fecha Realizada' },
                { field: 'Proximo_Mantenimiento', header: 'Próximo Mantenimiento' },
                { field: 'Kilometraje', header: 'Kilometraje' },
                { field: 'Taller', header: 'Taller' },
                { field: 'Repuestos', header: 'Repuestos' },
                { field: 'Costo_Total', header: 'Costo (Lps)' },
              ]}
              onView={(row) => abrirDetalle('Mantenimiento', row)}
            />
            </div>
          )}
    
          {/* Incidencias */}
          {(!searchText || 'incidencias'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Incidencias</h2>
            <ReportTable
              title="Reportes de Incidencias"
              data={incidencias}
              columns={[
                { field: 'Id_Incidencia_PK', header: 'ID' },
                { field: 'Usuario', header: 'Usuario' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Asunto', header: 'Asunto' },
                { field: 'Descripcion', header: 'Descripción' },
                { field: 'Fecha_Creacion', header: 'Creada' },
              ]}
              onView={(row) => abrirDetalle('Incidencias', row)}
            />
            </div>
          )}
    
          {/* Reservaciones */}
          {(!searchText || 'reservaciones'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Reservaciones</h2>
            <ReportTable
              title="Reportes de Reservaciones"
              data={reservaciones}
              columns={[
                { field: 'Id_Reserva_PK', header: 'ID' },
                { field: 'Cliente', header: 'Cliente' },
                { field: 'Tipo_Reserva', header: 'Tipo' },
                { field: 'Estado', header: 'Estado' },
                { field: 'Fecha_Reserva', header: 'Fecha de Reserva' },
                { field: 'Asiento', header: 'Asiento' },
              ]}
              onView={(row) => abrirDetalle('Reservaciones', row)}
            />
            </div>
          )}
    
          {/* Unidades */}
          {(!searchText || 'unidades'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Unidades</h2>
            <ReportTable
              title="Reportes de Unidades"
              data={unidades}
              columns={[
                { field: 'placa', header: 'Placa' },
                { field: 'marca', header: 'Marca' },
                { field: 'modelo', header: 'Modelo' },
                { field: 'asientos', header: 'Asientos' },
                { field: 'descripcion', header: 'Descripción' },
                { field: 'anio', header: 'Año' },
                { field: 'estado', header: 'Estado' },
              ]}
              onView={(row) => abrirDetalle('Vehículos', row)}
            />
            </div>
          )}
         
          {/* Clientes */}
          {(!searchText || 'clientes'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Clientes</h2>
            <ReportTable
              title="Reportes de Clientes"
              data={clientes}
              columns={[
                { field: 'Id_Cliente', header: 'ID Cliente' },
                { field: 'Nombre_Completo', header: 'Nombre Completo' },
                { field: 'DNI', header: 'DNI' },
                { field: 'Telefono', header: 'Teléfono' },
                { field: 'Estado', header: 'Estado' },
              ]}
              onView={(row) => abrirDetalle('Clientes', row)}
            />
            </div>
          )}
    
          {/* Personas */}
          {(!searchText || 'personas'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Personas</h2>
            <ReportTable
              title="Reportes de Personas"
              data={personas}
              columns={[
                { field: 'Id_Persona', header: 'ID' },
                { field: 'Nombres', header: 'Nombres' },
                { field: 'Apellidos', header: 'Apellidos' },
                { field: 'DNI', header: 'DNI' },
                { field: 'Telefono', header: 'Teléfono' },
                { field: 'Genero', header: 'Género' },
                { field: 'Estado', header: 'Estado' },
              ]}
              onView={(row) => abrirDetalle('Personas', row)}
            />
            </div>
          )}

                {/* Empleados */}
          {(!searchText || 'empleados'.includes(searchText.toLowerCase())) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes de Empleados</h2>
              <ReportTable
                title="Reportes de Empleados"
                data={empleados}
                columns={[
                  { field: 'Id_Empleado_PK', header: 'ID' },
                  { field: 'Empleado', header: 'Empleado' },
                  { field: 'DNI', header: 'DNI' },
                  { field: 'Telefono', header: 'Teléfono' },
                  { field: 'Cargo', header: 'Cargo' },
                  { field: 'Estado', header: 'Estado' },
                  { field: 'Fecha_Contratacion', header: 'Fecha Contratación' },
                  { field: 'Horario', header: 'Horario' },
                ]}
                onView={(row) => abrirDetalle('Empleados', row)}
              />
            </div>
          )}
        </div>
    
        {/* Modal de Detalle */}
        <Dialog
          header={`Detalle - ${detalleInfo?.seccion ?? ''}`}
          visible={detalleOpen}
          style={{ width: '90vw', maxWidth: '700px' }}
          onHide={() => setDetalleOpen(false)}
          className="shadow-2xl"
        >
          {detalleInfo?.row ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {Object.entries(detalleInfo.row).map(([k, v]) => (
                <div key={k} className="border-b pb-2">
                  <div className="text-xs text-gray-500 uppercase font-semibold">{k}</div>
                  <div className="text-sm text-gray-800 mt-1">{String(v ?? '-')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-8">No hay datos disponibles.</p>
          )}
        </Dialog>
      </div>
    );
}


export default ReportesPage;
