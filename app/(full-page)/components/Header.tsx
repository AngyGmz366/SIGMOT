'use client';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.scss';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/auth/Inicio" className={styles.logo}>
            <img src="/demo/images/logo.png" alt="Transportes Sáenz" />
            <span className="text-white text-xl font-bold">Transportes Saenz</span>
          </Link>

          {/* Navegación desktop */}
          <nav className={styles.nav}>
            <Link href="/auth/Inicio">Inicio</Link>
            <Link href="/auth/nosotros">Nosotros</Link>
            <Link href="/auth/rutas">Rutas</Link>
          </nav>

          {/* Acciones desktop */}
          <div className={styles.actions}>
            <Link href="/auth/login" className={styles.login}>Iniciar Sesión</Link>
            <Link href="/auth/Register" className={styles.register}>Registrarse</Link>
          </div>

          {/* Acciones móviles (solo botón de Iniciar Sesión) */}
          <div className={styles.mobileActions}>
            <Link href="/auth/login" className={styles.login}>Iniciar Sesión</Link>
          </div>

          {/* Botón hamburguesa */}
          <button className={styles.toggle} onClick={() => setMenuOpen(!menuOpen)}>
            <i className="pi pi-bars"></i>
          </button>
        </div>
      </header>

      {/* Overlay para cerrar el menú */}
      <div 
        className={`${styles.overlay} ${menuOpen ? styles.open : ''}`}
        onClick={closeMenu}
      />

      {/* Menú móvil tipo sidebar */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <button className={styles.closeButton} onClick={closeMenu}>
            <i className="pi pi-times"></i>
          </button>
        </div>
        
        <div className={styles.mobileMenuContent}>
          <Link href="/auth/Inicio" onClick={closeMenu}>Inicio</Link>
          <Link href="/auth/nosotros" onClick={closeMenu}>Nosotros</Link>
          <Link href="/auth/rutas" onClick={closeMenu}>Rutas</Link>
        </div>

        <div className={styles.mobileMenuActions}>
          <Link href="/auth/login" className={styles.login} onClick={closeMenu}>
            Iniciar Sesión
          </Link>
          <Link href="/auth/Register" className={styles.register} onClick={closeMenu}>
            Registrarse
          </Link>
        </div>
      </div>
    </>
  );
}