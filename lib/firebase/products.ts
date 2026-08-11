'use client';

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';

import type { AdminProduct, CategoryOption } from '@/lib/admin-product';
import { firebaseAuth, firestore } from '@/lib/firebase/client';

const PRODUCTS_COLLECTION = 'products';

/**
 * Republish the catalog snapshot the public site reads. Admin writes go
 * browser → Firestore directly, so nothing server-side would otherwise notice
 * the change.
 *
 * Pass the slugs that changed. The route then re-reads only those documents
 * instead of the whole collection, which is the difference between one
 * Firestore read per save and one per product in the catalog. Omit them only
 * when the change is genuinely catalog-wide.
 *
 * Never throws: the Firestore write has already committed, and reporting it as
 * failed would be a lie. But it does return whether the publish landed — a
 * failure means the live site keeps serving the previous catalog, and silent
 * staleness is the exact bug class this architecture exists to prevent, so
 * callers must surface it.
 */
async function publishCatalog(changedSlugs?: string[]): Promise<boolean> {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return false;
    const response = await fetch('/api/admin/publish-catalog/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slugs: changedSlugs ?? [] }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
type StoredProduct = Omit<AdminProduct, 'categoryName'>;

function toStoredProduct(product: AdminProduct): StoredProduct {
  const { categoryName: _categoryName, ...stored } = product;
  void _categoryName;
  return stored;
}

function toAdminProduct(data: DocumentData, id: string, categories: CategoryOption[]): AdminProduct {
  const category = typeof data.category === 'string' ? data.category : '';
  return {
    slug: typeof data.slug === 'string' && data.slug ? data.slug : id,
    name: typeof data.name === 'string' ? data.name : '',
    title: typeof data.title === 'string' ? data.title : (typeof data.name === 'string' ? data.name : ''),
    category,
    categoryName: categories.find((item) => item.slug === category)?.name ?? category,
    description: typeof data.description === 'string' ? data.description : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
    imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : (typeof data.name === 'string' ? data.name : ''),
    images: Array.isArray(data.images) ? data.images : [],
    sku: typeof data.sku === 'string' ? data.sku : '',
    copyStatus: data.copyStatus === 'live' ? 'live' : 'derived',
    related: Array.isArray(data.related) ? data.related : [],
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    materials: Array.isArray(data.materials) ? data.materials : [],
    finishes: Array.isArray(data.finishes) ? data.finishes : [],
    bestFor: Array.isArray(data.bestFor) ? data.bestFor : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
  };
}

/*
 * Two things deliberately absent here, both of which cost reads on every
 * portal load and neither of which the dashboard needs:
 *
 *  - a collection-wide `onSnapshot`. It billed one read per product each time
 *    the portal mounted; the admin list is server-rendered from the published
 *    R2 snapshot instead (app/admin/page.tsx).
 *  - a browser-side "seed Firestore if the collection is empty" check. First
 *    time setup is `npm run catalog:import -- --apply`, which uploads the
 *    images alongside the documents; the portal only ever renders a catalog
 *    that already exists.
 *
 * Only single-document reads belong below.
 */

export async function getProductDocument(slug: string, categories: CategoryOption[]) {
  const snapshot = await getDoc(doc(firestore, PRODUCTS_COLLECTION, slug));
  return snapshot.exists() ? toAdminProduct(snapshot.data(), snapshot.id, categories) : null;
}

/**
 * Pick a free document id for a new product. Slugs are derived from the product
 * name, so two products called the same thing would otherwise silently
 * overwrite each other; the second one becomes `name-2`, and so on.
 */
export async function reserveProductSlug(base: string) {
  for (let attempt = 1; attempt <= 100; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const snapshot = await getDoc(doc(firestore, PRODUCTS_COLLECTION, candidate));
    if (!snapshot.exists()) return candidate;
  }
  throw new Error('Too many products share this name. Please use a more specific product name.');
}

/** `published: false` means the write landed but the live site is still stale. */
export interface WriteResult {
  published: boolean;
}

export async function saveProductDocument(
  product: AdminProduct,
  originalSlug: string,
): Promise<WriteResult> {
  if (originalSlug !== product.slug) {
    const batch = writeBatch(firestore);
    batch.set(doc(firestore, PRODUCTS_COLLECTION, product.slug), toStoredProduct(product));
    batch.delete(doc(firestore, PRODUCTS_COLLECTION, originalSlug));
    await batch.commit();
  } else {
    await setDoc(doc(firestore, PRODUCTS_COLLECTION, product.slug), toStoredProduct(product));
  }
  // A rename touches two slugs: the new document and the one it replaced.
  return { published: await publishCatalog([product.slug, originalSlug]) };
}

export async function deleteProductDocument(slug: string): Promise<WriteResult> {
  await deleteDoc(doc(firestore, PRODUCTS_COLLECTION, slug));
  return { published: await publishCatalog([slug]) };
}

export async function deleteProductDocuments(slugs: string[]): Promise<WriteResult> {
  for (let start = 0; start < slugs.length; start += 500) {
    const batch = writeBatch(firestore);
    slugs.slice(start, start + 500).forEach((slug) => batch.delete(doc(firestore, PRODUCTS_COLLECTION, slug)));
    await batch.commit();
  }
  return { published: await publishCatalog(slugs) };
}
