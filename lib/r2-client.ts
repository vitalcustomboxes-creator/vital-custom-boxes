'use client';

import { firebaseAuth } from '@/lib/firebase/client';

const LOCAL_R2_PREFIX = '/api/product-images/';

async function authorizationHeaders() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Your admin session has expired. Please sign in again.');
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

export function isManagedProductImage(url: string) {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  return url.startsWith(LOCAL_R2_PREFIX) || Boolean(publicBase && url.startsWith(`${publicBase}/`));
}

export function dataUrlToBlob(dataUrl: string) {
  const separator = dataUrl.indexOf(',');
  if (!dataUrl.startsWith('data:') || separator < 0) throw new Error('The selected image data is invalid.');

  const metadata = dataUrl.slice(5, separator);
  const contentType = metadata.split(';')[0] || 'application/octet-stream';
  const encoded = dataUrl.slice(separator + 1);
  try {
    if (metadata.includes(';base64')) {
      const binary = globalThis.atob(encoded);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new Blob([bytes], { type: contentType });
    }
    return new Blob([decodeURIComponent(encoded)], { type: contentType });
  } catch {
    throw new Error('The selected image data could not be read.');
  }
}

export async function uploadProductImageDataUrl(dataUrl: string, productSlug: string) {
  const blob = dataUrlToBlob(dataUrl);
  const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'image';
  const form = new FormData();
  form.set('file', blob, `product.${extension}`);
  form.set('productSlug', productSlug);

  const response = await fetch('/api/admin/product-images/', {
    method: 'POST',
    headers: await authorizationHeaders(),
    body: form,
  });
  const result = await response.json() as { imageUrl?: string; error?: string };
  if (!response.ok || !result.imageUrl) throw new Error(result.error ?? 'The image could not be uploaded.');
  return result.imageUrl;
}

/** The DELETE route accepts 100 URLs per call; a bulk delete can exceed that. */
const IMAGE_BATCH = 100;

function batches<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size));
}

export async function deleteManagedProductImages(urls: string[]) {
  const managed = urls.filter(isManagedProductImage);
  if (!managed.length) return;
  for (const batch of batches(managed, IMAGE_BATCH)) {
    const response = await fetch('/api/admin/product-images/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...await authorizationHeaders() },
      body: JSON.stringify({ urls: batch }),
    });
    if (!response.ok) throw new Error('The R2 image cleanup could not be completed.');
  }
}

/**
 * Fetch one customer artwork file as a temporary object URL.
 *
 * A plain `<a href>` cannot carry the admin bearer token, and the artwork
 * route refuses anonymous requests by design — so the bytes come through
 * `fetch` and are handed to the browser as a blob instead.
 *
 * The caller owns the URL. It is revoked automatically after ten minutes so a
 * long-lived admin session cannot leak blobs, which is ample for a preview
 * tab or a download to start.
 */
export async function fetchLeadArtworkUrl(key: string): Promise<string> {
  const query = new URLSearchParams({ key });
  const response = await fetch(`/api/admin/lead-artwork/?${query}`, { headers: await authorizationHeaders() });
  if (!response.ok) throw new Error('The artwork file could not be opened.');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  setTimeout(() => URL.revokeObjectURL(url), 600_000);
  return url;
}

/**
 * Delete the artwork of a submission being removed. Call it with keys read
 * from the document *before* that document is deleted — nothing else records
 * them, so afterwards the files can no longer be identified.
 */
export async function deleteLeadArtworkFiles(keys: string[]) {
  if (!keys.length) return;
  for (const batch of batches(keys, IMAGE_BATCH)) {
    const response = await fetch('/api/admin/lead-artwork/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...await authorizationHeaders() },
      body: JSON.stringify({ keys: batch }),
    });
    if (!response.ok) throw new Error('The artwork cleanup could not be completed.');
  }
}

export async function downloadLeadArtwork(key: string, filename: string) {
  const url = await fetchLeadArtworkUrl(key);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Every image the given products own, read from the published catalog. The
 * admin table only carries a thumbnail URL, so deletes resolve the rest here
 * rather than shipping every gallery to the dashboard. Call this *before*
 * deleting the products: once they leave the snapshot their images are
 * unresolvable, and orphaned objects linger in R2.
 */
export async function getProductImageUrls(slugs: string[]): Promise<string[]> {
  const found: string[] = [];
  // Chunked to keep the query string well inside URL length limits.
  for (const batch of batches(slugs, 50)) {
    const query = new URLSearchParams({ slugs: batch.join(',') });
    const response = await fetch(`/api/admin/product-images/?${query}`, { headers: await authorizationHeaders() });
    if (!response.ok) throw new Error('The product images could not be resolved.');
    const result = await response.json() as { urls?: unknown };
    if (Array.isArray(result.urls)) found.push(...result.urls.filter((url): url is string => typeof url === 'string'));
  }
  return found;
}
