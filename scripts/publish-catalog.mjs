#!/usr/bin/env node

/**
 * Publish the catalog snapshot the public site reads — from the CLI.
 *
 * WHY THIS EXISTS
 * ---------------
 * The public site no longer reads Firestore (see lib/public-products.ts). It
 * reads `catalog/products.json` from R2, which the admin republishes on every
 * save via POST /api/admin/publish-catalog. But before the first save there is
 * no snapshot at all, so the site would sit on the bundled fallback. This
 * seeds it without needing the admin UI, and doubles as a recovery tool.
 *
 * `--write-fallback` additionally rewrites content/products.json. That bundled
 * file is the last-resort tier, and it is currently stale: its image URLs
 * point at 165 primary + 719 gallery files that were deleted from public/ when
 * the images moved to R2. Refreshing it makes the fallback survivable.
 *
 * USAGE
 *   npm run catalog:publish                                # dry run
 *   npm run catalog:publish -- --apply                     # publish to R2
 *   npm run catalog:publish -- --apply --write-fallback    # + refresh bundled JSON
 *
 * Costs one Firestore collection scan (~285 reads).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = join(root, 'content', 'products.json');
const apply = process.argv.includes('--apply');
const writeFallback = process.argv.includes('--write-fallback');

/** Must match CATALOG_SNAPSHOT_KEY in lib/r2.ts. */
const SNAPSHOT_KEY = 'catalog/products.json';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

/* --------------------------- Firestore REST read --------------------------- */

function decodeValue(value) {
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

function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function fetchFirestoreProducts() {
  const projectId = required('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const apiKey = required('NEXT_PUBLIC_FIREBASE_API_KEY');
  const documents = [];
  let pageToken = '';

  do {
    const endpoint = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`,
    );
    endpoint.searchParams.set('pageSize', '100');
    endpoint.searchParams.set('key', apiKey);
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    const response = await fetch(endpoint);
    if (response.status === 429) {
      throw new Error(
        'Firestore read quota is exhausted (429). The Spark-plan quota resets at midnight ' +
          'US/Pacific — re-run this then.',
      );
    }
    if (!response.ok) throw new Error(`Firestore request failed with ${response.status}.`);
    const page = await response.json();
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return documents.map((document) => decodeFields(document.fields ?? {}));
}

/* -------------------------------- reporting -------------------------------- */

function imageUrls(product) {
  return [product.imageUrl, ...(product.images ?? []).map((image) => image.src)].filter(Boolean);
}

const isOnR2 = (url) => url.startsWith('/api/product-images/') || url.startsWith('http');

const local = JSON.parse(readFileSync(productsPath, 'utf8'));
const remote = await fetchFirestoreProducts();

if (!remote.length) {
  throw new Error('Firestore returned no products — refusing to publish an empty catalog.');
}

// Preserve the bundled file's ordering; append anything Firestore has that it lacks.
const bySlug = new Map(remote.map((product) => [product.slug, product]));
const merged = [
  ...local.map((product) => bySlug.get(product.slug) ?? product),
  ...remote.filter((product) => !local.some((entry) => entry.slug === product.slug)),
];

const missing = local.filter((product) => !bySlug.has(product.slug));
const before = local.flatMap(imageUrls);
const after = merged.flatMap(imageUrls);
const onR2 = (urls) => urls.filter(isOnR2).length;

console.log(`Firestore products: ${remote.length}`);
console.log(`Bundled products:   ${local.length}`);
console.log(`Merged total:       ${merged.length}`);
if (missing.length) {
  console.log(`\n⚠ ${missing.length} bundled product(s) absent from Firestore — kept as-is:`);
  missing.slice(0, 10).forEach((product) => console.log(`   ${product.slug}`));
}
console.log(`\nImages on R2: ${onR2(before)}/${before.length} (bundled) → ${onR2(after)}/${after.length} (merged)`);

if (!apply) {
  console.log('\nDry run. Re-run with --apply to publish the R2 snapshot.');
  process.exit(0);
}

/* --------------------------------- publish --------------------------------- */

const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
const r2 = new S3Client({
  region: 'auto',
  endpoint: required('R2_ENDPOINT'),
  forcePathStyle: true,
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
});

await r2.send(new PutObjectCommand({
  Bucket: required('R2_BUCKET_NAME'),
  Key: SNAPSHOT_KEY,
  Body: JSON.stringify(merged),
  ContentType: 'application/json',
  CacheControl: 'no-cache',
}));
console.log(`\n✓ Published ${merged.length} products to R2 (${SNAPSHOT_KEY}).`);

if (writeFallback) {
  writeFileSync(productsPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log('✓ content/products.json refreshed. Review the diff before committing.');
} else {
  console.log('  (bundled content/products.json unchanged — pass --write-fallback to refresh it)');
}
