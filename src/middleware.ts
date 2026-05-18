import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si hay una cookie de sesión
  const sessionToken = request.cookies.get("__Secure-next-auth.session-token")?.value ||
                       request.cookies.get("next-auth.session-token")?.value;
  
  const isLoggedIn = !!sessionToken;
  
  // Rutas que requieren autenticación
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";

  // Si está logueado y va al login, redirigir al dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Si no está logueado y va al dashboard, redirigir al login
  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
