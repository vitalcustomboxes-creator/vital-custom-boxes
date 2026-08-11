/**
 * GET /api/product-options — slim catalog for the quote form's product picker.
 *
 * The catalog lives behind `server-only` modules, so the client-side combobox
 * in QuoteForm cannot read it directly. Embedding the list in the RSC payload
 * would add ~20 KB to the prerendered HTML of all 23 CTABand pages for a field
 * most visitors never open, so it is fetched on first interaction instead.
 *
 * Only slug/name/category/categoryName are emitted — no images, no copy. The
 * picker lists products alone (category is carried on the lead but not shown),
 * so the list is sorted by product name; the client re-orders by relevance
 * once the customer starts typing.
 */
import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/content';
import { getPublicProducts } from '@/lib/public-products';
import type { ProductOption } from '@/lib/quote-options';

/** Static catalog data — safe to cache, unlike the per-query search route. */
export const revalidate = 300;

export async function GET(): Promise<NextResponse> {
  const [products, categories] = [await getPublicProducts(), getCategories()];
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));

  const options: ProductOption[] = products
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      categoryName: categoryNames.get(product.category) ?? product.category,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(
    { count: options.length, products: options },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
