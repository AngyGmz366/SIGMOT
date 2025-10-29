'use client';
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from './Inicio.module.scss';
import Link from 'next/link';

export default function Inicio() {
  return (
    <div className={styles.inicio}>
      <Header /> {/* ✅ Header modular */}

      {/* Hero principal */}
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroContent}>
          <img
            src="/demo/images/logo.png"
            alt="Logo Transportes Saenz"
            className={styles.logo}
          />
          <h2>Transportes Saenz</h2>
          <p>
            Una empresa de transporte dedicada a brindarte viajes cómodos, seguros y confiables.
            En Transportes Saenz, combinamos atención, puntualidad y calidad para ofrecerte una
            experiencia de viaje única hacia cualquier destino.
          </p>
          <Link href="/auth/rutas" className={styles.heroButton}>
            Descubre Nuestras Rutas
          </Link>
        </div>
      </section>

      {/* Nuestras Unidades */}
      <section id="unidades" className={styles.unidades}>
        <h2>Nuestras Unidades</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <img src="/demo/images/galleria/unidad1.jpeg" alt="Unidad 1" />
            <p>Comodidad y tecnología</p>
          </div>
          <div className={styles.card}>
            <img src="/demo/images/galleria/unidad2.jpeg" alt="Unidad 2" />
            <p>Seguridad garantizada</p>
          </div>
          <div className={styles.card}>
            <img src="/demo/images/galleria/unidad3.jpg" alt="Unidad 3" />
            <p>Capacidad y confort</p>
          </div>
        </div>
      </section>

      {/* Servicios / Por qué elegirnos */}
      <section id="servicios" className={styles.servicios}>
        <h2>¿Por qué elegirnos?</h2>
        <div className={styles.serviciosGrid}>
          <div className={styles.servicio}>
            <i className="fas fa-bus"></i>
            <h3>Transporte de Pasajeros</h3>
            <p>
              Unidades modernas y seguras con conductores capacitados para ofrecerte la mejor
              experiencia de viaje.
            </p>
          </div>
          <div className={styles.servicio}>
            <i className="fas fa-truck"></i>
            <h3>Transporte de Carga</h3>
            <p>
              Movemos tu mercancía con puntualidad y cuidado, garantizando la entrega segura de tus
              productos.
            </p>
          </div>
          <div className={styles.servicio}>
            <i className="fas fa-box"></i>
            <h3>Encomiendas</h3>
            <p>Envíos confiables a todo el país con seguimiento y servicio rápido.</p>
          </div>
        </div>
      </section>

      {/* Horarios y Contacto */}
      <section id="contacto" className={styles.contacto}>
        <div className={styles.contactoWrapper}>
          <div className={styles.horarios}>
            <h3>Horarios de Atención</h3>
            <p><i className="pi pi-clock"></i>Lunes a Sábado: 5:00 AM - 6:00 PM</p>
            <p><i className="pi pi-clock"></i>Domingos: 5:00 AM - 5:00 PM</p>
          </div>

          <div className={styles.info}>
            <h3>Contáctanos</h3>
            <p>
              <i className="pi pi-phone"></i> +504  2243-2053
            </p>
            <p>
              <i className="pi pi-map-marker"></i> Barrio Concepción en Comayaguela.
            </p>
          </div>
        </div>
      </section>

      <Footer /> {/* ✅ Footer modular */}
    </div>
  );
}
