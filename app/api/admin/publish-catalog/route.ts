/**
 * POST /api/admin/publish-catalog
 *
 * Reads products from Firestore, publishes a validated snapshot to R2,
 * and invalidates the public catalog cache.
 *
 * Supported modes:
 * - { slugs: ['custom-mailer-boxes'] }: update selected products.
 * - No body: rebuild the full catalog.
 */
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { requireFirebaseAdmin } from '@/lib/firebase/admin';
import { parseProducts, productSchema } from '@/lib/product-schema';
import { PUBLIC_PRODUCTS_TAG } from '@/lib/public-products';
import type { Product } from '@/lib/types';
import { getCatalogSnapshot, putCatalogSnapshot } from '@/lib/r2';

const MAX_INCREMENTAL_SLUGS = 50;

export const runtime = 'nodejs';

interface FirestoreValue {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  stringValue?: string;
  timestampValue?: string;
  arrayValue?: {
    values?: FirestoreValue[];
  };
  mapValue?: {
    fields?: Record<string, FirestoreValue>;
  };
}

interface FirestoreListResponse {
  documents?: Array<{
    fields?: Record<string, FirestoreValue>;
  }>;
  nextPageToken?: string;
}

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;

  if ('arrayValue' in value) {
    return (value.arrayValue?.values ?? []).map(decodeValue);
  }

  if ('mapValue' in value) {
    return decodeFields(value.mapValue?.fields ?? {});
  }

  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      decodeValue(value),
    ]),
  );
}

function firestoreConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    throw new Error('Firebase catalog configuration is incomplete.');
  }

  return { projectId, apiKey };
}

async function readFirestoreProducts(): Promise<unknown[]> {
  const { projectId, apiKey } = firestoreConfig();

  const documents: NonNullable<
    FirestoreListResponse['documents']
  > = [];

  let pageToken = '';

  do {
    const endpoint = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`,
    );

    endpoint.searchParams.set('pageSize', '100');
    endpoint.searchParams.set('key', apiKey);

    if (pageToken) {
      endpoint.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(endpoint, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Firestore catalog request failed with ${response.status}.`,
      );
    }

    const page = (await response.json()) as FirestoreListResponse;

    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return documents.map((document) =>
    decodeFields(document.fields ?? {}),
  );
}

/**
 * Returns null when a product document no longer exists.
 */
async function readFirestoreProduct(
  slug: string,
): Promise<unknown | null> {
  const { projectId, apiKey } = firestoreConfig();

  const endpoint = new URL(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(slug)}`,
  );

  endpoint.searchParams.set('key', apiKey);

  const response = await fetch(endpoint, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Firestore product request failed with ${response.status}.`,
    );
  }

  const document = (await response.json()) as {
    fields?: Record<string, FirestoreValue>;
  };

  return decodeFields(document.fields ?? {});
}

/**
 * Updates selected products in the existing published snapshot.
 * Returns null when a full rebuild is required.
 */
async function patchSnapshot(
  slugs: string[],
): Promise<Product[] | null> {
  const raw = await getCatalogSnapshot().catch(() => null);

  if (!raw) {
    return null;
  }

  const existing = parseProducts(raw);

  if (!existing.length) {
    return null;
  }

  const bySlug = new Map(
    existing.map((product) => [product.slug, product]),
  );

  for (const slug of slugs) {
    const document = await readFirestoreProduct(slug);

    if (document === null) {
      bySlug.delete(slug);
      continue;
    }

    const parsed = productSchema.safeParse(document);

    if (!parsed.success) {
      throw new Error(
        `Product "${slug}" is not valid for publishing.`,
      );
    }

    bySlug.set(slug, parsed.data as Product);
  }

  return Array.from(bySlug.values());
}

/**
 * An empty list means rebuild the entire catalog.
 */
async function readChangedSlugs(
  request: Request,
): Promise<string[]> {
  const body: unknown = await request.json().catch(() => null);

  if (
    !body ||
    typeof body !== 'object' ||
    !('slugs' in body)
  ) {
    return [];
  }

  const slugs = (body as { slugs: unknown }).slugs;

  if (!Array.isArray(slugs)) {
    return [];
  }

  const unique = Array.from(
    new Set(
      slugs.filter(
        (slug): slug is string =>
          typeof slug === 'string' && slug.length > 0,
      ),
    ),
  );

  return unique.length > MAX_INCREMENTAL_SLUGS ? [] : unique;
}

export async function POST(request: Request) {
  try {
    await requireFirebaseAdmin(request);

    const changed = await readChangedSlugs(request);

    const products =
      (changed.length ? await patchSnapshot(changed) : null) ??
      parseProducts(await readFirestoreProducts());

    // Preserve the existing snapshot if no valid products were returned.
    if (!products.length) {
      return NextResponse.json(
        {
          error:
            'Firestore returned no valid products; the existing snapshot was kept.',
        },
        { status: 502 },
      );
    }

    // Store the new snapshot before invalidating the shared catalog cache.
    await putCatalogSnapshot(products);
    revalidateTag(PUBLIC_PRODUCTS_TAG);

    return NextResponse.json({
      published: products.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '';

    const status =
      message === 'forbidden'
        ? 403
        : message === 'unauthorized'
          ? 401
          : 500;

    if (status === 500) {
      console.error('[catalog] publish failed', error);
    }

    return NextResponse.json(
      {
        error:
          status === 500
            ? 'The catalog could not be published.'
            : 'Admin authentication is required.',
      },
      { status },
    );
  }
}