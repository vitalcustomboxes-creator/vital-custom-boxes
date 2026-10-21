import { NextResponse } from 'next/server';

import { getProductImage } from '@/lib/r2';

export const runtime = 'nodejs';

const LEGACY_IMAGE_FALLBACKS: Record<string, string> = {
  'products/custom-business-card-boxes/import-primary-2bf8bd7e232395bc-custom-business-card-boxes-4.jpg': '/img/hm/wp-content/uploads/2025/05/Custom-Business-Card-Boxes-4.jpg',
  'products/custom-stickers/import-primary-d2d02e2104b9b54b-custom-stickers-3.jpg': '/img/hm/wp-content/uploads/2025/05/Custom-Stickers-3.jpg',
};

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;
  const key = segments.join('/');
  if (!key.startsWith('products/') || key.includes('..')) return new NextResponse('Not found', { status: 404 });

  const fallback = LEGACY_IMAGE_FALLBACKS[key];
  if (fallback) return NextResponse.redirect(new URL(fallback, request.url), 307);

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
