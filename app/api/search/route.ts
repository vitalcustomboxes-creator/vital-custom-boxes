/**
 * GET /api/search?q=<query> — JSON search endpoint (BE-3 owned).
 *
 * - Input capped at 60 chars (MAX_QUERY_LENGTH) before it touches the index.
 * - Responses are never cached (Cache-Control: no-store) — the client
 *   debounces; results must reflect the latest content build.
 * - Runs on the Node.js runtime (lib/search → lib/content → node:fs).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { MAX_QUERY_LENGTH, search } from '@/lib/search';
import { getCategories, getPosts } from '@/lib/content';
import { getPublicProducts } from '@/lib/public-products';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const raw = request.nextUrl.searchParams.get('q') ?? '';
  const q = raw.slice(0, MAX_QUERY_LENGTH).trim();
  const results = search(q, undefined, {
    products: await getPublicProducts(),
    categories: getCategories(),
    posts: getPosts(),
  });

  return NextResponse.json(
    { query: q, count: results.length, results },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
