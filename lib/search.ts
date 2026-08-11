/**
 * lib/search.ts — ranked sitewide search (BE-3 owned). SERVER-ONLY via
 * lib/content.ts (node:fs) — call from server components / route handlers
 * only; the client talks to GET /api/search?q=.
 *
 * Ranking: name starts-with > name includes > description includes.
 * Within a rank, source order is preserved: products → categories → posts.
 * Returns at most `limit` (default 20) typed hits.
 *
 * NOTE: lib/content.ts ships a simpler `search()` (DATA-ENG, name > desc,
 * no starts-with tier). This module is the canonical one for the search API
 * and UI — logged on the board so consumers don't mix them.
 */
import { getCategories, getPosts, getProducts } from './content';
import { categoryPath, productPath } from './routes';
import type { Category, Post, Product } from './types';

export interface SearchHit {
  type: 'product' | 'category' | 'post';
  slug: string;
  name: string;
  /** Site-relative href with trailing slash (next.config trailingSlash: true). */
  href: string;
  imageUrl?: string;
}

/** Injectable corpus — tests pass fixtures; production uses content loaders. */
export interface SearchCorpus {
  products: Product[];
  categories: Category[];
  posts: Post[];
}

export const SEARCH_LIMIT = 20;
/** Hard cap on query length (mirrored by app/api/search/route.ts). */
export const MAX_QUERY_LENGTH = 60;

interface Candidate {
  name: string;
  description: string;
  hit: SearchHit;
}

function candidates(corpus: SearchCorpus): Candidate[] {
  const rows: Candidate[] = [];
  for (const p of corpus.products) {
    rows.push({
      name: p.name,
      description: p.description,
      hit: {
        type: 'product',
        slug: p.slug,
        name: p.name,
        href: productPath(p),
        imageUrl: p.imageUrl,
      },
    });
  }
  for (const c of corpus.categories) {
    rows.push({
      name: c.name,
      description: c.description,
      hit: {
        type: 'category',
        slug: c.slug,
        name: c.name,
        href: categoryPath(c),
        imageUrl: c.imageUrl,
      },
    });
  }
  for (const post of corpus.posts) {
    rows.push({
      name: post.title,
      description: post.excerpt,
      hit: {
        type: 'post',
        slug: post.slug,
        name: post.title,
        href: `/blog/${post.slug}/`,
        imageUrl: post.imageUrl,
      },
    });
  }
  return rows;
}

/**
 * Case-insensitive ranked search over product/category names+descriptions and
 * post titles+excerpts. Empty/whitespace queries return [].
 */
export function search(
  rawQuery: string,
  limit = SEARCH_LIMIT,
  corpus?: SearchCorpus,
): SearchHit[] {
  const q = rawQuery.trim().slice(0, MAX_QUERY_LENGTH).toLowerCase();
  if (!q) return [];

  const data: SearchCorpus = corpus ?? {
    products: getProducts(),
    categories: getCategories(),
    posts: getPosts(),
  };

  const startsWith: SearchHit[] = [];
  const nameIncludes: SearchHit[] = [];
  const descIncludes: SearchHit[] = [];

  for (const { name, description, hit } of candidates(data)) {
    const n = name.toLowerCase();
    if (n.startsWith(q)) startsWith.push(hit);
    else if (n.includes(q)) nameIncludes.push(hit);
    else if (description.toLowerCase().includes(q)) descIncludes.push(hit);
    // Early exit once the top tier alone can fill the page.
    if (startsWith.length >= limit) break;
  }

  return [...startsWith, ...nameIncludes, ...descIncludes].slice(0, limit);
}
