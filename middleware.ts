import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * 🔐 Middleware de seguridad SIGMOT
 * Protege las rutas internas verificando el JWT (cookie 'app_token')
 * generado tras el login o verificación 2FA.
 */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('app_token')?.value || '';

  // ✅ 1️⃣ Permitir acceso a recursos públicos y APIs abiertas
  const isPublicPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/auth') || // páginas públicas
    pathname.startsWith('/api/auth') || // login, register, upsert
    pathname.startsWith('/api/2fa'); // setup, verify, disable

  if (isPublicPath) {
    return NextResponse.next();
  }

  // ✅ 2️⃣ Si no hay token → redirigir al login
  if (!token) {
    console.warn('🚫 No hay token de sesión, redirigiendo al login.');
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // ✅ 3️⃣ Verificar token JWT
  try {
    const secretEnv = process.env.APP_JWT_SECRET;
    if (!secretEnv) throw new Error('APP_JWT_SECRET no configurado.');

    const secret = new TextEncoder().encode(secretEnv);
    const { payload } = await jwtVerify(token, secret);

    // ⚙️ Validación básica del payload
    if (!payload?.uid) {
      console.warn('⚠️ Token inválido: sin UID en el payload.');
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // ✅ Token válido → permitir acceso
    console.log(`✅ Acceso permitido a ${pathname} para UID: ${payload.uid}`);
    return NextResponse.next();
  } catch (err) {
    console.warn('⛔ Token inválido o expirado:', err);
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

/**
 * ✅ 4️⃣ Rutas protegidas por el middleware
 * Se interceptan solo estas rutas (otras quedan públicas)
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/unidades/:path*',
    '/vehiculos/:path*',
    '/mantenimiento/:path*',
    '/rutas/:path*',
    '/empleados/:path*',
    '/clientes/:path*',
    '/seguridad/:path*',
    '/reservaciones/:path*',
    '/ventas/:path*',
  ],
};
