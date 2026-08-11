#!/usr/bin/env node

/**
 * Rebuild catalog image URLs from R2 object names — without Firestore.
 *
 * WHY THIS EXISTS
 * ---------------
 * The product→image mapping normally lives in Firestore. When the Firestore
 * read quota is exhausted it is unreachable, and content/products.json still
 * points at the public/ folders that were deleted after the R2 migration — so
 * the catalog renders dead images with no way to recover.
 *
 * But the mapping is recoverable from R2 alone, because
 * scripts/import-products-to-firebase-r2.mjs encoded it in the object key:
 *
 *     products/{slug}/import-{primary|gallery-N}-{hash}-{name}.{ext}
 *
 * The slug, the slot, and the gallery order are all right there. This script
 * lists the bucket and rewrites content/products.json from that.
 *
 * WHAT IT WILL NOT DO
 * -------------------
 * Images uploaded through the admin UI are named with a bare UUID and carry no
 * slot or ordering information. Where a product has only those, picking a
 * "primary" would be a guess, so the product is SKIPPED and reported. Same for
 * products with no R2 objects at all. Those need the Firestore mapping.
 *
 * USAGE
 *   npm run catalog:rebuild-images              # dry run
 *   npm run catalog:rebuild-images -- --apply
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = join(root, 'content', 'products.json');
const publicDir = join(root, 'public');
const apply = process.argv.includes('--apply');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

/** Same encoding lib/r2.ts productImageUrl() produces. */
function imageUrlFor(key) {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  if (publicBase) return `${publicBase}/${key}`;
  return `/api/product-images/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** Does the URL still resolve to a file on disk under public/? */
function resolvesLocally(url) {
  if (typeof url !== 'string' || !url.startsWith('/')) return false;
  return existsSync(join(publicDir, decodeURIComponent(url.split(/[?#]/)[0]).slice(1)));
}

const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
const r2 = new S3Client({
  region: 'auto',
  endpoint: required('R2_ENDPOINT'),
  forcePathStyle: true,
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
});

const keys = [];
let continuationToken;
do {
  const page = await r2.send(new ListObjectsV2Command({
    Bucket: required('R2_BUCKET_NAME'),
    Prefix: 'products/',
    ContinuationToken: continuationToken,
    MaxKeys: 1000,
  }));
  (page.Contents ?? []).forEach((object) => keys.push(object.Key));
  continuationToken = page.NextContinuationToken;
} while (continuationToken);

/** slug → { primary, gallery: [{ index, key }], unnamed: [key] }. */
const bySlug = new Map();
for (const key of keys) {
  const [, slug, ...rest] = key.split('/');
  const file = rest.join('/');

  if (!bySlug.has(slug)) bySlug.set(slug, { primary: null, gallery: [], unnamed: [] });
  const entry = bySlug.get(slug);

  const match = file.match(/^import-(primary|gallery-(\d+))-/);
  if (!match) {
    // Uploaded through the admin UI: a bare UUID, no slot in the name.
    entry.unnamed.push(key);
    continue;
  }
  if (match[1] === 'primary') entry.primary = key;
  else entry.gallery.push({ index: Number(match[2]), key });
}

for (const entry of bySlug.values()) {
  entry.gallery.sort((a, b) => a.index - b.index);

  /**
   * No migration-named primary, but exactly one admin upload sitting next to
   * the named gallery files: that upload IS the primary. Replacing a product's
   * cover photo in the admin is what produces this shape, and with a single
   * candidate there is nothing to guess. Two or more unnamed objects stay
   * ambiguous and are left alone.
   */
  if (!entry.primary && entry.unnamed.length === 1) {
    entry.primary = entry.unnamed[0];
    entry.inferredPrimary = true;
  }
}

const products = JSON.parse(readFileSync(productsPath, 'utf8'));

const rebuilt = [];
const inferred = [];
const skipped = [];
const untouched = [];

const next = products.map((product) => {
  const found = bySlug.get(product.slug);

  if (!found?.primary) {
    // Nothing deterministic to use. Leave the product exactly as it is and say so.
    (resolvesLocally(product.imageUrl) ? untouched : skipped).push(product.slug);
    return product;
  }

  const updated = { ...product, imageUrl: imageUrlFor(found.primary) };
  if (found.gallery.length) {
    updated.images = found.gallery.map((item, position) => ({
      src: imageUrlFor(item.key),
      // Alt text is not recoverable from a key — carry the existing copy over
      // positionally, since gallery-N was written from images[N-1].
      alt: product.images?.[position]?.alt ?? product.imageAlt ?? product.name,
    }));
  }
  if (found.inferredPrimary) inferred.push(product.slug);
  rebuilt.push(product.slug);
  return updated;
});

console.log(`R2 objects scanned:        ${keys.length}`);
console.log(`Products in catalog:       ${products.length}`);
console.log('');
console.log(`Rebuilt from R2:           ${rebuilt.length}`);
console.log(`  ...of which the primary was inferred from a lone admin upload: ${inferred.length}`);
if (inferred.length) inferred.forEach((slug) => console.log(`     ${slug}`));
console.log(`Left alone (still valid):  ${untouched.length}`);
console.log(`SKIPPED — nothing usable in R2: ${skipped.length}`);
if (skipped.length) skipped.forEach((slug) => console.log(`   ${slug}`));

const stillBroken = next.filter(
  (product) => !product.imageUrl.startsWith('/api/product-images/')
    && !product.imageUrl.startsWith('http')
    && !resolvesLocally(product.imageUrl),
);
console.log('');
console.log(`Primary images still broken after this: ${stillBroken.length}`);

if (!apply) {
  console.log('\nDry run. Re-run with --apply to write content/products.json.');
} else {
  writeFileSync(productsPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log('\n✓ content/products.json rewritten. Review with `git diff content/products.json`.');
}
