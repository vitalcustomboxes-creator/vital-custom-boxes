import { describe, expect, it } from 'vitest';
import { redirects } from '../lib/redirects';
import migrations from '../content/legacy-url-redirects.json';
import products from '../content/products.json';
import categories from '../content/categories.json';
import { productPath } from '../lib/routes';

describe('historical URL migrations', () => {
  const bySource = new Map(redirects.map((row) => [row.source, row]));
  const routes = new Set([
    ...categories.map((category) => `/shop/${category.slug}/`),
    ...products.map((product) => `/shop/${product.category}/${product.slug}/`),
  ]);
  it('maps reported old category/slug combinations to existing final pages', () => {
    expect(bySource.get('/shop/custom-cosmetic-boxes/custom-eyeliner-boxes/')?.destination)
      .toBe('/shop/custom-cosmetics-boxes/custom-eyeliner-boxes/');
    expect(bySource.get('/shop/custom-mylar-bags/custom-die-cut-mylar-bags/')?.destination)
      .toBe('/shop/mylar-bags/die-cut-mylar-bags/');
    expect(bySource.get('/shop/folding-cartons/auto-lock-bottom-boxes/')?.destination)
      .toBe('/shop/custom-boxes/auto-lock-bottom-boxes/');
    expect(bySource.get('/shop/custom-cbd-boxes/custom-cigar-boxes/')?.destination)
      .toBe('/shop/custom-tobacco-packaging/custom-cigar-boxes/');
  });
  it('uses permanent redirects without duplicate sources, loops or redirect chains', () => {
    expect(bySource.size).toBe(redirects.length);
    for (const migration of migrations) {
      const rule = bySource.get(migration.source);
      expect(rule?.permanent).toBe(true);
      expect(rule?.destination).toBe(migration.destination);
      expect(routes.has(migration.destination)).toBe(true);
      expect(bySource.has(migration.destination)).toBe(false);
      expect(migration.destination).not.toBe('/');
    }
  });
  it('does not turn retired articles into unrelated homepage/category redirects', () => {
    for (const path of [
      '/blog/how-many-cigarettes-are-in-a-king-size-pack/',
      '/blog/everything-you-need-to-know-about-custom-cosmetic-boxes/',
      '/blog/shipping-baked-goods/',
    ]) expect(bySource.has(path)).toBe(false);
  });
  it('links to final product URLs even when the bundled fallback has an old slug', () => {
    for (const product of products) expect(bySource.has(productPath(product))).toBe(false);
  });
});
