// lib/auth/logoutClient.ts
export async function logoutClient() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    // Limpia datos del navegador
    [
      'idUsuario',
      'rolUsuario',
      'authType',
      'nombreUsuario',
      'correoUsuario',
      'twoFA',
      'app_token',
    ].forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();

    // Evita volver a una vista protegida con "atrás"
    window.location.replace('/auth/login');
  } catch (e) {
    console.error('Error al cerrar sesión (cliente):', e);

    // Aunque falle el fetch, igual saca al usuario del cliente
    [
      'idUsuario',
      'rolUsuario',
      'authType',
      'nombreUsuario',
      'correoUsuario',
      'twoFA',
      'app_token',
    ].forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();
    window.location.replace('/auth/login');
  }
}