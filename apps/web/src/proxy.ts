import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const runtime = 'experimental-edge';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. C# Backend Proxy (Bypass all auth & i18n)
  if (pathname.startsWith('/api/v1')) {
    const backendUrl = new URL(
      pathname,
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5075'
    );
    backendUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(backendUrl);
  }

  // 2. Run i18n middleware first to get the base response (which includes necessary locale headers/rewrites)
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
          // Update cookies on the request for Server Components
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Update cookies on the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if it's expired or about to expire
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Token Forwarding & Route Protection
  // Match dashboard routes (e.g. /dashboard, /en/dashboard, /tr/dashboard, etc.)
  const isDashboard = pathname.match(/^\/(?:en|tr|de|es|fr|jp)\/dashboard(?:\/|$)/) || pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  
  if (isDashboard && !user) {
    const localeMatch = pathname.match(/^\/(en|tr|de|es|fr|jp)(?:\/|$)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const registerUrl = new URL(`/${locale}/register`, request.url);
    
    const redirectResponse = NextResponse.redirect(registerUrl);
    
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
    '/(tr|en)/:path*',
    // Match all other paths except standard api routes (not api/v1), next internals, static assets, etc.
    '/((?!api(?!/v1)|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};
