#!/usr/bin/env node
/**
 * gen-redirects.mjs — generates lib/redirects.ts (full static redirect map).
 *
 * Owner: SEO-1 (file lives in scripts/, coordinate with DEVOPS).
 * Usage:  node scripts/gen-redirects.mjs
 *
 * Source of truth: docs/PROJECT_BRIEF.md "Redirects" section, verified against the
 * LIVE sitemaps on 2026-06-12:
 *   - https://www.hmcustompackaging.com/locations-sitemap.xml      (221 doorway URLs)
 *   - https://www.hmcustompackaging.com/business-card-sitemap.xml  (31 doorway URLs + hub)
 *   - https://www.hmcustompackaging.com/products-sitemap.xml       (merge sources + targets)
 *   - https://www.hmcustompackaging.com/page-sitemap.xml           (utility sources + category targets)
 *
 * Emits exactly 297 next.config-compatible entries:
 *   221 locations + 31 business-card + 4 product merges + 7 utility
 *   + 1 PM-approved extra + 33 catalog consolidation redirects.
 * The legacy `/?page_id=3` (WordPress privacy policy) is a query-string-only URL on `/`
 * and is handled in middleware.ts instead (see docs/seo/REDIRECTS.md).
 *
 * TRAILING_SLASH must match `trailingSlash` in next.config.ts. With trailingSlash: true,
 * Next.js requires redirect sources (and ideally destinations) to carry the trailing
 * slash, which also mirrors the live WordPress URLs exactly (zero-hop matches).
 */

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TRAILING_SLASH = true; // keep in sync with next.config.ts
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const products = JSON.parse(readFileSync(join(root, 'content', 'products.json'), 'utf8'));
const categories = JSON.parse(readFileSync(join(root, 'content', 'categories.json'), 'utf8'));
const productBySlug = new Map(products.map((product) => [product.slug, product]));
const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

// ---------------------------------------------------------------------------
// Matrices (per PROJECT_BRIEF.md, verified against live sitemaps 2026-06-12)
// ---------------------------------------------------------------------------

// 13 cities used by the /locations/ pizza doorways.
const LOCATION_CITIES = [
  'new-york-city',
  'los-angeles',
  'chicago',
  'houston',
  'phoenix',
  'philadelphia',
  'san-antonio',
  'san-diego',
  'dallas',
  'san-jose',
  'austin',
  'jacksonville',
  'san-francisco',
];

