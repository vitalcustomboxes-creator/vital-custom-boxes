import 'server-only';

import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2 holds two kinds of object:
 *  - `products/…`  immutable product images, served through
 *                  app/api/product-images/[...key] (which refuses any other prefix)
 *  - `catalog/…`   the published catalog snapshot the public site reads instead
 *                  of Firestore. Deliberately outside the `products/` prefix so
 *                  it can never be fetched through the public image proxy.
 */
export const CATALOG_SNAPSHOT_KEY = 'catalog/products.json';

/**
 * Lazy client. This module used to build the S3 client at import time and throw
 * when credentials were absent — fine while only admin routes imported it, but
 * lib/public-products.ts now does, and a credential-less environment (vitest,
 * CI, a preview build without R2 secrets) must degrade to the local fallback
 * rather than crash on import.
 */
let client: S3Client | null = null;

function config() {
  const bucket = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 environment variables are incomplete.');
  }
  return { bucket, endpoint, accessKeyId, secretAccessKey };
}

function getR2() {
  if (client) return client;
  const { endpoint, accessKeyId, secretAccessKey } = config();
  client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

function bucketName() {
  return config().bucket;
}

export function productImageUrl(key: string) {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  if (publicBase) return `${publicBase}/${key}`;
  return `/api/product-images/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export function productImageKey(url: string) {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  let encodedKey = '';
  if (url.startsWith('/api/product-images/')) encodedKey = url.slice('/api/product-images/'.length);
  else if (publicBase && url.startsWith(`${publicBase}/`)) encodedKey = url.slice(publicBase.length + 1);
  if (!encodedKey) return null;

  const key = encodedKey.split('/').map(decodeURIComponent).join('/');
  return key.startsWith('products/') && !key.includes('..') ? key : null;
}

export function uploadProductImage(key: string, body: Uint8Array, contentType: string) {
  return getR2().send(new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

export function getProductImage(key: string) {
  return getR2().send(new GetObjectCommand({ Bucket: bucketName(), Key: key }));
}

export async function deleteProductImageUrls(urls: string[]) {
  const keys = Array.from(new Set(urls.map(productImageKey).filter((key): key is string => Boolean(key))));
  if (!keys.length) return;
  await getR2().send(new DeleteObjectsCommand({
    Bucket: bucketName(),
    Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
  }));
}

/* -------------------------------- lead artwork ------------------------------- */

/**
 * Customer artwork attached to a quote request.
 *
 * Deliberately its own prefix, and deliberately never turned into a public URL:
 * a die-line is the customer's confidential work, unlike `products/` imagery.
 * The only way to read it back is app/api/admin/lead-artwork, behind an admin
 * token. Keys carry a random segment so they cannot be enumerated.
 */
export const LEAD_ARTWORK_PREFIX = 'leads/';

export function isLeadArtworkKey(key: string) {
  return key.startsWith(LEAD_ARTWORK_PREFIX) && !key.includes('..');
}

export function uploadLeadArtwork(key: string, body: Uint8Array, contentType: string) {
  if (!isLeadArtworkKey(key)) throw new Error('Refusing to write outside the lead artwork prefix.');
  return getR2().send(new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    // No public caching headers: this object is only ever served through an
    // authenticated route, one request at a time.
    CacheControl: 'private, no-store',
  }));
}

export function getLeadArtwork(key: string) {
  if (!isLeadArtworkKey(key)) throw new Error('Refusing to read outside the lead artwork prefix.');
  return getR2().send(new GetObjectCommand({ Bucket: bucketName(), Key: key }));
}

/** Private email link: grants read-only access to one artwork file for 7 days. */
export function getLeadArtworkSignedUrl(key: string, filename: string) {
  if (!isLeadArtworkKey(key)) {
    throw new Error('Refusing to sign outside the lead artwork prefix.');
  }
  const safeFilename = filename.replace(/["\r\n]/g, '').slice(0, 120) || 'artwork';
  return getSignedUrl(
    getR2(),
    new GetObjectCommand({
      Bucket: bucketName(),
      Key: key,
      ResponseContentDisposition: `inline; filename="${safeFilename}"`,
    }),
    { expiresIn: 60 * 60 * 24 * 7 },
  );
}

/**
 * Remove artwork belonging to a deleted submission. Its keys live only on that
 * document, so this has to happen alongside the delete or the files become
 * unreachable — billable garbage nothing can ever name again.
 */
export async function deleteLeadArtwork(keys: string[]) {
  const valid = Array.from(new Set(keys.filter(isLeadArtworkKey)));
  if (!valid.length) return;
  await getR2().send(new DeleteObjectsCommand({
    Bucket: bucketName(),
    Delete: { Objects: valid.map((Key) => ({ Key })), Quiet: true },
  }));
}

/* ------------------------------ catalog snapshot ----------------------------- */

/**
 * Publish the catalog the public site reads. Unlike product images this object
 * is mutable, so it must not carry the immutable cache header above — a stale
 * edge copy would silently serve an old catalog.
 */
export async function putCatalogSnapshot(products: unknown[]) {
  await getR2().send(new PutObjectCommand({
    Bucket: bucketName(),
    Key: CATALOG_SNAPSHOT_KEY,
    Body: JSON.stringify(products),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}

/** Returns the raw snapshot array, or null when it has never been published. */
export async function getCatalogSnapshot(): Promise<unknown[] | null> {
  const object = await getR2().send(
    new GetObjectCommand({ Bucket: bucketName(), Key: CATALOG_SNAPSHOT_KEY }),
  );
  if (!object.Body) return null;
  const parsed: unknown = JSON.parse(await object.Body.transformToString());
  return Array.isArray(parsed) ? parsed : null;
}
