'use client';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.scss';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/auth/Inicio" className={styles.logo}>
          <img src="/demo/images/logo.png" alt="Transportes Sáenz" />
          <span className="text-white text-xl font-bold">Transportes Saenz</span>
        </Link>
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <Link href="/auth/Inicio">Inicio</Link>
          <Link href="/auth/nosotros">Nosotros</Link>
          <Link href="/auth/rutas">Rutas</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/auth/login" className={styles.login}>Iniciar Sesión</Link>
          <Link href="/auth/Register" className={styles.register}>Registrarse</Link>
        </div>

        <button className={styles.toggle} onClick={() => setMenuOpen(!menuOpen)}>
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </header>
  );
}

