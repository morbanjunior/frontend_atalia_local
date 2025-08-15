import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =======================
// 🔐 Configuración
// =======================

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/bandeja-entrada',
  '/operadores',
  '/perfil',
  '/horarios',
];

// Rutas exclusivas para el rol "admin"
const ADMIN_ONLY_ROUTES = [
  '/operadores',
  '/horarios',
];

// =======================
// 🧠 Función para decodificar el token JWT
// =======================
function getRoleFromToken(token: string | undefined): string | null {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role || null;
  } catch {
    return null;
  }
}

// =======================
// 🔁 Middleware principal
// =======================
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isAuth = Boolean(token);
  const role = getRoleFromToken(token);
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === '/login';
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminOnly = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));

  // 🔒 Si no autenticado y accede a ruta protegida → redirigir a login
  if (!isAuth && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔁 Si autenticado y accede a /login → redirigir al dashboard
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🚫 Si autenticado pero no es admin y accede a ruta admin-only → redirigir
  if (isAuth && isAdminOnly && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Continuar normalmente
  return NextResponse.next();
}

// =======================
// 🛡️ Configuración de rutas donde aplica el middleware
// =======================
export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/bandeja-entrada/:path*',
    '/operadores/:path*',
    '/perfil/:path*',
    '/horarios/:path*',
  ],
};

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// function getRoleFromToken(token: string | undefined): string | null {
//   if (!token) return null;

//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.role || null;
//   } catch (error) {
//     return null;
//   }
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('access_token')?.value;
//   const isAuth = !!token;
//   const role = getRoleFromToken(token);

//   const pathname = request.nextUrl.pathname;
//   const isLoginPage = pathname === '/login';

//   const isProtectedPage = ['/dashboard', '/bandeja-entrada', '/operadores', '/perfil', '/horario'].some((path) =>
//     pathname.startsWith(path)
//   );

//   // 🔒 Si no autenticado y va a ruta protegida, redirigir a login
//   if (!isAuth && isProtectedPage) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // 🪄 Si autenticado y va al login, redirigir al dashboard
//   if (isAuth && isLoginPage) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // 🔐 Protecciones por rol
//   const adminOnlyRoutes = ['/operadores','/horario'];
//   if (isAuth && adminOnlyRoutes.some((r) => pathname.startsWith(r)) && role !== 'admin') {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/login',
//     '/dashboard/:path*',
//     '/bandeja-entrada/:path*',
//     '/operadores/:path*',
//     '/perfil/:path*',
//     '/horario/:path*',
//   ],
// };

