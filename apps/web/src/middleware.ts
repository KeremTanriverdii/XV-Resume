import { proxy } from './proxy';

export const runtime = 'experimental-edge';

export const config = {
  matcher: [
    '/',
    '/(tr|en)/:path*',
    '/((?!api(?!/v1)|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

export default proxy;
