'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from './nosotros.module.scss';

export default function Nosotros() {
  const [rutasActivas, setRutasActivas] = useState<number>(0);
  const [clientesActivos, setClientesActivos] = useState<number>(0);

  // 🔹 Cargar rutas activas
  const cargarRutasActivas = async () => {
    try {
      const res = await fetch('/api/rutas', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error ${res.status} al obtener rutas`);
      const data = await res.json();

      // Verifica la respuesta para saber si usa "data" o "items"
      console.log("Respuesta de la API de rutas:", data);

      const rutas = Array.isArray(data?.data) ? data.data : []; // Usamos "data" si es necesario
      const activas = rutas.filter((r: any) => r.Estado?.toUpperCase() === 'ACTIVA').length;
      setRutasActivas(activas);
    } catch (err) {
      console.error('❌ Error cargando rutas activas:', err);
      setRutasActivas(0);
    }
  };

  // 🔹 Cargar clientes activos
  const cargarClientesActivos = async () => {
    try {
      const res = await fetch('/api/clientes?estado=1', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error ${res.status} al obtener clientes`);
      const data = await res.json();
      const clientes = Array.isArray(data?.items) ? data.items : [];
      setClientesActivos(clientes.length);
    } catch (err) {
      console.error('❌ Error cargando clientes activos:', err);
      setClientesActivos(0);
    }
  };

  useEffect(() => {
    cargarRutasActivas();
    cargarClientesActivos();
  }, []);

  return (
    <>
      <Header />
      <main className={styles.nosotros}>
        <section className={styles.section}>
          <h1>Sobre Nosotros</h1>
          <p>
            Con más de <strong>25 años</strong> de experiencia en el sector transporte, 
            <span className={styles.brand}> Transportes Saenz </span>
            se ha consolidado como una empresa líder en Honduras, ofreciendo servicios de 
            transporte de pasajeros y carga con los más altos estándares de calidad y seguridad.
          </p>
        </section>

        <section className={styles.misionvision}>
          <div>
            <h2>Misión</h2>
            <p>
              Brindar servicios de transporte seguros, confiables y eficientes, conectando comunidades 
              y facilitando el desarrollo económico y social de nuestro país.
            </p>
          </div>
          <div>
            <h2>Visión</h2>
            <p>
              Ser la empresa de transporte más reconocida y confiable de Honduras, expandiendo nuestra 
              cobertura nacional e internacional con tecnología de vanguardia.
            </p>
          </div>
        </section>

        <section className={styles.stats}>
          <div>
            <h3>25+</h3>
            <span>Años de Experiencia</span>
          </div>
          <div>
            <h3>{rutasActivas}</h3>
            <span>Rutas Activas</span>
          </div>
          <div>
            <h3>{clientesActivos}</h3>
            <span>Clientes Activos</span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}