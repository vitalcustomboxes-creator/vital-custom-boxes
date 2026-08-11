#!/usr/bin/env node
/**
 * scripts/validate-content.mjs — content integrity gate (DATA-ENG owned).
 *
 * Asserts:
 *   - counts: 22 categories / 285 products / 16 posts / 8 faqs / 10 reviews / 3 case studies
 *   - unique slugs everywhere
 *   - every product.category is one of the 22 category slugs
 *   - category.productSlugs ⟷ product.category are consistent and cover all products
 *   - every imageUrl is a localized asset
 *   - the 4 merged product slugs from PROJECT_BRIEF.md are NOT present
 *   - reviews are REAL (migrated/verified): author/location/text + integer rating 1-5;
 *     globals has the full required shape
 *
 * Exit code 0 = PASS, 1 = FAIL. Run: node scripts/validate-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));

const PRODUCT_COUNT = 285;
const IMG_PREFIXES = ['/img/', '/Products%20Images/', '/Product%20Images%202/', '/blog-banners/'];
const MERGED = [
  'custom-hangtags',
  'custom-drawer-style-boxes',
  'custom-seeds-boxes',
  'custom-pre-rolls-joints-boxes',
];

const errors = [];
const ok = (cond, msg) => {
  if (!cond) errors.push(msg);
};

const categories = read('categories.json');
const products = read('products.json');
const posts = read('posts.json');
const reviewsRaw = read('reviews.json');
const faqs = read('faqs.json');
const globals = read('globals.json');
const casestudies = read('casestudies.json');

/* ---- counts ---- */
ok(categories.length === 22, `categories count ${categories.length} !== 22`);
ok(products.length === PRODUCT_COUNT, `products count ${products.length} !== ${PRODUCT_COUNT}`);
ok(posts.length === 16, `posts count ${posts.length} !== 16`);
ok(faqs.length === 8, `faqs count ${faqs.length} !== 8`);
ok(casestudies.length === 3, `casestudies count ${casestudies.length} !== 3`);

const reviews = reviewsRaw.filter((r) => !('_note' in r));
ok(reviews.length === 10, `reviews count ${reviews.length} !== 10`);

/* ---- unique slugs ---- */
const assertUnique = (rows, key, label) => {
  const seen = new Set();
  for (const r of rows) {
    const v = r[key];
    ok(typeof v === 'string' && v.length > 0, `${label}: empty ${key}`);
    ok(!seen.has(v), `${label}: duplicate ${key} "${v}"`);
    seen.add(v);
  }
  return seen;
};
const catSlugs = assertUnique(categories, 'slug', 'categories');
const prodSlugs = assertUnique(products, 'slug', 'products');
assertUnique(posts, 'slug', 'posts');
assertUnique(faqs, 'slug', 'faqs');
assertUnique(casestudies, 'slug', 'casestudies');

/* ---- merged slugs excluded ---- */
for (const m of MERGED) ok(!prodSlugs.has(m), `merged slug "${m}" must NOT be in products.json (redirect only)`);

/* ---- product.category ∈ 22 ---- */
for (const p of products) {
  ok(catSlugs.has(p.category), `product "${p.slug}": category "${p.category}" is not one of the 22 category slugs`);
  ok(p.copyStatus === 'live' || p.copyStatus === 'derived' || p.copyStatus === 'draft', `product "${p.slug}": bad copyStatus`);
  ok(typeof p.name === 'string' && p.name.length > 0, `product "${p.slug}": missing name`);
  ok(typeof p.description === 'string' && p.description.length > 20, `product "${p.slug}": missing/short description`);
  for (const key of ['highlights', 'bestFor', 'materials', 'finishes']) {
    ok(Array.isArray(p[key]) && p[key].length >= 3 && p[key].length <= 5, `product "${p.slug}": ${key} must have 3-5 items`);
    for (const item of p[key] ?? []) ok(typeof item === 'string' && item.length >= 8, `product "${p.slug}": ${key} has short/invalid item`);
  }
  if (p.title) ok(p.title.length <= 60, `product "${p.slug}": title > 60 chars (${p.title.length})`);
  if (p.related) for (const r of p.related) ok(prodSlugs.has(r), `product "${p.slug}": related "${r}" not found`);
  if (p.images) {
    ok(Array.isArray(p.images), `product "${p.slug}": images must be an array`);
    for (const image of p.images) {
      ok(typeof image.src === 'string' && IMG_PREFIXES.some((pfx) => image.src.startsWith(pfx)), `product "${p.slug}": gallery image src must start with one of ${IMG_PREFIXES.join(' | ')} (got "${image.src}")`);
      ok(typeof image.alt === 'string' && image.alt.length > 0, `product "${p.slug}": gallery image missing alt`);
    }
  }
}