// 17 doorway variants. Key = slug before `-in-<city>`. Value = final new-site
// target slug. Product entries resolve to /shop/<category>/<slug>/; category
// entries resolve to /shop/<category>/.
const PIZZA_VARIANTS = new Map([
  ['custom-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-cardboard-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-corrugated-pizza-boxes', productTarget('custom-corrugated-pizza-boxes')],
  ['custom-crooked-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-detroit-pizza-boxes', productTarget('custom-detroit-pizza-boxes')],
  ['custom-digital-printed-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-disposable-pizza-boxes', productTarget('custom-disposable-pizza-boxes')],
  ['custom-frozen-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-hexagonal-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-holographic-pizza-boxes-wholesale', categoryTarget('custom-pizza-boxes')],
  ['custom-kraft-pizza-boxes', productTarget('custom-kraft-pizza-boxes')],
  ['custom-luxury-pizza-boxes', productTarget('custom-luxury-pizza-boxes')],
  ['custom-michigan-style-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-octagonal-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['custom-sicilian-pizza-boxes', categoryTarget('custom-pizza-boxes')],
  ['printed-slice-pizza-boxes', productTarget('custom-slice-pizza-boxes')],
  ['custom-unique-shaped-pizza-boxes', categoryTarget('custom-pizza-boxes')],
]);

// 31 business-card doorway cities (incl. the live duplicate `tampa-2`).
// Pattern: /business-card/custom-business-cards-in-<city>/ -> /shop/business-card/
const BUSINESS_CARD_CITIES = [
  'tampa',
  'new-york-city',
  'chicago',
  'houston',
  'dallas',
  'austin',
  'san-francisco',
  'seattle',
  'washington-d-c',
  'boston',
  'denver',
  'atlanta',
  'miami',
  'minneapolis',
  'portland',
  'charlotte',
  'tampa-2',
  'nashville',
  'raleigh',
  'san-jose',
  'los-angeles',
  'san-diego',
  'phoenix',
  'orlando',
  'baltimore',
  'las-vegas',
  'kansas-city',
  'columbus',
  'indianapolis',
  'pittsburgh',
  'salt-lake-city',
];

// 4 merged products (sources are EXCLUDED from content/products.json; 157 -> 153).
const PRODUCT_MERGES = new Map([
  ['/products/custom-hangtags', productTarget('custom-hang-tags')],
  ['/products/custom-drawer-style-boxes', productTarget('custom-rigid-drawer-boxes')],
  ['/products/custom-seeds-boxes', productTarget('custom-printed-seed-boxes')],
  ['/products/custom-pre-rolls-joints-boxes', productTarget('custom-pre-roll-boxes')],
]);

// Duplicate catalog records retired on 2026-07-14. Each retired product has
// two public forms to preserve: its category-qualified shop URL and the legacy
// /products/<slug>/ compatibility URL. Destinations are the retained records.
const CATALOG_CONSOLIDATIONS = [
  ['cream-boxes', 'custom-cosmetics-boxes', 'custom-cream-boxes'],
  ['hair-extension-boxes', 'custom-cosmetics-boxes', 'custom-hair-extension-boxes'],
  ['lotion-boxes', 'custom-cosmetics-boxes', 'custom-lotion-boxes'],
  ['press-on-nail-boxes', 'custom-cosmetics-boxes', 'custom-press-on-nail-boxes'],
  ['soap-boxes', 'custom-cosmetics-boxes', 'custom-soap-boxes'],
  ['nail-polish-boxes', 'custom-cosmetics-boxes', 'custom-nail-polish-boxes'],
  ['custom-kraft-boxes', 'custom-boxes', 'custom-printed-kraft-boxes'],
  ['paper-food-trays', 'custom-takeout-boxes', 'custom-paper-food-trays'],
  ['chocolate-boxes', 'custom-food-boxes', 'custom-chocolate-boxes'],
  ['cbd-bath-bomb-packaging', 'custom-cbd-boxes', 'cbd-bath-bomb-packaging-boxes'],
  ['mushroom-chocolate-bar-packaging', 'custom-cbd-boxes', 'custom-mushroom-chocolate-bar-packaging'],
  ['gift-card-boxes', 'custom-gift-boxes', 'custom-gift-card-boxes'],
  ['action-figure-packaging', 'custom-toy-boxes', 'custom-action-figure-packaging-boxes'],
  ['book-boxes', 'custom-rigid-boxes', 'custom-book-boxes'],
  ['eyeshadow-boxes', 'custom-boxes', 'custom-eyeshadow-boxes'],
  ['regular-six-corner-boxes', 'custom-boxes', 'custom-regular-six-corner-box'],
];

const CATEGORY_MOVES = [
  ['ice-cream-cone-holder', 'custom-cosmetics-boxes', 'ice-cream-cone-holder'],
];

// 7 utility redirects (legacy WP account/commerce pages with no new-site equivalent).
const UTILITY = new Map([
  ['/register', '/'],
  ['/sign-in', '/'],
  ['/user-home', '/'],
  ['/my-account', '/'],
  ['/order-completed', '/'],
  ['/cart', '/get-custom-quote'],
  ['/checkout', '/get-custom-quote'],
]);

// PM-approved EXTRA entries (BE-2, 2026-06-12 — docs/team/ISSUES.md).
// The live /locations/ HUB page is linked in the live header nav but appears
// in no live sitemap; without this entry it would 404 post-launch. All of its
// children are pizza doorways, so the hub consolidates into the pizza category.
const EXTRA = new Map([
  ['/locations', categoryTarget('custom-pizza-boxes')],
]);

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9-]+$/;

