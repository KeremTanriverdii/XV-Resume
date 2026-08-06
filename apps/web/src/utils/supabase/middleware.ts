import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh auth token if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g. /tr/dashboard -> tr)
  const segments = pathname.split('/').filter(Boolean);
  const locales = ['tr', 'en', 'de', 'fr', 'es', 'jp'];
  let currentLocale = 'tr';
  let pathWithoutLocale = pathname;

  if (segments.length > 0 && locales.includes(segments[0])) {
    currentLocale = segments[0];
    pathWithoutLocale = '/' + segments.slice(1).join('/');
  }

  // Protected routes that strictly require authentication
  const isProtectedRoute =
    pathWithoutLocale === '/dashboard' ||
    pathWithoutLocale.startsWith('/dashboard/settings') ||
    pathWithoutLocale.startsWith('/dashboard/cover-letter') ||
    pathWithoutLocale.startsWith('/dashboard/outreach');

  // Auth pages (login / register) where logged-in users should be redirected to dashboard
  const isAuthRoute =
    pathWithoutLocale === '/login' || pathWithoutLocale === '/register';

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${currentLocale}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${currentLocale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
