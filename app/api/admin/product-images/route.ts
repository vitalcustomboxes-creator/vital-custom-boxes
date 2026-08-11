import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { requireFirebaseAdmin } from '@/lib/firebase/admin';
import { parseProducts } from '@/lib/product-schema';
import { deleteProductImageUrls, getCatalogSnapshot, productImageUrl, uploadProductImage } from '@/lib/r2';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}

export async function POST(request: Request) {
  try {
    await requireFirebaseAdmin(request);
    const form = await request.formData();
    const file = form.get('file');
    const productSlug = safeSlug(String(form.get('productSlug') ?? ''));
    if (!(file instanceof File) || !productSlug) {
      return NextResponse.json({ error: 'An image and product slug are required.' }, { status: 400 });
    }
    const extension = IMAGE_TYPES.get(file.type);
    if (!extension) return NextResponse.json({ error: 'Use a JPG, PNG, WEBP, or AVIF image.' }, { status: 415 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Images must be 4 MB or smaller.' }, { status: 413 });

    const key = `products/${productSlug}/${randomUUID()}.${extension}`;
    await uploadProductImage(key, new Uint8Array(await file.arrayBuffer()), file.type);
    return NextResponse.json({ imageUrl: productImageUrl(key) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'forbidden' ? 403 : message === 'unauthorized' ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'The image could not be uploaded to R2.' : 'Admin authentication is required.' }, { status });
  }
}

/**
 * GET ?slugs=a,b — every image URL belonging to those products.
 *
 * The admin table no longer carries product galleries in its payload, so the
 * delete flow asks for them here. Resolved from the published R2 snapshot,
 * which costs no Firestore reads and is authoritative about what a product
 * currently owns — more reliable than whatever the browser last rendered.
 */
export async function GET(request: Request) {
  try {
    await requireFirebaseAdmin(request);
    const requested = new URL(request.url).searchParams.get('slugs') ?? '';
    const slugs = new Set(requested.split(',').filter(Boolean));
    if (!slugs.size) return NextResponse.json({ urls: [] });

    const snapshot = await getCatalogSnapshot().catch(() => null);
    const urls = parseProducts(snapshot ?? [])
      .filter((product) => slugs.has(product.slug))
      .flatMap((product) => [product.imageUrl, ...(product.images ?? []).map((image) => image.src)])
      .filter(Boolean);
    return NextResponse.json({ urls });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'forbidden' ? 403 : message === 'unauthorized' ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'The product images could not be resolved.' : 'Admin authentication is required.' }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireFirebaseAdmin(request);
    const body = await request.json() as { urls?: unknown };
    const urls = Array.isArray(body.urls) ? body.urls.filter((url): url is string => typeof url === 'string').slice(0, 100) : [];
    await deleteProductImageUrls(urls);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'forbidden' ? 403 : message === 'unauthorized' ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'The images could not be removed from R2.' : 'Admin authentication is required.' }, { status });
  }
}