/** Apply the trailing-slash policy ('/' stays '/'). */
function slash(path) {
  if (!TRAILING_SLASH) return path === '/' ? path : path.replace(/\/$/, '');
  return path.endsWith('/') ? path : `${path}/`;
}

function categoryTarget(slug) {
  if (!categoryBySlug.has(slug)) throw new Error(`unknown category target: ${slug}`);
  return `/shop/${slug}`;
}

function productTarget(slug) {
  const product = productBySlug.get(slug);
  if (!product) throw new Error(`unknown product target: ${slug}`);
  return `/shop/${product.category}/${product.slug}`;
}

function entry(source, destination) {
  return { source: slash(source), destination: slash(destination), permanent: true };
}

const groups = [];

// 1) 221 location doorways (city-major, variant order as in the live sitemap).
const locationEntries = [];
for (const city of LOCATION_CITIES) {
  if (!SLUG_RE.test(city)) throw new Error(`bad city slug: ${city}`);
  for (const [variant, target] of PIZZA_VARIANTS) {
    if (!SLUG_RE.test(variant)) throw new Error(`bad variant slug: ${variant}`);
    locationEntries.push(entry(`/locations/${variant}-in-${city}`, target));
  }
}
groups.push({
  name: '1) /locations/ pizza doorway pages -> product/category pages',
  expected: 221,
  entries: locationEntries,
});

// 6) Retired duplicate URLs (shop + legacy) and old category-qualified URLs.
const catalogEntries = [
  ...CATALOG_CONSOLIDATIONS.flatMap(([oldSlug, oldCategory, canonicalSlug]) => [
    entry(`/shop/${oldCategory}/${oldSlug}`, productTarget(canonicalSlug)),
    entry(`/products/${oldSlug}`, productTarget(canonicalSlug)),
  ]),
  ...CATEGORY_MOVES.map(([slug, oldCategory, canonicalSlug]) =>
    entry(`/shop/${oldCategory}/${slug}`, productTarget(canonicalSlug)),
  ),
];
groups.push({
  name: '6) duplicate-product consolidations and category moves',
  expected: 33,
  entries: catalogEntries,
});

// 2) 31 business-card doorways.
const bcEntries = BUSINESS_CARD_CITIES.map((city) => {
  if (!SLUG_RE.test(city)) throw new Error(`bad city slug: ${city}`);
  return entry(`/business-card/custom-business-cards-in-${city}`, categoryTarget('business-card'));
});
groups.push({
  name: '2) /business-card/ city doorway pages -> /shop/business-card',
  expected: 31,
  entries: bcEntries,
});

// 3) 4 product merges.
groups.push({
  name: '3) merged product slugs -> canonical product pages',
  expected: 4,
  entries: [...PRODUCT_MERGES].map(([s, d]) => entry(s, d)),
});

// 4) 7 utility redirects.
groups.push({
  name: '4) legacy WP utility/account/commerce pages',
  expected: 7,
  entries: [...UTILITY].map(([s, d]) => entry(s, d)),
});

// 5) 1 PM-approved extra (/locations/ hub).
groups.push({
  name: '5) PM-approved extras (/locations/ hub -> /shop/custom-pizza-boxes)',
  expected: 1,
  entries: [...EXTRA].map(([s, d]) => entry(s, d)),
});

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

const all = groups.flatMap((g) => g.entries);

for (const g of groups) {
  if (g.entries.length !== g.expected) {
    throw new Error(`count mismatch for "${g.name}": got ${g.entries.length}, want ${g.expected}`);
  }
}
if (all.length !== 297) throw new Error(`total mismatch: got ${all.length}, want 297`);

