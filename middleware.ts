import { NextRequest, NextResponse } from 'next/server';

/**
 * SEO-1 — legacy query-string redirect.
 *
 * The live WordPress site links its privacy policy site-wide (footer) as
 * `https://www.hmcustompackaging.com/?page_id=3` — there is no pretty permalink.
 * next.config.ts redirects use the simple `{ source, destination, permanent }`
 * shape (see lib/redirects.ts), which cannot express a query-string-only match
 * on `/`, so this one URL is handled here with a 308 to /privacy-policy/.
 *
 * Scope is deliberately minimal: the matcher only runs on `/`, so this adds no
 * overhead to any other route. No other `page_id` values are linked anywhere on
 * the live site (audit 2026-06-12), so only `page_id=3` is mapped.
 */
export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  // UI-only admin subdomain routing. Production authentication must move to
  // Firebase Auth (or another server-verified session) before deployment.
  // Rewrites admin.domain.com/<path> → /admin/<path> for all routes.
  // vercel.json also carries a matching rewrite for the Vercel edge layer.
  if (hostname.startsWith('admin.') && !nextUrl.pathname.startsWith('/api/')) {
    const adminPath = nextUrl.pathname.startsWith('/admin')
      ? nextUrl.pathname          // already prefixed (avoid double /admin/admin)
      : `/admin${nextUrl.pathname}`;
    const url = nextUrl.clone();
    url.pathname = adminPath;
    return NextResponse.rewrite(url);
  }

  if (nextUrl.pathname === '/' && nextUrl.searchParams.get('page_id') === '3') {
    const url = nextUrl.clone();
    url.pathname = '/privacy-policy/'; // trailing slash: trailingSlash: true in next.config.ts
    url.search = '';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Match all paths except Next.js internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.png|img/).*)'],
};
