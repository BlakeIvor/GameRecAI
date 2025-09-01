import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Toggle this variable to simulate authentication
const isAuthenticated = false; // Set to true to allow dashboard access

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

    if (pathname.startsWith('/dashboard') && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}

// Specify which paths to run middleware on
export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
