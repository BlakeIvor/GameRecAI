import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware disabled - letting dashboard component handle authentication
export function middleware(request: NextRequest) {
  // Middleware disabled - let the dashboard component handle auth
  return NextResponse.next();
}

// Specify which paths to run middleware on
export const config = {
  matcher: [],  // Disabled - no paths will trigger middleware
};
