/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import React, { useContext, useEffect, useState } from 'react';
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
      tension: 0.4,
    },
    {
      label: 'Encomiendas Entregadas',
      data: [90, 110, 130, 160, 140, 120, 110],
      fill: false,
      backgroundColor: '#00bb7e',
      borderColor: '#00bb7e',
      tension: 0.4,
    },
  ],
};

const Dashboard = () => {
  const { layoutConfig } = useContext(LayoutContext);

  // 🔹 Estados globales
  const [rol, setRol] = useState<string | null>(null);
  const [lineOptions, setLineOptions] = useState<ChartOptions>({});
  const [rutasActivas, setRutasActivas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [clientesActivos, setClientesActivos] = useState({ total: 0, porcentaje: 0 });
  const [encomiendas, setEncomiendas] = useState({ total: 0, porcentaje: 0 });
  const [saludo, setSaludo] = useState<string>('');
  const [nombreUsuario, setNombreUsuario] = useState<string>('Administrador');

  // 🔹 Efecto inicial
  useEffect(() => {
    const rolStorage = localStorage.getItem('rolUsuario');
    const nombre = localStorage.getItem('nombreUsuario') || 'Administrador';
    setRol(rolStorage);
    setNombreUsuario(nombre);

    // Saludo dinámico
    const horas = new Date().getHours();
    if (horas >= 5 && horas < 12) setSaludo('Buenos días');
    else if (horas >= 12 && horas < 18) setSaludo('Buenas tardes');
    else setSaludo('Buenas noches');
  }, []);

  // 🔹 Configuración de tema gráfico
  useEffect(() => {
    const light = {
      plugins: { legend: { labels: { color: '#495057' } } },
      scales: {
        x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
        y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
      },
    };

    const dark = {
      plugins: { legend: { labels: { color: '#ebedef' } } },
      scales: {
        x: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160,167,181,.3)' } },
        y: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160,167,181,.3)' } },
      },
    };

    setLineOptions(layoutConfig.colorScheme === 'light' ? light : dark);
  }, [layoutConfig.colorScheme]);

  // 🔹 Cargar datos de API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/rutas-publico');
        const data = await res.json();
        setRutasActivas(Array.isArray(data.items) ? data.items.length : 0);
      } catch {
        setRutasActivas(0);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Datos de clientes y encomiendas
  useEffect(() => {
    const cargarEncomiendas = async () => {
      try {
        const res = await fetch('/api/reservas?tipo=ENCOMIENDA&limit=1000', { cache: 'no-store' });
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const total = items.length;
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;

        const esteMes = items.filter((e: any) => new Date(e.fecha).getMonth() === mesActual).length;
        const anterior = items.filter((e: any) => new Date(e.fecha).getMonth() === mesAnterior).length;
        const porcentaje = anterior > 0 ? Math.round(((esteMes - anterior) / anterior) * 100) : 100;
        setEncomiendas({ total, porcentaje });
      } catch {}
    };

    const cargarClientes = async () => {
      try {
        const res = await fetch('/api/clientes?estado=1', { cache: 'no-store' });
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const total = items.length;

        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;

        const esteMes = items.filter(
          (c: any) => new Date(c.fecha_creacion || c.Fecha_Registro || '').getMonth() === mesActual
        ).length;

        const anterior = items.filter(
          (c: any) => new Date(c.fecha_creacion || c.Fecha_Registro || '').getMonth() === mesAnterior
        ).length;

        const porcentaje = anterior > 0 ? Math.round(((esteMes - anterior) / anterior) * 100) : 100;
        setClientesActivos({ total, porcentaje });
      } catch {}
    };

    cargarEncomiendas();
    cargarClientes();
  }, []);

  // Si no hay rol todavía, no renderizar
  if (rol === null) return null;

  // ===================================================
  // 🟢 DASHBOARD CLIENTE / USUARIO
  // ===================================================
  if (rol === 'Cliente' || rol === 'Usuario') {
    return (
      <div className="p-5 surface-ground min-h-screen">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">
            ¡Hola, {nombreUsuario}! 
          </h2>
          <p className="text-600 text-lg">
            Bienvenido al panel del cliente.
            Accede fácilmente a tus opciones de viaje y soporte.
          </p>
        </div>

        {/* Tarjetas principales */}
        <div className="grid justify-content-center">
          <div className="col-12 md:col-6 lg:col-3">
            <Link href="/cliente/rutas" className="no-underline">
              <div
                className="card h-full hover:shadow-5 transition-all cursor-pointer text-center p-4 border-round-2xl"
                style={{ background: '#E8F1FF', borderTop: '6px solid #004AAD' }}
              >
                <i className="pi pi-map text-blue-700 text-5xl mb-3"></i>
                <h4 className="text-blue-800 font-semibold mb-2">Ver rutas disponibles</h4>
                <p className="text-blue-700 text-sm">
                  Explora los destinos y horarios disponibles.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <Link href="/cliente/reservacion/nueva" className="no-underline">
              <div
                className="card h-full hover:shadow-5 transition-all cursor-pointer text-center p-4 border-round-2xl"
                style={{ background: '#FFF8E1', borderTop: '6px solid #FFB703' }}
              >
                <i className="pi pi-calendar-plus text-yellow-700 text-5xl mb-3"></i>
                <h4 className="text-yellow-800 font-semibold mb-2">Nueva reservación</h4>
                <p className="text-yellow-700 text-sm">
                  Reserva tu próximo viaje de forma rápida y segura.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <Link href="/cliente/reservacion/mis-reservaciones" className="no-underline">
              <div
                className="card h-full hover:shadow-5 transition-all cursor-pointer text-center p-4 border-round-2xl"
                style={{ background: '#F3E8FF', borderTop: '6px solid #6A0DAD' }}
              >
                <i className="pi pi-ticket text-purple-700 text-5xl mb-3"></i>
                <h4 className="text-purple-800 font-semibold mb-2">Mis reservaciones</h4>
                <p className="text-purple-700 text-sm">
                  Consulta y gestiona tus boletos anteriores.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <Link href="/cliente/incidencias-soporte" className="no-underline">
              <div
                className="card h-full hover:shadow-5 transition-all cursor-pointer text-center p-4 border-round-2xl"
                style={{ background: '#FFEAEA', borderTop: '6px solid #D00000' }}
              >
                <i className="pi pi-exclamation-triangle text-red-700 text-5xl mb-3"></i>
                <h4 className="text-red-800 font-semibold mb-2">Incidencias y soporte</h4>
                <p className="text-red-700 text-sm">
                  Reporta problemas o solicita asistencia personalizada.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-600">
          <i className="pi pi-bus text-blue-500 mr-2"></i>
          <span>
            Gracias por confiar en Transportes Saenz. ¡Tu viaje empieza aquí!
          </span>
        </div>
      </div>
    );
  }

  // ===================================================
  // 🟣 DASHBOARD ADMINISTRADOR / OPERADOR
  // ===================================================
  return (
    <div className="p-5 surface-ground min-h-screen">
      {/* Header con saludo dinámico */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold text-blue-800 mb-1"
          style={{ animation: 'fadeIn 1s ease-in-out' }}
        >
          {saludo}, {nombreUsuario} 
        </h2>
        <p className="text-600 text-lg mb-1">
          Bienvenido al panel administrativo de{' '}
          Transportes Saenz.
        </p>
        
      </div>

      {/* Tarjetas métricas */}
      <div className="grid mb-5">
        <div className="col-12 md:col-4">
          <div
            className="card h-full border-round-2xl shadow-2 text-center p-4"
            style={{ borderTop: '6px solid #004AAD', minHeight: '180px' }}
          >
            <i className="pi pi-send text-blue-600 text-4xl mb-2"></i>
            <h4 className="text-900 mb-1">Viajes Programados</h4>
            <h2 className="text-900 font-bold mb-2">120</h2>
            <p className="text-green-600 font-medium">+12 nuevos esta semana</p>
          </div>
        </div>

        <div className="col-12 md:col-4">
          <div
            className="card h-full border-round-2xl shadow-2 text-center p-4"
            style={{ borderTop: '6px solid #FFB703', minHeight: '180px' }}
          >
            <i className="pi pi-box text-yellow-600 text-4xl mb-2"></i>
            <h4 className="text-900 mb-1">Encomiendas</h4>
            <h2 className="text-900 font-bold mb-2">{encomiendas.total}</h2>
            <p className="text-green-600 font-medium">
              +{encomiendas.porcentaje}% vs. mes anterior
            </p>
          </div>
        </div>

        <div className="col-12 md:col-4">
          <div
            className="card h-full border-round-2xl shadow-2 text-center p-4"
            style={{ borderTop: '6px solid #6A0DAD', minHeight: '180px' }}
          >
            <i className="pi pi-users text-purple-600 text-4xl mb-2"></i>
            <h4 className="text-900 mb-1">Clientes Activos</h4>
            <h2 className="text-900 font-bold mb-2">{clientesActivos.total}</h2>
            <p className="text-green-600 font-medium">
              +{clientesActivos.porcentaje}% vs. mes anterior
            </p>
          </div>
        </div>
      </div>

      {/* Resumen + Accesos Rápidos */}
      <div className="grid">
        <div className="col-12 lg:col-6">
          <div className="card border-round-2xl shadow-3 h-full p-4">
            <h5 className="text-blue-800 mb-4 flex align-items-center gap-2">
              <i className="pi pi-chart-line text-blue-600"></i>
              Resumen de Actividad
            </h5>
            <Chart type="line" data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="col-12 lg:col-6">
          <div className="card border-round-2xl shadow-3 h-full p-4">
            <h5 className="text-blue-800 mb-4 flex align-items-center gap-2">
              <i className="pi pi-bolt text-blue-600"></i>
              Accesos Rápidos
            </h5>
            <div className="flex flex-column gap-3">
              <Link href="/reportes">
                <Button
                  label="Ver reportes"
                  icon="pi pi-chart-bar"
                  className="w-full"
                  style={{ backgroundColor: '#004AAD', border: 'none', fontWeight: '600' }}
                />
              </Link>

              <Link href="/admin/incidencias-sop">
                <Button
                  label="Ver incidencias recientes"
                  icon="pi pi-exclamation-circle"
                  className="p-button-info w-full"
                  style={{ fontWeight: '600' }}
                />
              </Link>

              <Link href="/pages/Ventas">
                <Button
                  label="Gestionar boletos"
                  icon="pi pi-ticket"
                  className="w-full"
                  style={{ backgroundColor: '#6A0DAD', border: 'none', fontWeight: '600' }}
                />
              </Link>

              <Link href="/cliente/rutas">
                <Button
                  label="Ver rutas activas"
                  icon="pi pi-map"
                  className="p-button-success w-full"
                  style={{ fontWeight: '600' }}
                />
              </Link>

              <Link href="/admin/reservaciones">
                <Button
                  label="Programar viaje"
                  icon="pi pi-calendar-plus"
                  className="p-button-warning w-full"
                  style={{ fontWeight: '600' }}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animación del saludo */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
