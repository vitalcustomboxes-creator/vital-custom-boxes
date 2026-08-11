/**
 * lib/content.ts — typed content loaders (DATA-ENG owned). SERVER-ONLY.
 *
 * Reads /content/*.json synchronously with module-level caching, so repeated
 * calls during a build/request are free. Uses node:fs — importing this from a
 * Client Component will fail by design. ARCHITECT added the `server-only`
 * package guard below for an explicit build-time error (ISSUES log, 2026-06-12).
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { categoryPath, productPath } from './routes';
import type {
  CaseStudy,
  Category,
  Faq,
  Globals,
  Post,
  Product,
  RatingSummary,
  Review,
  SearchResult,
} from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

const cache = new Map<string, unknown>();

function readJson<T>(file: string): T {
  const hit = cache.get(file);
  if (hit !== undefined) return hit as T;
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
  const data = JSON.parse(raw) as T;
  cache.set(file, data);
  return data;
}

/* ------------------------------- categories ------------------------------ */

export function getCategories(): Category[] {
  return readJson<Category[]>('categories.json');
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

/* -------------------------------- products ------------------------------- */

export function getProducts(): Product[] {
  return readJson<Product[]>('products.json');
}

export function getProduct(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getProducts().filter((p) => p.category === categorySlug);
}

/* --------------------------------- posts --------------------------------- */

export function getPosts(): Post[] {
  // Newest first; stable for equal dates (sitemap order preserved by sort stability).
  return [...readJson<Post[]>('posts.json')].sort((a, b) =>
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
  );
}

export function getPost(slug: string): Post | undefined {
  return readJson<Post[]>('posts.json').find((p) => p.slug === slug);
}

/* ----------------------------- globals & misc ---------------------------- */

export function getGlobals(): Globals {
  return readJson<Globals>('globals.json');
}

/**
 * Reviews for the ReviewWall — the 10 REAL migrated testimonials in
 * content/reviews.json. Any legacy `_note` marker row is tolerated/filtered
 * for backwards compatibility, but the live file no longer carries one.
 */
export function getReviews(): Review[] {
  const rows = readJson<Array<Review | { _note: string }>>('reviews.json');
  return rows.filter((r): r is Review => !('_note' in r));
}

/** Aggregate rating summary from content/ratings.json (hero badge + JSON-LD). */
export function getRatingSummary(): RatingSummary {
  return readJson<RatingSummary>('ratings.json');
}

export function getFaqs(): Faq[] {
  return readJson<Faq[]>('faqs.json');
}

export function getCaseStudies(): CaseStudy[] {
  return readJson<CaseStudy[]>('casestudies.json');
}

/* --------------------------------- search -------------------------------- */

/**
 * Simple case-insensitive `includes` match over names/titles + descriptions
 * of products, categories, and posts. Name matches rank before description
 * matches; products before categories before posts within a rank.
 */
export function search(q: string, limit = 20): SearchResult[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];

  const nameHits: SearchResult[] = [];
  const descHits: SearchResult[] = [];

  const consider = (
    name: string,
    description: string,
    result: SearchResult,
  ): void => {
    if (name.toLowerCase().includes(query)) nameHits.push(result);
    else if (description.toLowerCase().includes(query)) descHits.push(result);
  };

  for (const p of getProducts()) {
    consider(p.name, p.description, {
      type: 'product',
      slug: p.slug,
      name: p.name,
      description: p.description,
      href: productPath(p),
      imageUrl: p.imageUrl,
    });
  }
  for (const c of getCategories()) {
    consider(c.name, c.description, {
      type: 'category',
      slug: c.slug,
      name: c.name,
      description: c.description,
      href: categoryPath(c),
      imageUrl: c.imageUrl,
    });
  }
  for (const post of getPosts()) {
    consider(post.title, post.excerpt, {
      type: 'post',
      slug: post.slug,
      name: post.title,
      description: post.excerpt,
      href: `/blog/${post.slug}`,
      imageUrl: post.imageUrl,
    });
  }

  return [...nameHits, ...descHits].slice(0, limit);
}
