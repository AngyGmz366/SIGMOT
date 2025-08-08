'use client';
import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

type Registro = {
    fecha: string;           // 'YYYY-MM-DD HH:mm'
    _fechaObj?: Date;        // auxiliar para filtrar por fecha
    usuario: string;
    ip: string;
    navegador: string;
    accion: string;
    objeto: string;
    descripcion: string;
};

export default function Bitacora() {
    const [bitacora, setBitacora] = useState<Registro[]>([]);
    const [todo, setTodo] = useState<Registro[]>([]); // dataset completo (sin filtrar)
    const [filtros, setFiltros] = useState<{ fechaInicio: Date | null; fechaFin: Date | null; usuario: string | null; accion: string | null; }>({
        fechaInicio: null, fechaFin: null, usuario: null, accion: null
    });
    const [detalle, setDetalle] = useState<Registro | null>(null);
    const [usuarios, setUsuarios] = useState<{label:string,value:string}[]>([]);
    const [acciones, setAcciones] = useState<{label:string,value:string}[]>([]);

    useEffect(() => {
        // 📌 Registros de ejemplo adaptados a SIGMOT
        const registrosEjemplo: Registro[] = [
            { fecha: '2025-08-01 08:45', usuario: 'Administrador', ip: '192.168.1.10', navegador: 'Chrome',  accion: 'Crear',     objeto: 'Usuario',               descripcion: 'Se creó el usuario Juan Pérez con rol Analista.' },
            { fecha: '2025-08-02 11:15', usuario: 'Analista',      ip: '192.168.1.15', navegador: 'Edge',    accion: 'Actualizar', objeto: 'Parámetro',            descripcion: 'Se modificó el tiempo de sesión a 30 minutos.' },
            { fecha: '2025-08-03 09:50', usuario: 'Técnico',       ip: '192.168.1.20', navegador: 'Firefox', accion: 'Eliminar',   objeto: 'Registro de Mantenimiento', descripcion: 'Se eliminó el registro de mantenimiento ID #452.' },
            { fecha: '2025-08-03 14:10', usuario: 'Administrador', ip: '192.168.1.10', navegador: 'Chrome',  accion: 'Crear',     objeto: 'Objeto del Sistema',    descripcion: 'Se creó el objeto "Gestión de Vehículos".' },
            { fecha: '2025-08-04 16:25', usuario: 'Auditor',       ip: '192.168.1.30', navegador: 'Safari',  accion: 'Consulta',  objeto: 'Bitácora',              descripcion: 'Se consultaron registros de bitácora filtrados por fecha.' }
        ].map(r => ({ ...r, _fechaObj: parseFecha(r.fecha) }));

        setTodo(registrosEjemplo);
        setBitacora(registrosEjemplo);

        // 📌 Opciones de filtros
        setUsuarios([
            { label: 'Administrador', value: 'Administrador' },
            { label: 'Analista', value: 'Analista' },
            { label: 'Técnico', value: 'Técnico' },
            { label: 'Auditor', value: 'Auditor' }
        ]);

        setAcciones([
            { label: 'Crear', value: 'Crear' },
            { label: 'Actualizar', value: 'Actualizar' },
            { label: 'Eliminar', value: 'Eliminar' },
            { label: 'Consulta', value: 'Consulta' }
        ]);
    }, []);

    const parseFecha = (s: string): Date => {
        // Convierte 'YYYY-MM-DD HH:mm' a Date local
        const [d, t] = s.split(' ');
        const [y, m, day] = d.split('-').map(Number);
        const [hh, mm] = t.split(':').map(Number);
        return new Date(y, (m - 1), day, hh, mm, 0, 0);
    };

    const dentroDeRango = (d: Date, ini: Date | null, fin: Date | null) => {
        if (ini && d < setStart(ini)) return false;
        if (fin && d > setEnd(fin)) return false;
        return true;
    };

    const setStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const setEnd   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const filtrar = () => {
        const { fechaInicio, fechaFin, usuario, accion } = filtros;
        const filtrados = todo.filter(r => {
            const pasaFecha = r._fechaObj ? dentroDeRango(r._fechaObj, fechaInicio, fechaFin) : true;
            const pasaUsuario = usuario ? r.usuario === usuario : true;
            const pasaAccion = accion ? r.accion === accion : true;
            return pasaFecha && pasaUsuario && pasaAccion;
        });
        setBitacora(filtrados);
        // (opcional) console log para depurar, no cambia la vista
        // console.log('Aplicando filtros', filtros, '=>', filtrados.length, 'resultados');
    };

    const exportar = (tipo: 'pdf') => {
        // Exportar la tabla filtrada a una ventana imprimible (el navegador permite "Guardar como PDF")
        if (tipo !== 'pdf') return;

        const htmlTabla = `
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Bitácora</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 16px; }
                    h2 { margin-top: 0; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                    th { background: #f2f2f2; text-align: left; }
                </style>
            </head>
            <body>
                <h2>Bitácora</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>IP</th>
                            <th>Navegador</th>
                            <th>Acción</th>
                            <th>Objeto</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bitacora.map(r => `
                            <tr>
                                <td>${r.fecha}</td>
                                <td>${r.usuario}</td>
                                <td>${r.ip}</td>
                                <td>${r.navegador}</td>
                                <td>${r.accion}</td>
                                <td>${r.objeto}</td>
                                <td>${r.descripcion}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>window.onload = () => { window.print(); }</script>
            </body>
            </html>
        `;

        const w = window.open('', '_blank');
        if (w) {
            w.document.open();
            w.document.write(htmlTabla);
            w.document.close();
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Bitácora</h2>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Calendar value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.value as Date | null })} placeholder="Fecha inicio" />
                <Calendar value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.value as Date | null })} placeholder="Fecha fin" />
                <Dropdown value={filtros.usuario} options={usuarios} onChange={(e) => setFiltros({ ...filtros, usuario: e.value })} placeholder="Usuario" className="w-full" />
                <Dropdown value={filtros.accion} options={acciones} onChange={(e) => setFiltros({ ...filtros, accion: e.value })} placeholder="Acción" className="w-full" />
            </div>

            {/* Botones */}
            <div className="flex gap-2 mb-4">
                <Button label="Filtrar" icon="pi pi-search" onClick={filtrar} />
                <Button label="Exportar PDF" icon="pi pi-file-pdf" className="p-button-danger" onClick={() => exportar('pdf')} />
            </div>

            {/* Tabla */}
            <DataTable value={bitacora} paginator rows={10} responsiveLayout="scroll">
                <Column field="fecha" header="Fecha" />
                <Column field="usuario" header="Usuario" />
                <Column field="ip" header="IP" />
                <Column field="navegador" header="Navegador" />
                <Column field="accion" header="Acción" />
                <Column field="objeto" header="Objeto" />
                <Column body={(row: Registro) => <Button label="Ver Detalle" onClick={() => setDetalle(row)} />} />
            </DataTable>

            {/* Modal Detalle */}
            <Dialog visible={!!detalle} onHide={() => setDetalle(null)} header="Detalle de Bitácora" style={{ width: '500px' }}>
                {detalle && (
                    <div>
                        <p><b>Fecha:</b> {detalle.fecha}</p>
                        <p><b>Usuario:</b> {detalle.usuario}</p>
                        <p><b>IP:</b> {detalle.ip}</p>
                        <p><b>Navegador:</b> {detalle.navegador}</p>
                        <p><b>Acción:</b> {detalle.accion}</p>
                        <p><b>Objeto:</b> {detalle.objeto}</p>
                        <p><b>Descripción:</b> {detalle.descripcion}</p>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
