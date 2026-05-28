import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic admin protection middleware.
 * In production this will be strengthened with proper signed sessions.
 * For now: simple cookie check set by the login form.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const isAdmin = request.cookies.get('nhg_admin')?.value === 'true';

    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