const seen = new Set();
for (const { source, destination } of all) {
  if (seen.has(source)) throw new Error(`duplicate source: ${source}`);
  seen.add(source);
  for (const p of [source, destination]) {
    if (!p.startsWith('/')) throw new Error(`path must start with '/': ${p}`);
    if (/[\s:*+?()[\]{}]/.test(p)) throw new Error(`unexpected char (regex/space) in: ${p}`);
    if (TRAILING_SLASH && !p.endsWith('/')) throw new Error(`missing trailing slash: ${p}`);
  }
}
// No redirect chains: no destination may itself be a redirect source.
for (const { destination } of all) {
  if (seen.has(destination)) throw new Error(`destination is also a source (chain): ${destination}`);
}

// Destinations must be real new-site routes (IA in PROJECT_BRIEF.md).
const VALID_DESTINATIONS = new Set(
  [
    '/',
    '/get-custom-quote',
    categoryTarget('business-card'),
    categoryTarget('custom-pizza-boxes'),
    productTarget('custom-corrugated-pizza-boxes'),
    productTarget('custom-detroit-pizza-boxes'),
    productTarget('custom-kraft-pizza-boxes'),
    productTarget('custom-luxury-pizza-boxes'),
    productTarget('custom-slice-pizza-boxes'),
    productTarget('custom-disposable-pizza-boxes'),
    productTarget('custom-hang-tags'),
    productTarget('custom-rigid-drawer-boxes'),
    productTarget('custom-printed-seed-boxes'),
    productTarget('custom-pre-roll-boxes'),
    ...catalogEntries.map(({ destination }) => destination),
  ].map(slash),
);
for (const { destination } of all) {
  if (!VALID_DESTINATIONS.has(destination)) throw new Error(`unknown destination: ${destination}`);
}

// ---------------------------------------------------------------------------
// Emit lib/redirects.ts
// ---------------------------------------------------------------------------

const fmt = (e) =>
  `  { source: '${e.source}', destination: '${e.destination}', permanent: true },`;

const banner = (text) => `\n  // ${'-'.repeat(74)}\n  // ${text}\n  // ${'-'.repeat(74)}\n`;

let body = '';
for (const g of groups) {
  body += banner(`${g.name} (${g.entries.length} entries)`);
  body += g.entries.map(fmt).join('\n');
  body += '\n';
}

const file = `// AUTO-GENERATED by scripts/gen-redirects.mjs — DO NOT EDIT BY HAND.
// Regenerate with: node scripts/gen-redirects.mjs
//
// 297 permanent (308) redirects wired into next.config.ts:
//   221 /locations/ pizza doorways  (17 variants x 13 cities)
//    31 /business-card/ city doorways (incl. live duplicate 'tampa-2')
//     4 merged product slugs
//     7 legacy WP utility pages
//     1 /locations/ hub (PM-approved extra — docs/team/ISSUES.md)
//    33 duplicate-product consolidations and category moves
//
// Trailing slashes are intentional: next.config.ts sets \`trailingSlash: true\`
// (matches the live WordPress URLs), and Next.js requires redirect sources to
// include the trailing slash under that setting. If the trailing-slash policy
// ever changes, flip TRAILING_SLASH in scripts/gen-redirects.mjs and regenerate.
//
// NOT included here (and why): the legacy privacy-policy link
// \`https://www.hmcustompackaging.com/?page_id=3\` is a query-string-only URL on
// \`/\`; it is redirected to /privacy-policy/ in middleware.ts instead.
// See docs/seo/REDIRECTS.md for the full validation table.

export const redirects: { source: string; destination: string; permanent: true }[] = [${body}];
`;

mkdirSync(join(root, 'lib'), { recursive: true });
const out = join(root, 'lib', 'redirects.ts');
writeFileSync(out, file, 'utf8');

// Paranoia: re-read and re-count what we actually wrote.
const written = readFileSync(out, 'utf8');
const writtenCount = (written.match(/, permanent: true \},/g) ?? []).length;
if (writtenCount !== 297) throw new Error(`post-write count mismatch: ${writtenCount}`);

console.log('lib/redirects.ts written.');
for (const g of groups) console.log(`  ${String(g.entries.length).padStart(3)}  ${g.name}`);
console.log(`  ---`);
console.log(`  ${all.length}  total next.config entries (+1 handled in middleware.ts: /?page_id=3)`);
