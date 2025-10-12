import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const protectedPaths = [/^\/books/, /^\/wishlist/, /^\/loans/, /^\/reservations/];
  const isProtected = protectedPaths.some((re) => re.test(req.nextUrl.pathname));
  if (!isProtected) return NextResponse.next();

  const hasToken = req.cookies.get('access_token');
  if (!hasToken) {
    const url = new URL('/login', req.url);
    url.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/books/:path*', '/wishlist/:path*', '/loans/:path*', '/reservations/:path*'],
};
