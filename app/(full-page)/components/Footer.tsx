import styles from './Footer.module.scss';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* Logo + Descripción */}
        <div>
          <Link href="/auth/Inicio" className={styles.logo}>
            <img src="/demo/images/logo.png" alt="Transportes Sáenz" />
            <span>Transportes Saenz</span>
          </Link>
          <p>Más de 25 años conectando destinos con seguridad y confianza.</p>
        </div>

        {/* Enlaces rápidos */}
        <div>
          <h4>Enlaces rápidos</h4>
          <Link href="/auth/Inicio">Inicio</Link>
          <Link href="/auth/nosotros">Nosotros</Link>
          <Link href="/auth/rutas">Rutas</Link>
        </div>

        {/* Contacto */}
        <div>
          <h4>Contacto</h4>
          <p>
            📍 Barrio Concepción en Comayaguela, entre 12 y 13 calle, 8 avenida,
            antiguo local de Transportes Kamaldy.
          </p>
          <p>📞 +504 9950-0458</p>
          <p>📞 2243-2053 (Tegucigalpa)</p>
          <p>📞 2516-2285 (San Pedro Sula)</p>
          <p>📧 info@transportessaenz.hn</p>
        </div>

        {/* Redes Sociales */}
        <div>
          <h4>Redes Sociales</h4>
          <div className={styles.socialLinks}>
            <a
              href="https://www.facebook.com/saenzgroup"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="pi pi-facebook"></i>
            </a>
            <a
              href="https://www.instagram.com/transportessaenz/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="pi pi-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        © 2025 Transportes Saenz | Desarrollado con amor en Honduras 🇭🇳
      </div>
    </footer>
  );
}
