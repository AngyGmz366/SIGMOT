'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Inicio = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(false);
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha: '',
    pasajeros: '1'
  });
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });

  useEffect(() => {
    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.backdropFilter = 'blur(10px)';
        } else {
          header.style.background = 'var(--white)';
          header.style.backdropFilter = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Corrección 1: Agregar tipos explícitos para los parámetros
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setMobileMenuOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('¡Gracias por tu interés! Nos contactaremos contigo pronto.');
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('¡Mensaje enviado exitosamente! Te responderemos pronto.');
    setContactForm({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    });
  };

  const handleTracking = () => {
    if (trackingCode.trim()) {
      setTrackingResult(true);
      setTimeout(() => {
        document.getElementById('tracking-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      alert('Por favor ingresa un código de guía válido');
    }
  };

  // Corrección 2: Definir tipos para formType y crear tipos de unión
  type FormType = 'booking' | 'contact';
  type FormEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  const handleInputChange = (e: FormEvent, formType: FormType) => {
    const { name, value } = e.target;
    if (formType === 'booking') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'contact') {
      setContactForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-blue: #4090db;
          --secondary-yellow: #e6da73;
          --accent-red: #d14141;
          --text-dark: #333;
          --text-light: #666;
          --bg-light: #f8f9fa;
          --white: #ffffff;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          overflow-x: hidden;
        }

        .header {
          background: var(--white);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-blue);
        }

        .logo img {
          height: 50px;
          width: auto;
          margin-right: 0.5rem;
          object-fit: contain;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          gap: 2rem;
        }

        .nav-menu.active {
          display: flex;
        }

        .nav-menu a {
          text-decoration: none;
          color: var(--text-dark);
          font-weight: 500;
          transition: color 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .nav-menu a:hover {
          color: var(--primary-blue);
        }

        .nav-menu a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 0;
          background: var(--primary-blue);
          transition: width 0.3s ease;
        }

        .nav-menu a:hover::after {
          width: 100%;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .auth-btn-login {
          background: transparent;
          color: var(--primary-blue);
          border: 2px solid var(--primary-blue);
        }

        .auth-btn-login:hover {
          background: var(--primary-blue);
          color: var(--white);
          transform: translateY(-1px);
        }

        .auth-btn-register {
          background: var(--primary-blue);
          color: var(--white);
          border: 2px solid var(--primary-blue);
        }

        .auth-btn-register:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          transform: translateY(-1px);
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--primary-blue);
        }

        .hero {
          background: linear-gradient(135deg, rgba(64, 144, 219, 0.9), rgba(209, 65, 65, 0.7)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%234090db" width="1200" height="600"/><polygon fill="%23e6da73" points="0,600 400,400 800,500 1200,300 1200,600"/><circle fill="%23d14141" cx="300" cy="200" r="50" opacity="0.7"/><rect fill="%23ffffff" x="500" y="150" width="200" height="100" rx="10" opacity="0.1"/></svg>');
          background-size: cover;
          background-position: center;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--white);
          position: relative;
          margin-top: 80px;
        }

        .hero-content {
          max-width: 800px;
          padding: 2rem;
          animation: fadeInUp 1s ease;
        }

        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-tagline {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 30px;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: var(--secondary-yellow);
          color: var(--text-dark);
        }

        .btn-primary:hover {
          background: #f0e97d;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--white);
          border: 2px solid var(--white);
        }

        .btn-secondary:hover {
          background: var(--white);
          color: var(--primary-blue);
        }

        .section {
          padding: 5rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: var(--primary-blue);
          position: relative;
        }

        .section-title::after {
          content: '';
          width: 80px;
          height: 3px;
          background: var(--secondary-yellow);
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
        }

        .about {
          background: var(--bg-light);
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .about-text h3 {
          color: var(--accent-red);
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .about-text p {
          margin-bottom: 1.5rem;
          color: var(--text-light);
          line-height: 1.8;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: var(--white);
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--primary-blue);
        }

        .stat-label {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .service-card {
          background: var(--white);
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-10px);
        }

        .service-icon {
          font-size: 3rem;
          color: var(--primary-blue);
          margin-bottom: 1rem;
        }

        .service-card h3 {
          color: var(--accent-red);
          margin-bottom: 1rem;
        }

        .routes {
          background: var(--bg-light);
        }

        .routes-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .routes-table {
          background: var(--white);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .routes-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .routes-table th {
          background: var(--primary-blue);
          color: var(--white);
          padding: 1rem;
          text-align: left;
        }

        .routes-table td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .routes-table tr:hover {
          background: var(--bg-light);
        }

        .map-container {
          background: var(--white);
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          text-align: center;
        }

        .map-placeholder {
          width: 100%;
          height: 300px;
          background: linear-gradient(45deg, var(--primary-blue), var(--secondary-yellow));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 1.2rem;
        }

        .booking-form {
          background: var(--white);
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-dark);
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-blue);
        }

        .form-group textarea {
          resize: vertical;
        }

        .tracking {
          background: var(--bg-light);
        }

        .tracking-form {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }

        .tracking-input {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tracking-input input {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 25px;
          font-size: 1rem;
        }

        .btn-track {
          background: var(--accent-red);
          color: var(--white);
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: var(--white);
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          position: relative;
        }

        .testimonial-card::before {
          content: '"';
          font-size: 4rem;
          color: var(--secondary-yellow);
          position: absolute;
          top: -10px;
          left: 20px;
          font-family: serif;
        }

        .testimonial-text {
          margin-bottom: 1.5rem;
          font-style: italic;
          color: var(--text-light);
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-weight: bold;
        }

        .author-info h4 {
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }

        .stars {
          color: var(--secondary-yellow);
        }

        .contact {
          background: var(--bg-light);
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .contact-info {
          background: var(--white);
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--bg-light);
          border-radius: 10px;
        }

        .contact-item i {
          font-size: 1.5rem;
          color: var(--primary-blue);
          margin-right: 1rem;
          width: 30px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .gallery-item {
          aspect-ratio: 4/3;
          background: linear-gradient(45deg, var(--primary-blue), var(--secondary-yellow));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover {
          transform: scale(1.05);
        }

        .footer {
          background: var(--text-dark);
          color: var(--white);
          padding: 3rem 0 1rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          color: var(--secondary-yellow);
          margin-bottom: 1rem;
        }

        .footer-section a {
          color: #ccc;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .footer-section a:hover {
          color: var(--secondary-yellow);
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          transition: transform 0.3s ease;
        }

        .social-links a:hover {
          transform: scale(1.1);
        }

        .footer-bottom {
          border-top: 1px solid #555;
          padding-top: 1rem;
          text-align: center;
          color: #ccc;
        }

        .whatsapp-float {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          text-decoration: none;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        }

        .newsletter-section {
          background: var(--primary-blue);
          color: var(--white);
        }

        .newsletter-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .newsletter-content h2 {
          color: var(--white);
          margin-bottom: 1rem;
        }

        .newsletter-content p {
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
        }

        .newsletter-btn {
          background: var(--secondary-yellow);
          color: var(--text-dark);
          border-radius: 25px;
          padding: 12px 24px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: var(--white);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1rem 0;
          }

          .nav-menu.active {
            display: flex;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .nav-container .auth-buttons {
            display: none;
          }

          .nav-menu .auth-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
            width: 100%;
            padding: 0 2rem;
          }

          .nav-menu .auth-btn {
            width: 100%;
            justify-content: center;
            padding: 10px 20px;
          }

          .hero h1 {
            font-size: 2.5rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .about-content,
          .routes-content,
          .contact-content {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .tracking-input {
            flex-direction: column;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .container {
            padding: 0 1rem;
          }

          .section {
            padding: 3rem 0;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <div className="logo">
           <Link href='/auth/login' className="layout-topbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="/demo/images/login/LOGO-SIGMOT.png"
                    alt="Logo SIGMOT"
                    style={{
                        width: '150px',
                        height: 'auto',
                        maxWidth: 'none'
                    }}
                />
            </Link>
          </div>
          
          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li><a onClick={(e) => handleNavClick(e, '#inicio')}>Inicio</a></li>
            <li><a onClick={(e) => handleNavClick(e, '#nosotros')}>Sobre Nosotros</a></li>
            <li><a onClick={(e) => handleNavClick(e, '#servicios')}>Servicios</a></li>
            <li><a onClick={(e) => handleNavClick(e, '#rutas')}>Rutas y Horarios</a></li>
            <li><a onClick={(e) => handleNavClick(e, '#reservas')}>Reservaciones</a></li>
            <li><a onClick={(e) => handleNavClick(e, '#contacto')}>Contacto</a></li>
          </ul>

          {/* Botones de autenticación para escritorio */}
          <div className="auth-buttons">
            <a 
              href="/auth/login" 
              className="auth-btn auth-btn-login"
              title="Iniciar Sesión"
            >
              <i className="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </a>
            <a 
              href="/auth/Register" 
              className="auth-btn auth-btn-register"
              title="Registrarse"
            >
              <i className="fas fa-user-plus"></i>
              Registrarse
            </a>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </nav>
      </header>

      {/* Banner Principal */}
      <section id="inicio" className="hero">
        <div className="hero-content">
          <h1>Transportes Saenz</h1>
          <p className="hero-tagline">Conectamos destinos, movemos sueños</p>
          <div className="hero-buttons">
            <a onClick={(e) => handleNavClick(e, '#rutas')} className="btn btn-primary">Ver Horarios</a>
            <a onClick={(e) => handleNavClick(e, '#reservas')} className="btn btn-secondary">Cotizar Servicio</a>
            <a onClick={(e) => handleNavClick(e, '#reservas')} className="btn btn-secondary">Reservar</a>
          </div>
        </div>
      </section>

      {/* Resto del contenido permanece igual hasta los formularios */}
      {/* Quiénes Somos */}
      <section id="nosotros" className="section about">
        <div className="container">
          <h2 className="section-title">Quiénes Somos</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Nuestra Historia</h3>
              <p>Con más de 25 años de experiencia en el sector transporte, Transportes Saenz se ha consolidado como una empresa líder en Honduras, ofreciendo servicios de transporte de pasajeros y carga con los más altos estándares de calidad y seguridad.</p>
              
              <h3>Misión</h3>
              <p>Brindar servicios de transporte seguros, confiables y eficientes, conectando comunidades y facilitando el desarrollo económico y social de nuestro país.</p>
              
              <h3>Visión</h3>
              <p>Ser la empresa de transporte más reconocida y confiable de Honduras, expandiendo nuestra cobertura nacional e internacional con tecnología de vanguardia.</p>
            </div>
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">Años de Experiencia</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Rutas Activas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Unidades Modernas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-bus"></i>
              </div>
              <h3>Transporte de Pasajeros</h3>
              <p>Servicio urbano e interurbano con unidades modernas, cómodas y seguras. Conectamos las principales ciudades de Honduras con horarios frecuentes.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-truck"></i>
              </div>
              <h3>Transporte de Carga</h3>
              <p>Movemos tu mercancía con seguridad y puntualidad. Contamos con diferentes tipos de vehículos para adaptarnos a tus necesidades específicas.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-box"></i>
              </div>
              <h3>Encomiendas</h3>
              <p>Servicio de paquetería y encomiendas a nivel nacional. Envía tus paquetes de forma rápida y segura con seguimiento en tiempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rutas y Horarios */}
      <section id="rutas" className="section routes">
        <div className="container">
          <h2 className="section-title">Rutas y Horarios</h2>
          <div className="routes-content">
            <div className="routes-table">
              <table>
                <thead>
                  <tr>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Salida</th>
                    <th>Llegada</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tegucigalpa</td>
                    <td>San Pedro Sula</td>
                    <td>6:00 AM</td>
                    <td>10:30 AM</td>
                    <td>L. 180</td>
                  </tr>
                  <tr>
                    <td>San Pedro Sula</td>
                    <td>La Ceiba</td>
                    <td>8:00 AM</td>
                    <td>11:00 AM</td>
                    <td>L. 120</td>
                  </tr>
                  <tr>
                    <td>Tegucigalpa</td>
                    <td>Choluteca</td>
                    <td>7:30 AM</td>
                    <td>10:00 AM</td>
                    <td>L. 90</td>
                  </tr>
                  <tr>
                    <td>Comayagua</td>
                    <td>Tegucigalpa</td>
                    <td>5:00 PM</td>
                    <td>6:30 PM</td>
                    <td>L. 45</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="map-container">
              <h3>Mapa de Rutas - Honduras</h3>
              <div className="map-placeholder">
                <i className="fas fa-map-marked-alt" style={{fontSize: '3rem', marginRight: '1rem'}}></i>
                <div>
                  Mapa Interactivo de Honduras<br />
                  <small>Próximamente disponible</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reserva/Cotización */}
      <section id="reservas" className="section">
        <div className="container">
          <h2 className="section-title">Reserva o Cotización Rápida</h2>
          <div className="booking-form">
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="origen">Origen</label>
                <select 
                  id="origen" 
                  name="origen"
                  value={formData.origen}
                  onChange={(e) => handleInputChange(e, 'booking')}
                  required
                >
                  <option value="">Selecciona origen</option>
                  <option value="tegucigalpa">Tegucigalpa</option>
                  <option value="sps">San Pedro Sula</option>
                  <option value="ceiba">La Ceiba</option>
                  <option value="choluteca">Choluteca</option>
                  <option value="comayagua">Comayagua</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="destino">Destino</label>
                <select 
                  id="destino" 
                  name="destino"
                  value={formData.destino}
                  onChange={(e) => handleInputChange(e, 'booking')}
                  required
                >
                  <option value="">Selecciona destino</option>
                  <option value="tegucigalpa">Tegucigalpa</option>
                  <option value="sps">San Pedro Sula</option>
                  <option value="ceiba">La Ceiba</option>
                  <option value="choluteca">Choluteca</option>
                  <option value="comayagua">Comayagua</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fecha">Fecha de Viaje</label>
                <input 
                  type="date" 
                  id="fecha" 
                  name="fecha"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange(e, 'booking')}
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="pasajeros">Número de Pasajeros</label>
                <select 
                  id="pasajeros" 
                  name="pasajeros"
                  value={formData.pasajeros}
                  onChange={(e) => handleInputChange(e, 'booking')}
                >
                  <option value="1">1 Pasajero</option>
                  <option value="2">2 Pasajeros</option>
                  <option value="3">3 Pasajeros</option>
                  <option value="4">4+ Pasajeros</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                <i className="fas fa-search"></i> Buscar y Cotizar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Seguimiento de Encomiendas */}
      <section id="seguimiento" className="section tracking">
        <div className="container">
          <h2 className="section-title">Seguimiento de Encomiendas</h2>
          <div className="tracking-form">
            <p>Ingresa el código de tu guía para conocer el estado de tu encomienda</p>
            <div className="tracking-input">
              <input 
                type="text" 
                placeholder="Ingresa código de guía (Ej: TS2024001234)" 
                maxLength={15}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
              <button className="btn-track" onClick={handleTracking}>
                <i className="fas fa-search"></i> Rastrear
              </button>
            </div>
            {trackingResult && (
              <div id="tracking-result" style={{
                display: 'block', 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '10px', 
                marginTop: '2rem'
              }}>
                <h4>Estado de tu Encomienda</h4>
                <div style={{
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#e8f5e8', 
                  borderRadius: '5px'
                }}>
                  <p><strong>Estado:</strong> En tránsito</p>
                  <p><strong>Ubicación Actual:</strong> San Pedro Sula</p>
                  <p><strong>Destino:</strong> Tegucigalpa</p>
                  <p><strong>Fecha Estimada de Entrega:</strong> Mañana 2:00 PM</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="section">
        <div className="container">
          <h2 className="section-title">Lo Que Dicen Nuestros Clientes</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">Excelente servicio, siempre puntuales y con unidades muy cómodas. Los recomiendo ampliamente para viajar por Honduras.</p>
              <div className="testimonial-author">
                <div className="author-avatar">MR</div>
                <div className="author-info">
                  <h4>María Rodríguez</h4>
                  <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">He usado sus servicios de encomiendas por años y siempre llegan a tiempo. Personal muy amable y profesional.</p>
              <div className="testimonial-author">
                <div className="author-avatar">JL</div>
                <div className="author-info">
                  <h4>Juan López</h4>
                  <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">La mejor empresa de transporte de Honduras. Buses modernos, conductores responsables y precios justos.</p>
              <div className="testimonial-author">
                <div className="author-avatar">AS</div>
                <div className="author-info">
                  <h4>Ana Sánchez</h4>
                  <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="section contact">
        <div className="container">
          <h2 className="section-title">Contáctanos</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Información de Contacto</h3>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Dirección Principal</h4>
                  <p>Colonia Kennedy, Tegucigalpa M.D.C.<br />Honduras, C.A.</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h4>Teléfonos</h4>
                  <p>+504 2234-5678<br />+504 2234-5679</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Correo Electrónico</h4>
                  <p>info@Inicio.hn<br />reservas@Inicio.hn</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fab fa-whatsapp"></i>
                <div>
                  <h4>WhatsApp</h4>
                  <p>+504 9876-5432</p>
                </div>
              </div>
              
              <div className="social-links">
                <a href="https://facebook.com/Inicio" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com/Inicio" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com/Inicio" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://youtube.com/Inicio" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
            
            <div className="booking-form">
              <h3>Envíanos un Mensaje</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={(e) => handleInputChange(e, 'contact')}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange(e, 'contact')}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    name="telefono"
                    value={contactForm.telefono}
                    onChange={(e) => handleInputChange(e, 'contact')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <select 
                    id="asunto" 
                    name="asunto"
                    value={contactForm.asunto}
                    onChange={(e) => handleInputChange(e, 'contact')}
                    required
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="reserva">Reserva de Viaje</option>
                    <option value="encomienda">Encomiendas</option>
                    <option value="queja">Queja o Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea 
                    id="mensaje" 
                    name="mensaje"
                    rows={5} 
                    value={contactForm.mensaje}
                    onChange={(e) => handleInputChange(e, 'contact')}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                  <i className="fas fa-paper-plane"></i> Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="section">
        <div className="container">
          <h2 className="section-title">Nuestra Flota y Instalaciones</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <i className="fas fa-bus" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Buses Modernos
            </div>
            <div className="gallery-item">
              <i className="fas fa-truck" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Flota de Carga
            </div>
            <div className="gallery-item">
              <i className="fas fa-building" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Oficinas Principales
            </div>
            <div className="gallery-item">
              <i className="fas fa-users" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Equipo Profesional
            </div>
            <div className="gallery-item">
              <i className="fas fa-tools" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Taller Especializado
            </div>
            <div className="gallery-item">
              <i className="fas fa-map-marked-alt" style={{fontSize: '2rem', marginRight: '0.5rem'}}></i>
              Rutas Nacionales
            </div>
          </div>
        </div>
      </section>

      {/* Suscripción */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Mantente Informado</h2>
            <p>Suscríbete a nuestro boletín y recibe promociones especiales, nuevas rutas y novedades de Transportes Saenz.</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Transportes Saenz</h3>
              <p>Conectamos destinos, movemos sueños. Más de 25 años brindando servicios de transporte seguros y confiables en Honduras.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Enlaces Rápidos</h3>
              <a onClick={(e) => handleNavClick(e, '#nosotros')}>Sobre Nosotros</a>
              <a onClick={(e) => handleNavClick(e, '#servicios')}>Servicios</a>
              <a onClick={(e) => handleNavClick(e, '#rutas')}>Rutas y Horarios</a>
              <a onClick={(e) => handleNavClick(e, '#reservas')}>Reservaciones</a>
              <a onClick={(e) => handleNavClick(e, '#seguimiento')}>Seguimiento</a>
              <a onClick={(e) => handleNavClick(e, '#contacto')}>Contacto</a>
            </div>
            
            <div className="footer-section">
              <h3>Servicios</h3>
              <a href="#">Transporte de Pasajeros</a>
              <a href="#">Transporte de Carga</a>
              <a href="#">Encomiendas</a>
              <a href="#">Fletes Especiales</a>
              <a href="#">Turismo</a>
            </div>
            
            <div className="footer-section">
              <h3>Información Legal</h3>
              <a href="#">Términos y Condiciones</a>
              <a href="#">Políticas de Privacidad</a>
              <a href="#">Política de Equipaje</a>
              <a href="#">Derechos del Pasajero</a>
              <a href="#">Preguntas Frecuentes</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Transportes Saenz. Todos los derechos reservados. | Desarrollado con ❤️ para Honduras</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Flotante */}
      <a 
        href="https://wa.me/50498765432" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        title="Contáctanos por WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
};

export default Inicio;