#!/usr/bin/env node
/**
 * One-time catalog consolidation for the duplicate-product audit (2026-07-14).
 *
 * Keeps the live/custom canonical records, carries useful galleries forward,
 * rewrites related-product references, and rebuilds inverse category mappings.
 * Redirect generation is handled separately by scripts/gen-redirects.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = join(root, 'content', 'products.json');
const categoriesPath = join(root, 'content', 'categories.json');
const products = JSON.parse(readFileSync(productsPath, 'utf8'));
const categories = JSON.parse(readFileSync(categoriesPath, 'utf8'));

const consolidations = [
  ['cream-boxes', 'custom-cream-boxes', 'replace'],
  ['hair-extension-boxes', 'custom-hair-extension-boxes', 'append'],
  ['lotion-boxes', 'custom-lotion-boxes', 'replace'],
  ['press-on-nail-boxes', 'custom-press-on-nail-boxes', 'replace'],
  ['soap-boxes', 'custom-soap-boxes', 'append'],
  ['nail-polish-boxes', 'custom-nail-polish-boxes', 'append'],
  ['custom-kraft-boxes', 'custom-printed-kraft-boxes', 'prepend-primary'],
  ['paper-food-trays', 'custom-paper-food-trays', 'prepend-primary'],
  ['chocolate-boxes', 'custom-chocolate-boxes', 'append'],
  ['cbd-bath-bomb-packaging', 'cbd-bath-bomb-packaging-boxes', 'replace'],
  ['mushroom-chocolate-bar-packaging', 'custom-mushroom-chocolate-bar-packaging', 'replace'],
  ['gift-card-boxes', 'custom-gift-card-boxes', 'replace'],
  ['action-figure-packaging', 'custom-action-figure-packaging-boxes', 'prepend-primary'],
  ['book-boxes', 'custom-book-boxes', 'keep'],
  ['eyeshadow-boxes', 'custom-eyeshadow-boxes', 'replace'],
  ['regular-six-corner-boxes', 'custom-regular-six-corner-box', 'prepend-primary'],
];

if (products.length !== 301) {
  throw new Error(`Expected the pre-consolidation 301-product catalog; found ${products.length}`);
}

const bySlug = new Map(products.map((product) => [product.slug, product]));
const replacement = new Map(consolidations.map(([remove, keep]) => [remove, keep]));

for (const [removeSlug, keepSlug, galleryMode] of consolidations) {
  const removed = bySlug.get(removeSlug);
  const retained = bySlug.get(keepSlug);
  if (!removed || !retained) {
    throw new Error(`Missing consolidation record: ${removeSlug} -> ${keepSlug}`);
  }

  const retainedPrimary = {
    src: retained.imageUrl,
    alt: retained.imageAlt ?? `${retained.name} packaging example`,
  };
  const removedGallery = removed.images ?? [];
  let gallery = retained.images ?? [];

  if (galleryMode === 'replace') gallery = removedGallery;
  if (galleryMode === 'append') gallery = [...gallery, ...removedGallery];
  if (galleryMode === 'prepend-primary') {
    gallery = [retainedPrimary, ...gallery, ...removedGallery];
  }

  if (galleryMode !== 'keep') {
    const seen = new Set();
    retained.images = gallery
      .filter((image) => image?.src && !seen.has(image.src) && seen.add(image.src))
      .map((image, index) => ({
        src: image.src,
        alt: `${retained.name} packaging example ${index + 1}`,
      }));
  }
}

const retainedProducts = products.filter((product) => !replacement.has(product.slug));
const retainedSlugs = new Set(retainedProducts.map((product) => product.slug));

for (const product of retainedProducts) {
  if (product.slug === 'ice-cream-cone-holder') {
    product.category = 'custom-food-boxes';
  }

  if (product.related) {
    const seen = new Set([product.slug]);
    product.related = product.related
      .map((slug) => replacement.get(slug) ?? slug)
      .filter((slug) => retainedSlugs.has(slug) && !seen.has(slug) && seen.add(slug));
  }
}

for (const category of categories) {
  category.productSlugs = retainedProducts
    .filter((product) => product.category === category.slug)
    .map((product) => product.slug);
  if (category.intro) {
    category.intro = category.intro.replace(
      /^Explore \d+ /,
      `Explore ${category.productSlugs.length} `,
    );
  }
}

writeFileSync(productsPath, `${JSON.stringify(retainedProducts, null, 2)}\n`, 'utf8');
writeFileSync(categoriesPath, `${JSON.stringify(categories, null, 2)}\n`, 'utf8');

console.log(`Consolidated ${consolidations.length} duplicate records.`);
console.log(`Products: ${products.length} -> ${retainedProducts.length}`);
console.log('Moved ice-cream-cone-holder -> custom-food-boxes.');
