/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { logoutClient } from '@/lib/auth/logoutClient';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const { layoutState, onMenuToggle } = useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const router = useRouter();
  const menuRef = useRef<Menu>(null);

  const [nombreUsuario, setNombreUsuario] = useState<string>('Usuario');
  const [rolUsuario, setRolUsuario] = useState<string>('Rol');
  const [foto, setFoto] = useState<string>('demo/images/default-user.png');

  // 🧩 Cargar datos reales del usuario logueado
  useEffect(() => {
    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) return;

    axios.get(`/api/usuarios/${idUsuario}`)
      .then((res) => {
        if (res.data.ok) {
          const user = res.data.data;
          const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
          const rolLimpio = (user.rol || '').charAt(0).toUpperCase() + (user.rol || '').slice(1).toLowerCase();
          setNombreUsuario(nombreCompleto || 'Usuario');
          setRolUsuario(rolLimpio || 'Usuario');
          setFoto(user.fotoPerfil || 'demo/images/default-user.png');

          // Guardar en localStorage (por si se recarga la página)
          localStorage.setItem('nombreUsuario', nombreCompleto);
          localStorage.setItem('rolUsuario', user.rol || 'Usuario');
          localStorage.setItem('fotoUsuario', user.fotoPerfil || 'demo/images/default-user.png');
        }
      })
      .catch((err) => console.error('Error al cargar datos de usuario:', err));
  }, []);

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  // 🔒 Cerrar sesión
  const cerrarSesion = async () => {
    const Swal = (await import('sweetalert2')).default;
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');

    Swal.fire({
      title: '¿Deseas cerrar sesión?',
      text: 'Tu sesión actual se cerrará y deberás volver a iniciar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      background: '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await signOut(auth).catch(() => {});
          await fetch('/api/auth/logout', { method: 'POST' });

          Cookies.remove('app_token');
          [
            'idUsuario',
            'nombreUsuario',
            'correoUsuario',
            'rolUsuario',
            'fotoUsuario',
            'twoFA',
            'authType',
          ].forEach((k) => localStorage.removeItem(k));
          sessionStorage.clear();

          await Swal.fire({
            title: 'Sesión cerrada',
            text: 'Has salido del sistema correctamente.',
            icon: 'success',
            confirmButtonColor: '#6366F1',
            timer: 1800,
            showConfirmButton: false,
          });

          router.replace('/auth/Inicio');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cerrar sesión correctamente.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  };

  // ⚙️ Menú superior
  const items = [
    {
      template: () => (
        <div className="p-3 border-bottom-1 surface-border flex align-items-center gap-3 menu-header"   onClick={() => router.push('/configuracion/perfil')}
  >
          <img
            src={foto || 'demo/images/default-user.png'}
            alt="Avatar"
            className="border-circle"
            width={48}
            height={48}
            style={{ objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.src = 'demo/images/default-user.png')}
          />
          <div className="flex flex-column">
            <span className="font-bold text-900">{nombreUsuario}</span>
            <small className="text-600">{rolUsuario}</small>
          </div>
        </div>
      ),
    },
    { separator: true },
    {
      label: 'Editar perfil',
      icon: 'pi pi-user-edit',
      command: () => router.push('/configuracion/perfil'),
    },
    {
      label: 'Activar autenticación 2FA',
      icon: 'pi pi-shield',
      command: () => router.push('/configuracion/activar-2fa'),
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: cerrarSesion,
    },
  ];

  return (
    <div className="layout-topbar">
      <Link
        href="/dashboard"
        className="layout-topbar-logo"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <img
          src="/demo/images/login/LOGO-SIGMOT.png"
          alt="Logo SIGMOT"
          style={{ width: '100px', height: 'auto', maxWidth: 'none' }}
        />
      </Link>

      {/* Botón menú lateral */}
      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      {/* Menú derecho */}
      <div
        ref={topbarmenuRef}
        className={classNames('layout-topbar-menu', {
          'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible,
        })}
      >
        <button
          ref={topbarmenubuttonRef}
          type="button"
          className="layout-topbar-button p-link"
          onClick={(e) => menuRef.current?.toggle(e)}
          aria-controls="config_menu"
          aria-haspopup="true"
        >
          <i className="pi pi-cog layout-menuitem-icon"></i>
        </button>

        <Menu model={items} popup ref={menuRef} id="config_menu" style={{ minWidth: '230px' }} />
      </div>
    </div>
  );
});

AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;
