import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Check if the user is authenticated
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  console.log('Middleware:', { pathname, hasSession: !!session });

  // If the user is not authenticated and trying to access protected routes, redirect to sign-in
  if (!session) {
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/conductor') ||
      pathname.startsWith('/admin') ||
      pathname === '/onboarding'
    ) {
      // const redirectUrl = new URL('/sign-in', request.url);
      // return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  // Get the user's role from metadata
  const role = session.user.user_metadata.role;
  console.log('Middleware: User role:', role);

  // If the user is authenticated and trying to access auth pages, redirect to their dashboard
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    const redirectPath =
      role === 'passenger'
        ? '/dashboard'
        : role === 'conductor'
        ? '/conductor'
        : '/admin';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based access control
  if (
    (role === 'passenger' &&
      (pathname.startsWith('/conductor') || pathname.startsWith('/admin'))) ||
    (role === 'conductor' &&
      (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) ||
    (role === 'admin' &&
      (pathname.startsWith('/dashboard') || pathname.startsWith('/conductor')))
  ) {
    const redirectPath =
      role === 'passenger'
        ? '/dashboard'
        : role === 'conductor'
        ? '/conductor'
        : '/admin';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)']
};
