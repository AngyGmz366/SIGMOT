export function tienePermiso(objeto: string, tipo: 'Ver' | 'Crear' | 'Editar' | 'Eliminar'): boolean {
  if (typeof window === 'undefined') return false;
  const permisos = JSON.parse(localStorage.getItem('permisosUsuario') || '[]');
  const permiso = permisos.find((p: any) => p.Objeto?.toLowerCase() === objeto.toLowerCase());
  return permiso ? permiso[tipo] === 1 : false;
}
