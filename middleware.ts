import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/feed', '/messages', '/calendar', '/user'];

// Define public routes that should redirect to feed if already authenticated
const publicRoutes = ['/auth', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Simple check: if token exists, consider authenticated
  // Full verification happens in API routes (Node.js runtime)
  const isAuthenticated = !!token;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current route is public (auth/register)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect to auth if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }

  // Redirect to feed if trying to access auth/register while already authenticated
  if (isPublicRoute && isAuthenticated) {
    const url = new URL('/feed', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
