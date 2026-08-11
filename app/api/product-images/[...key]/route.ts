import { NextResponse } from 'next/server';

import { getProductImage } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join('/');
  if (!key.startsWith('products/') || key.includes('..')) return new NextResponse('Not found', { status: 404 });

  try {
    const object = await getProductImage(key);
    if (!object.Body) return new NextResponse('Not found', { status: 404 });
    return new NextResponse(object.Body.transformToWebStream(), {
      headers: {
        'Content-Type': object.ContentType ?? 'application/octet-stream',
        'Cache-Control': object.CacheControl ?? 'public, max-age=31536000, immutable',
        ...(object.ETag ? { ETag: object.ETag } : {}),
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
