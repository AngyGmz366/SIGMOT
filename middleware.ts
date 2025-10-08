import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('app_token')?.value || '';

  // ✅ 1. Permitir acceso a recursos públicos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api/auth') || // login, logout, register
    pathname.startsWith('/auth') // páginas de login y registro
  ) {
    return NextResponse.next();
  }

  // ✅ 2. Si no hay token, redirigir al login
  if (!token) {
    console.warn('🚫 No hay token, redirigiendo al login');
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // ✅ 3. Verificar token con JOSE (WebCrypto)
  try {
    const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Verifica que el payload tenga el usuario (opcional)
    if (!payload?.uid) {
      console.warn('⚠️ Token inválido: no contiene UID');
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    console.log('✅ Token válido, acceso permitido');
    return NextResponse.next();
  } catch (err) {
    console.warn('⚠️ Token inválido o expirado:', err);
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

// ✅ 4. Rutas protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vehiculos/:path*',
    '/seguridad/:path*',
    '/empleados/:path*',
    '/rutas/:path*',
    '/mantenimiento/:path*',
  ],
};
