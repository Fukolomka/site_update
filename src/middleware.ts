import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/api/auth/steam',
    '/api/auth/steam/return',
    '/api/auth/status',
    '/api/cases',
    '/api/user', // Allow user endpoint to be accessed without auth
  ];

  // Admin routes that require admin role
  const adminRoutes = [
    '/admin',
    '/api/admin',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    // Redirect to home page for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload || typeof payload === 'string') {
    // Invalid token, clear cookie and redirect
    const response = pathname.startsWith('/api/') 
      ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      : NextResponse.redirect(new URL('/', request.url));
    
    // Clear invalid token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      maxAge: 0,
    });
    
    return response;
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isAdminRoute && payload.role !== 'ADMIN') {
    // Non-admin trying to access admin routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add user info to request headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', payload.userId);
    requestHeaders.set('X-User-Role', payload.role);
    requestHeaders.set('X-Steam-ID', payload.steamId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};