'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from './rutas.module.scss';

interface Ruta {
  id: number;
  origen: string;
  destino: string;
  estado: string;
  tiempoEstimado: string;
  precio: number;
  horarios: string[];
}

export default function Rutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRutas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rutas', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error al obtener rutas (${res.status})`);
      const data = await res.json();

      if (!data.ok) throw new Error(data.error || 'Error en la respuesta del servidor');

      // 🔹 Aquí se cambia de 'items' a 'data' según la estructura correcta de la respuesta
      const rutasFormateadas = (data.data ?? [])
        .filter((r: any) => r.Estado?.toUpperCase() === 'ACTIVA')
        .map((r: any) => ({
          id: r.Id_Ruta_PK || r.id,
          origen: r.Origen || r.origen,
          destino: r.Destino || r.destino,
          estado: r.Estado ?? 'N/A',
          tiempoEstimado: r.Tiempo_Estimado || '00:00:00',
          precio: Number(r.Precio ?? 0),
          horarios: Array.isArray(r.Horarios) ? r.Horarios : [],
        }));

      setRutas(rutasFormateadas);
    } catch (err: any) {
      console.error('❌ Error cargando rutas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  return (
    <>
      <Header />
      <main className={styles.rutas}>
        <h1>Rutas y Horarios</h1>

        {loading && <p className={styles.loading}>Cargando rutas...</p>}
        {error && <p className={styles.error}>⚠️ {error}</p>}

        {!loading && !error && (
          <div className={styles.tabla}>
            <table>
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Tiempo Estimado</th>
                  <th>Precio (Lps)</th>
                  <th>Horarios</th>
                </tr>
              </thead>
              <tbody>
                {rutas.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                      No hay rutas activas actualmente.
                    </td>
                  </tr>
                ) : (
                  rutas.map((ruta) => (
                    <tr key={ruta.id}>
                      <td>{ruta.origen}</td>
                      <td>{ruta.destino}</td>
                      <td>{ruta.tiempoEstimado}</td>
                      <td>L. {ruta.precio.toFixed(2)}</td>
                      <td>
                        {ruta.horarios.length > 0
                          ? ruta.horarios.join(', ')
                          : 'Sin horarios registrados'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}