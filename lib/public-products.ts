import 'server-only';

import { unstable_cache } from 'next/cache';

import { getProducts } from '@/lib/content';
import type { Product } from '@/lib/types';

/**
 * The public catalog read path.
 *
 * Firestore is deliberately NOT in this path. It used to be: every page read
 * the whole 285-document collection on a short revalidate window, which burned
 * ~410k reads/day against the Spark plan's 50,000 free quota. Once exhausted,
 * every read 429'd and the site silently served a stale local catalog whose
 * images had been deleted — the entire product catalog rendered broken.
 *
 * Now Firestore is the admin CMS only. Admin writes publish a snapshot to R2
 * (app/api/admin/publish-catalog), and the public site reads that. R2 has no
 * read quota and free egress, so public traffic costs nothing and cannot be
 * rate-limited, at any scale.
 *
 *   1. development        → bundled content/products.json (never touch prod)
 *   2. R2 snapshot        → the published catalog
 *   3. anything failed    → bundled content/products.json, loudly logged
 */

/** Busted by the publish route so a new snapshot goes live immediately. */
export const PUBLIC_PRODUCTS_TAG = 'public-products';

/**
 * How long a Fluid Compute instance may reuse its in-process copy of the
 * catalog before re-reading. Matches the `unstable_cache` window below: the
 * memo is a second tier in front of it, not a longer-lived one.
 */
const MEMO_TTL_MS = 86_400_000;

/** Local `npm run dev` must never spend the production read budget. */
function preferBundledCatalog() {
  return process.env.NODE_ENV === 'development' && process.env.USE_LIVE_CATALOG !== '1';
}

/**
 * The snapshot is written by app/api/admin/publish-catalog, which validates
 * every document with `productSchema` *before* it reaches R2. Re-validating on
 * the read path meant a Zod `safeParse` across ~285 products (a ~930 KB
 * document) on every cache miss — the dominant CPU cost of the dynamic routes,
 * and pure waste on data we authored ourselves. Read-side validation is now a
 * cheap structural check; a malformed entry is dropped exactly as before.
 */
function isProduct(entry: unknown): entry is Product {
  if (typeof entry !== 'object' || entry === null) return false;
  const candidate = entry as Partial<Product>;
  return (
    typeof candidate.slug === 'string' &&
    candidate.slug.length > 0 &&
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.category === 'string' &&
    candidate.category.length > 0 &&
    typeof candidate.imageUrl === 'string' &&
    candidate.imageUrl.length > 0
  );
}

/**
 * `unstable_cache` rather than fetch-level caching: the R2 read goes through
 * the S3 client, so there is no `fetch` for `revalidateTag` to attach to. This
 * also keeps the dynamic /shop route from hitting R2 once per request.
 *
 * Note this tier still costs a full JSON serialize/deserialize of the catalog
 * per miss, which is why `loadCatalog` memoizes the result in process.
 */
const readSnapshot = unstable_cache(
  async (): Promise<Product[] | null> => {
    // Dynamic import: lib/r2 needs credentials, and an environment without them
    // (vitest, CI, a preview build) must fall through to the bundled catalog
    // rather than fail on import.
    const { getCatalogSnapshot } = await import('@/lib/r2');
    const raw = await getCatalogSnapshot();
    if (!raw) return null;

    const products = raw.filter(isProduct);
    if (!products.length) return null;

    // Keep the bundled catalog's ordering; anything new lands after it.
    const order = new Map(getProducts().map((product, index) => [product.slug, index]));
    return products.sort((a, b) => {
      const aOrder = order.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = order.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || a.name.localeCompare(b.name);
    });
  },
  ['public-catalog'],
  { tags: [PUBLIC_PRODUCTS_TAG], revalidate: 86400 },
);

/**
 * The catalog plus the lookup indexes built from it, memoized for the lifetime
 * of the serverless instance.
 *
 * Fluid Compute reuses an instance across many requests, so this turns the
 * catalog read into a once-per-instance cost instead of a once-per-request
 * one — it elides the R2 round trip, the `unstable_cache` deserialize, the
 * filter and the sort. The indexes are what remove the O(n) `.find()` and
 * `.filter()` scans that ran on every product and quote page render.
 */
interface Catalog {
  products: Product[];
  bySlug: Map<string, Product>;
  byCategory: Map<string, Product[]>;
}

let memo: { catalog: Catalog; expires: number } | null = null;
/** Concurrent requests on a cold instance must share one load, not race it. */
let inFlight: Promise<Catalog> | null = null;

function indexCatalog(products: Product[]): Catalog {
  const bySlug = new Map<string, Product>();
  const byCategory = new Map<string, Product[]>();
  for (const product of products) {
    bySlug.set(product.slug, product);
    const bucket = byCategory.get(product.category);
    if (bucket) bucket.push(product);
    else byCategory.set(product.category, [product]);
  }
  return { products, bySlug, byCategory };
}

async function readCatalog(): Promise<Catalog> {
  if (preferBundledCatalog()) return indexCatalog(getProducts());

  try {
    const snapshot = await readSnapshot();
    if (snapshot) return indexCatalog(snapshot);
    console.error(
      '[catalog] No catalog snapshot in R2 — serving the bundled content/products.json. ' +
        'Run `npm run catalog:publish -- --apply` to publish one.',
    );
  } catch (error) {
    /**
     * Never swallow this. A silent fallback here is exactly what hid the
     * original outage: the bundled catalog is only as fresh as its last sync,
     * and its image URLs can point at files that no longer exist.
     */
    console.error(
      '[catalog] R2 snapshot read failed — serving the bundled content/products.json fallback.',
      error,
    );
  }

  return indexCatalog(getProducts());
}

async function loadCatalog(): Promise<Catalog> {
  if (memo && memo.expires > Date.now()) return memo.catalog;
  inFlight ??= readCatalog()
    .then((catalog) => {
      memo = { catalog, expires: Date.now() + MEMO_TTL_MS };
      return catalog;
    })
    .finally(() => {
      // Clear unconditionally so a failed read is retried rather than pinned.
      inFlight = null;
    });
  return inFlight;
}

/**
 * Drops the in-process memo. `revalidateTag` only busts `unstable_cache`, so
 * the publish route calls this too — otherwise the instance that served the
 * publish would keep answering from its pre-publish copy.
 */
export function resetPublicProductsMemo() {
  memo = null;
  inFlight = null;
}

export async function getPublicProducts(): Promise<Product[]> {
  return (await loadCatalog()).products;
}

export async function getPublicProduct(slug: string) {
  return (await loadCatalog()).bySlug.get(slug);
}

export async function getPublicProductsByCategory(categorySlug: string) {
  return (await loadCatalog()).byCategory.get(categorySlug) ?? [];
}
