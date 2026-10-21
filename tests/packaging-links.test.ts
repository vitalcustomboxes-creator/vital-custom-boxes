import { describe, expect, it } from 'vitest';
import { CATEGORY_PACKAGING_SEO, packagingLinksForPost } from '../lib/packaging-seo';
import { PACKAGING_LANDINGS } from '../lib/packaging-landings';
import { getCategories, getPosts, getProducts } from '../lib/content';

describe('landing-page link integrity', () => {
  const categories = getCategories();
  const posts = getPosts();
  const products = getProducts();
  const topics = Object.values(PACKAGING_LANDINGS);
  const paths = new Set([...categories.map((c) => `/shop/${c.slug}/`), ...topics.map((p) => `/${p.slug}/`)]);
  it('uses existing products, blog guides and category/topic destinations', () => {
    for (const page of topics) {
      expect(products.some((p) => p.slug === page.heroProduct)).toBe(true);
      for (const slug of page.productSlugs) expect(products.some((p) => p.slug === slug)).toBe(true);
      for (const link of page.related) expect(paths.has(link.href)).toBe(true);
    }
    for (const page of [...topics, ...Object.values(CATEGORY_PACKAGING_SEO)]) {
      for (const slug of page.blogSlugs ?? []) expect(posts.some((p) => p.slug === slug)).toBe(true);
    }
  });
  it('links buying guides back to real buyer pages without duplicate targets', () => {
    for (const post of posts) {
      const links = packagingLinksForPost(post.slug);
      expect(new Set(links.map((l) => l.href)).size).toBe(links.length);
      for (const link of links) expect(paths.has(link.href)).toBe(true);
    }
  });
});