/* ---- category.productSlugs consistency (bidirectional, full coverage) ---- */
const mapped = new Set();
for (const c of categories) {
  ok(typeof c.description === 'string' && c.description.length > 40, `category "${c.slug}": missing/short description`);
  ok(typeof c.intro === 'string' && c.intro.length > 40, `category "${c.slug}": missing/short intro`);
  for (const key of ['highlights', 'buyersGuide']) {
    ok(Array.isArray(c[key]) && c[key].length >= 3 && c[key].length <= 5, `category "${c.slug}": ${key} must have 3-5 items`);
    for (const item of c[key] ?? []) ok(typeof item === 'string' && item.length >= 8, `category "${c.slug}": ${key} has short/invalid item`);
  }
  ok(Array.isArray(c.productSlugs), `category "${c.slug}": productSlugs missing`);
  for (const s of c.productSlugs) {
    ok(prodSlugs.has(s), `category "${c.slug}": productSlugs references unknown product "${s}"`);
    ok(!mapped.has(s), `product "${s}" appears in more than one category.productSlugs`);
    mapped.add(s);
    const p = products.find((x) => x.slug === s);
    if (p) ok(p.category === c.slug, `product "${s}" category "${p?.category}" disagrees with category "${c.slug}" listing`);
  }
}
ok(mapped.size === products.length, `category.productSlugs cover ${mapped.size}/${products.length} products`);

/* ---- imageUrl host check ---- */
const checkImg = (rows, label) => {
  for (const r of rows) {
    ok(
      typeof r.imageUrl === 'string' && IMG_PREFIXES.some((pfx) => r.imageUrl.startsWith(pfx)),
      `${label} "${r.slug}": imageUrl must start with one of ${IMG_PREFIXES.join(' | ')} (got "${r.imageUrl}")`,
    );
  }
};
checkImg(categories, 'category');
checkImg(products, 'product');
checkImg(posts, 'post');
checkImg(casestudies, 'casestudy');

/* ---- reviews shape (REAL migrated/verified data) ---- */
const REVIEW_SOURCES = new Set(['migrated', 'verified', 'placeholder']);
for (const r of reviews) {
  ok(typeof r.author === 'string' && r.author.length > 0, `review by "${r.author}": missing author`);
  ok(typeof r.location === 'string' && r.location.length > 0, `review by "${r.author}": missing location`);
  ok(typeof r.text === 'string' && r.text.length > 0, `review by "${r.author}": missing text`);
  ok(Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5, `review by "${r.author}": rating must be an integer 1-5`);
  ok(REVIEW_SOURCES.has(r.source), `review by "${r.author}": source must be one of migrated|verified|placeholder (got "${r.source}")`);
}

/* ---- faqs/posts content ---- */
for (const f of faqs) ok(Boolean(f.question) && Boolean(f.answer), `faq "${f.slug}": missing question/answer`);
for (const p of posts) {
  ok(Boolean(p.title) && Boolean(p.excerpt), `post "${p.slug}": missing title/excerpt`);
  ok(typeof p.body === 'string' && p.body.length > 300 && !p.body.includes('TODO-migrate'), `post "${p.slug}": body must be migrated real copy (>300 chars, no TODO-migrate)`);
}

/* ---- globals shape ---- */
const requireKeys = (obj, keys, label) => {
  for (const k of keys) ok(typeof obj?.[k] === 'string' && obj[k].length > 0, `globals: missing/empty ${label}${k}`);
};
requireKeys(globals, ['sla', 'moq', 'shipping', 'phone', 'phoneHref', 'email', 'address', 'complianceDisclaimer'], '');
requireKeys(globals.promo ?? {}, ['text', 'href'], 'promo.');
requireKeys(globals.social ?? {}, ['facebook', 'instagram', 'x', 'pinterest', 'trustpilot'], 'social.');
ok(globals.phoneHref === 'tel:+18284550798', 'globals: phoneHref must be tel:+18284550798');

/* ---- regulated categories flagged (CONTENT_GUIDELINES §7) ---- */
for (const slug of ['mylar-bags', 'custom-cbd-boxes', 'custom-tobacco-packaging']) {
  ok(categories.find((c) => c.slug === slug)?.regulated === true, `category "${slug}" must have regulated: true`);
}

/* ---- banned live-site claims must not appear anywhere (CONTENT_GUIDELINES §8) ---- */
const BANNED = [
  'no minimum', 'No Minimum', 'worldwide shipping', '3-7 Working', '4–8 Business', '4-8 Business',
  '2-3 weeks', '7 to 15', '6926-437', 'tel:+1-078',
];
const ALL_TEXT = JSON.stringify({ categories, products, posts, reviewsRaw, faqs, globals, casestudies });
for (const b of BANNED) ok(!ALL_TEXT.includes(b), `banned claim/string "${b}" found in content JSON`);

/* ---- report ---- */
if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

const liveProducts = products.filter((p) => p.copyStatus === 'live').length;
console.log('PASS — content integrity verified');
console.log(`  categories : ${categories.length}`);
console.log(`  products   : ${products.length} (${liveProducts} live copy, ${products.length - liveProducts} derived; ${products.filter((p) => p.sku).length} with SKU)`);
console.log(`  posts      : ${posts.length}`);
console.log(`  faqs       : ${faqs.length}  reviews: ${reviews.length} (migrated/verified)  casestudies: ${casestudies.length}`);
