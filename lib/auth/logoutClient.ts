// lib/auth/logoutClient.ts
export async function logoutClient() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    await res.json(); // solo para consumir la respuesta

    // 🔹 Limpia todo el localStorage / sessionStorage
    ['idUsuario', 'rolUsuario', 'authType', 'nombreUsuario', 'correoUsuario', 'twoFA'].forEach(k =>
      localStorage.removeItem(k)
    );
    sessionStorage.clear();
  } catch (e) {
    console.error('Error al cerrar sesión (cliente):', e);
  }
}
