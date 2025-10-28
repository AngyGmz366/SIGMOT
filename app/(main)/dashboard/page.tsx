/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
// Make sure the path and filename are correct and match the actual file location and casing
import { LayoutContext } from '../../../layout/context/layoutcontext';

import Link from 'next/link';
import { ChartData, ChartOptions } from 'chart.js';

const lineData: ChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    datasets: [
        {
            label: 'Viajes Realizados',
            data: [120, 150, 180, 210, 190, 170, 160],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Encomiendas Entregadas',
            data: [90, 110, 130, 160, 140, 120, 110],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

const Dashboard = () => {
    const menu1 = useRef<Menu>(null);
    const menu2 = useRef<Menu>(null);
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const [clientesActivos, setClientesActivos] = useState({ total: 0, porcentaje: 0 });


    const [encomiendas, setEncomiendas] = useState({ total: 0, porcentaje: 0 });

useEffect(() => {
    const cargarEncomiendas = async () => {
        try {
            // ✅ Usa tu API existente
            const res = await fetch("/api/reservas?tipo=ENCOMIENDA&limit=1000", { cache: "no-store" });
            const data = await res.json();
            const items = Array.isArray(data?.items) ? data.items : [];

            const total = items.length;

            // 📊 Calculamos % de crecimiento mensual
            const ahora = new Date();
            const mesActual = ahora.getMonth();
            const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;

            const esteMes = items.filter((e: { fecha: string }) => new Date(e.fecha).getMonth() === mesActual).length;
            const anterior = items.filter((e: { fecha: string }) => new Date(e.fecha).getMonth() === mesAnterior).length;


            const porcentaje = anterior > 0 ? Math.round(((esteMes - anterior) / anterior) * 100) : 100;

            setEncomiendas({ total, porcentaje });
        } catch (err) {
            console.error("Error cargando encomiendas:", err);
        }
    };

    cargarEncomiendas();
}, []);



useEffect(() => {
    const cargarClientesActivos = async () => {
        try {
            // 🔹 Pedimos solo los clientes activos (estado=1)
            const res = await fetch("/api/clientes?estado=1", { cache: "no-store" });
            const data = await res.json();
            const items = Array.isArray(data?.items) ? data.items : [];

            const total = items.length;

            // 📈 (opcional) cálculo de crecimiento mensual
            const ahora = new Date();
            const mesActual = ahora.getMonth();
            const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;

            const esteMes = items.filter(
                (c: any) => new Date(c.fecha_creacion || c.Fecha_Registro || "").getMonth() === mesActual
            ).length;

            const anterior = items.filter(
                (c: any) => new Date(c.fecha_creacion || c.Fecha_Registro || "").getMonth() === mesAnterior
            ).length;

            const porcentaje = anterior > 0 ? Math.round(((esteMes - anterior) / anterior) * 100) : 100;

            setClientesActivos({ total, porcentaje });
        } catch (err) {
            console.error("❌ Error cargando clientes activos:", err);
        }
    };

    cargarClientesActivos();
}, []);


    const applyLightTheme = () => {
        setLineOptions({
            plugins: {
                legend: { labels: { color: '#495057' } }
            },
            scales: {
                x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
                y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } }
            }
        });
    };

    const applyDarkTheme = () => {
        setLineOptions({
            plugins: {
                legend: { labels: { color: '#ebedef' } }
            },
            scales: {
                x: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } },
                y: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } }
            }
        });
    };

    useEffect(() => {
        layoutConfig.colorScheme === 'light' ? applyLightTheme() : applyDarkTheme();
    }, [layoutConfig.colorScheme]);

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Viajes Programados</span>
                            <div className="text-900 font-medium text-xl">120</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-send text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">12 nuevos </span>
                    <span className="text-500">esta semana</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
  <div className="card mb-0">
    <div className="flex justify-content-between mb-3">
      <div>
        <span className="block text-500 font-medium mb-3">Encomiendas</span>
        <div className="text-900 font-medium text-xl">{encomiendas.total}</div>
      </div>
      <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
        <i className="pi pi-box text-orange-500 text-xl" />
      </div>
    </div>
    <span
      className={`font-medium ${
        encomiendas.porcentaje >= 0 ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {encomiendas.porcentaje >= 0 ? '+' : ''}
      {encomiendas.porcentaje}%
    </span>
    <span className="text-500"> vs. mes anterior</span>
  </div>
</div>


            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                          <span className="block text-500 font-medium mb-3">Clientes Activos</span>
                            <div className="text-900 font-medium text-xl">{clientesActivos.total}</div>

                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-cyan-500 text-xl" />
                        </div>
                    </div>
            <span
  className={`font-medium ${
    clientesActivos.porcentaje >= 0 ? 'text-green-500' : 'text-red-500'
  }`}
>
  {clientesActivos.porcentaje >= 0 ? '+' : ''}
  {clientesActivos.porcentaje}%
</span>
<span className="text-500"> vs. mes anterior</span>

                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Rutas activas</span>
                            <div className="text-900 font-medium text-xl">2</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-map text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+2 </span>
                    <span className="text-500">nuevas rutas esta semana</span>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Resumen de Actividad</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Accesos rápidos</h5>
                    <div className="flex flex-column gap-3">
                        

                        <Link href="/reportes">
                            <Button
                                label="Ver reportes"
                                icon="pi pi-chart-bar"
                                className="p-button-primary"
                                style={{ backgroundColor: '#ac3ec0ff', border: 'none', width: '60%' }}
                            />
                        </Link>

                        <Link href="/admin/incidencias-sop">
                            <Button label="Ver incidencias recientes" icon="pi pi-exclamation-circle" className="p-button-info" />
                        </Link>
                        {/* NUEVO: Botón de Boletos */}
                        <Link href="/pages/Ventas">
                            <Button label="Gestionar boletos" icon="pi pi-ticket" className="p-button-help" style={{ backgroundColor: '#4f3ec0ff', border: 'none', width: '40%' }}/>
                            
                        </Link>
                        <Link href="/cliente/rutas">
                            <Button label="Ver rutas activas" icon="pi pi-map" className="p-button-success" />
                        </Link>
                        <Link href="/admin/reservaciones">
                            <Button label="Programar viaje" icon="pi pi-calendar-plus" className="p-button-warning" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
