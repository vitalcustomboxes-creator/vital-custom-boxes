/**
 * POST /api/admin/publish-catalog — rebuild the catalog the public site reads.
 *
 * The admin writes products straight to Firestore from the browser, so the
 * server has no hook to know the catalog changed. This is that hook: it reads
 * Firestore, writes a validated snapshot to R2, and busts the cache tag.
 *
 * This is the ONLY place the app reads the Firestore product collection.
 * Keeping it off the public path is what makes public traffic cost zero reads
 * — see the note at the top of lib/public-products.ts.
 *
 * Two modes, because a full rebuild costs one Firestore read per product in
 * the catalog and the overwhelming majority of publishes change exactly one:
 *
 *   { slugs: ['custom-mailer-boxes'] } → read those documents only and splice
 *                                        them into the published snapshot
 *   no body                            → re-read the whole collection
 *
 * The slugs say *what changed*, never *what to publish*: the document is still
 * read from Firestore, so a caller cannot inject catalog content it has not
 * already written. A slug whose document is gone is removed from the snapshot,
 * which is what makes deletes and edits the same code path.
 */
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { requireFirebaseAdmin } from '@/lib/firebase/admin';
import { parseProducts, productSchema } from '@/lib/product-schema';
import { PUBLIC_PRODUCTS_TAG, resetPublicProductsMemo } from '@/lib/public-products';
import type { Product } from '@/lib/types';
import { getCatalogSnapshot, putCatalogSnapshot } from '@/lib/r2';

/**
 * Past this many changed documents a full rebuild is fewer round trips than
 * one request per slug, and its read cost is capped at the catalog size.
 */
const MAX_INCREMENTAL_SLUGS = 50;

export const runtime = 'nodejs';

interface FirestoreValue {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  stringValue?: string;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface FirestoreListResponse {
  documents?: Array<{ fields?: Record<string, FirestoreValue> }>;
  nextPageToken?: string;
}

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue?.fields ?? {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

function firestoreConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) throw new Error('Firebase catalog configuration is incomplete.');
  return { projectId, apiKey };
}

async function readFirestoreProducts(): Promise<unknown[]> {
  const { projectId, apiKey } = firestoreConfig();

  const documents: FirestoreListResponse['documents'] = [];
  let pageToken = '';
  do {
    const endpoint = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`,
    );
    endpoint.searchParams.set('pageSize', '100');
    endpoint.searchParams.set('key', apiKey);
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    // no-store: a publish must observe the write that just triggered it.
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Firestore catalog request failed with ${response.status}.`);
    const page = (await response.json()) as FirestoreListResponse;
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return documents.map((document) => decodeFields(document.fields ?? {}));
}

/** One document. `null` means it does not exist — i.e. it was deleted. */
async function readFirestoreProduct(slug: string): Promise<unknown | null> {
  const { projectId, apiKey } = firestoreConfig();
  const endpoint = new URL(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(slug)}`,
  );
  endpoint.searchParams.set('key', apiKey);

  // no-store: a publish must observe the write that just triggered it.
  const response = await fetch(endpoint, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore product request failed with ${response.status}.`);
  const document = (await response.json()) as { fields?: Record<string, FirestoreValue> };
  return decodeFields(document.fields ?? {});
}

/**
 * Splice the changed documents into the published snapshot. Returns null when
 * there is no usable snapshot to patch, leaving the caller to rebuild in full.
 */
async function patchSnapshot(slugs: string[]): Promise<Product[] | null> {
  const raw = await getCatalogSnapshot().catch(() => null);
  if (!raw) return null;
  const existing = parseProducts(raw);
  if (!existing.length) return null;

  // A Map keeps the snapshot's existing order: an edited product stays where
  // it was and a new one lands at the end.
  const bySlug = new Map(existing.map((product) => [product.slug, product]));
  for (const slug of slugs) {
    const document = await readFirestoreProduct(slug);
    if (document === null) {
      bySlug.delete(slug);
      continue;
    }
    const parsed = productSchema.safeParse(document);
    /**
     * A full rebuild silently drops malformed documents. Here that would
     * quietly *unpublish* the product the admin just saved, so fail loudly
     * instead and keep the previous snapshot — the editor surfaces this as
     * "saved, but the live site could not be updated".
     */
    if (!parsed.success) throw new Error(`Product "${slug}" is not valid for publishing.`);
    bySlug.set(slug, parsed.data as Product);
  }
  return Array.from(bySlug.values());
}

/** Changed slugs from the request body; empty means "rebuild everything". */
async function readChangedSlugs(request: Request): Promise<string[]> {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || !('slugs' in body)) return [];
  const slugs = (body as { slugs: unknown }).slugs;
  if (!Array.isArray(slugs)) return [];
  const unique = Array.from(
    new Set(slugs.filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)),
  );
  return unique.length > MAX_INCREMENTAL_SLUGS ? [] : unique;
}

export async function POST(request: Request) {
  try {
    await requireFirebaseAdmin(request);

    const changed = await readChangedSlugs(request);
    const products = (changed.length ? await patchSnapshot(changed) : null)
      ?? parseProducts(await readFirestoreProducts());
    // Refuse to replace a good snapshot with nothing — a transient Firestore
    // failure must not be able to empty the live catalog.
    if (!products.length) {
      return NextResponse.json(
        { error: 'Firestore returned no valid products; the existing snapshot was kept.' },
        { status: 502 },
      );
    }

    await putCatalogSnapshot(products);
    revalidateTag(PUBLIC_PRODUCTS_TAG);
    // revalidateTag only busts unstable_cache; lib/public-products also holds
    // an in-process copy that would otherwise outlive this publish.
    resetPublicProductsMemo();
    return NextResponse.json({ published: products.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'forbidden' ? 403 : message === 'unauthorized' ? 401 : 500;
    if (status === 500) console.error('[catalog] publish failed', error);
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
