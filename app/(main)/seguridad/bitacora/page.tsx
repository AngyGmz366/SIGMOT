'use client';
import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import * as XLSX from 'xlsx';

type Registro = {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  objeto: string;
  descripcion: string;
  _fechaObj?: Date;
};

type Option = { label: string; value: string };

export default function BitacoraPage() {
  const [bitacora, setBitacora] = useState<Registro[]>([]);
  const [todo, setTodo] = useState<Registro[]>([]);
  const [detalle, setDetalle] = useState<Registro | null>(null);
  const [usuarios, setUsuarios] = useState<Option[]>([]);
  const [acciones, setAcciones] = useState<Option[]>([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
    usuario: null as string | null,
    accion: null as string | null,
  });

  // 🔹 Cargar registros desde el backend (SP: sp_bitacora_listar)
  useEffect(() => {
    const cargarBitacora = async () => {
      try {
        const res = await fetch('/api/seguridad/bitacora', { cache: 'no-store' });
        const data = await res.json();

        if (!data.ok) throw new Error(data.error || 'Error al cargar bitácora');

        const registros: Registro[] = (data.items || [])
          .map((r: any): Registro => ({
            id: Number(r.id),
            fecha: r.fecha,
            usuario: r.usuario || 'Desconocido',
            accion: r.accion || '-',
            objeto: r.objeto || '-',
            descripcion: r.descripcion || '',
            _fechaObj: new Date(r.fecha),
          }))
          .sort((a: { _fechaObj: { getTime: () => any; }; }, b: { _fechaObj: { getTime: () => any; }; }) => (b._fechaObj?.getTime() || 0) - (a._fechaObj?.getTime() || 0));

        setTodo(registros);
        setBitacora(registros);

        // 🔹 Generar filtros únicos
        const usuariosSet: Option[] = Array.from(
          new Set(registros.map((r: Registro) => r.usuario))
        ).map((u: string) => ({ label: u, value: u }));

        const accionesSet: Option[] = Array.from(
          new Set(registros.map((r: Registro) => r.accion))
        ).map((a: string) => ({ label: a, value: a }));

        setUsuarios(usuariosSet);
        setAcciones(accionesSet);
      } catch (err) {
        console.error('❌ Error al cargar bitácora:', err);
      }
    };

    cargarBitacora();
  }, []);

  // 🔹 Funciones auxiliares
  const setStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const setEnd = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const dentroDeRango = (d: Date, ini: Date | null, fin: Date | null) => {
    if (ini && d < setStart(ini)) return false;
    if (fin && d > setEnd(fin)) return false;
    return true;
  };

  // 🔹 Aplicar filtros
  const filtrar = () => {
    const { fechaInicio, fechaFin, usuario, accion } = filtros;
    const filtrados = todo.filter((r) => {
      const pasaFecha = r._fechaObj ? dentroDeRango(r._fechaObj, fechaInicio, fechaFin) : true;
      const pasaUsuario = usuario ? r.usuario === usuario : true;
      const pasaAccion = accion ? r.accion === accion : true;
      return pasaFecha && pasaUsuario && pasaAccion;
    });
    setBitacora(filtrados);
  };

  // 🔹 Formatear fecha local
  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // 🔹 Exportar tabla como PDF (vista imprimible)
  const exportarPDF = () => {
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bitácora - SIGMOT</title>
          <style>
            body { font-family: Arial; padding: 20px; background: #f8f9fa; }
            h2 { color: #1976d2; }
            table { width: 100%; border-collapse: collapse; background: white; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
            th { background: #1976d2; color: white; text-align: left; }
            tr:nth-child(even) { background: #f2f6fc; }
          </style>
        </head>
        <body>
          <h2>Bitácora - Transportes Saenz</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Objeto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${bitacora
                .map(
                  (r) => `
                <tr>
                  <td>${formatearFecha(r.fecha)}</td>
                  <td>${r.usuario}</td>
                  <td>${r.accion}</td>
                  <td>${r.objeto}</td>
                  <td>${r.descripcion}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
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

            //Exportar a Excel
      const exportarExcel = () => {
        // Preparar datos para Excel
        const datosExcel = bitacora.map((r) => ({
          'Fecha': formatearFecha(r.fecha),
          'Usuario': r.usuario,
          'Acción': r.accion,
          'Objeto': r.objeto,
          'Descripción': r.descripcion,
        }));
      
        // Crear hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(datosExcel);
        
        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bitácora');

        // Generar nombre del archivo con fecha actual
        const fecha = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `Bitacora_${fecha}.xlsx`;

        // Descargar archivo
        XLSX.writeFile(wb, nombreArchivo);
      };

  // 🔹 Render principal
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bitácora del Sistema</h2>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Calendar
          value={filtros.fechaInicio}
          onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.value as Date | null })}
          placeholder="Fecha inicio"
          showIcon
        />
        <Calendar
          value={filtros.fechaFin}
          onChange={(e) => setFiltros({ ...filtros, fechaFin: e.value as Date | null })}
          placeholder="Fecha fin"
          showIcon
        />
        <Dropdown
          value={filtros.usuario}
          options={usuarios}
          onChange={(e) => setFiltros({ ...filtros, usuario: e.value })}
          placeholder="Usuario"
          className="w-full"
        />
        <Dropdown
          value={filtros.accion}
          options={acciones}
          onChange={(e) => setFiltros({ ...filtros, accion: e.value })}
          placeholder="Acción"
          className="w-full"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2 mb-4">
        <Button label="Filtrar" icon="pi pi-search" onClick={filtrar} />
        <Button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportarPDF}
        />
         {/* ✅ NUEVO BOTÓN: Exportar Excel */}
         <Button
          label="Exportar Excel"
          icon="pi pi-file-excel"
          className="p-button-success"
          onClick={exportarExcel}
          />
      </div>

      {/* Tabla principal */}
      <DataTable
        value={bitacora}
        paginator
        rows={10}
        responsiveLayout="scroll"
        stripedRows
        emptyMessage="No se encontraron registros de bitácora."
      >
        <Column
          field="fecha"
          header="Fecha"
          sortable
          body={(r: Registro) => formatearFecha(r.fecha)}
        />
        <Column field="usuario" header="Usuario" sortable />
        <Column field="accion" header="Acción" sortable />
        <Column field="objeto" header="Objeto" sortable />
        <Column
          body={(r: Registro) => (
            <Button
              label="Ver Detalle"
              icon="pi pi-eye"
              text
              onClick={() => setDetalle(r)}
            />
          )}
        />
      </DataTable>

      {/* Modal detalle */}
      <Dialog
        visible={!!detalle}
        onHide={() => setDetalle(null)}
        header="Detalle de Bitácora"
        style={{ width: '500px' }}
      >
        {detalle && (
          <div className="p-3">
            <p><b>Fecha:</b> {formatearFecha(detalle.fecha)}</p>
            <p><b>Usuario:</b> {detalle.usuario}</p>
            <p><b>Acción:</b> {detalle.accion}</p>
            <p><b>Objeto:</b> {detalle.objeto}</p>
            <p><b>Descripción:</b> {detalle.descripcion}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
