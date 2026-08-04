import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. C# Backend Proxy (Bypass all auth & i18n for /api/v1)
  if (pathname.startsWith('/api/v1')) {
    const backendUrl = new URL(
      pathname,
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5075'
    );
    backendUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(backendUrl);
  }

  // 2. Run i18n middleware first to get the base response
  let response = intlMiddleware(request as any);

  // 3. Supabase Auth & Session Refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Extract locale from pathname (e.g. /tr/dashboard -> tr)
  const localeMatch = pathname.match(/^\/(en|tr|de|es|fr|jp)(?:\/|$)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // Clean path without locale prefix
  const cleanPath = localeMatch ? pathname.replace(/^\/(en|tr|de|es|fr|jp)/, '') : pathname;

  // Protected routes where authentication is strictly required
  // Note: /dashboard/profiles is open to guests for manual profile building
  const isDashboardMain = cleanPath === '' || cleanPath === '/' || cleanPath === '/dashboard' || cleanPath === '/dashboard/';
  const isProtectedSubRoute =
    cleanPath.startsWith('/dashboard/settings') ||
    cleanPath.startsWith('/dashboard/cover-letter') ||
    cleanPath.startsWith('/dashboard/outreach');

  const isProtectedRoute = isDashboardMain || isProtectedSubRoute;

  // If unauthenticated and trying to access protected routes -> redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('next', pathname);
    
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // If authenticated and visiting /login or /register -> redirect to /dashboard
  const isAuthPage = cleanPath === '/login' || cleanPath === '/register';
  if (isAuthPage && user) {
    const dashUrl = new URL(`/${locale}/dashboard`, request.url);
    const redirectResponse = NextResponse.redirect(dashUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    // Match root path
    '/',
    // Match localized routes
    '/(tr|en|de|es|fr|jp)/:path*',
    // Match all other paths except standard static assets, next internals, etc.
    '/((?!api(?!/v1)|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};
