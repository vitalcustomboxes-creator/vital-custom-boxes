/**
 * ProductCard — Server Component (FE-3). DESIGN_SPEC §6.7.
 *
 * Equal-height card (flex column + `h-full`, CTA pinned with `mt-auto`),
 * word-boundary truncation only (truncateWords + line-clamp — the single-line
 * `truncate` utility is forbidden for content text), `.card-lift` hover.
 *
 * Link model (audit-safe, zero JS — works in a Server Component):
 *  - The product title is a stretched link (`after:absolute after:inset-0`)
 *    so the WHOLE card navigates to the product detail page.
 *  - The inner "Get a Quote" Button (link) sits ABOVE the stretched overlay
 *    via `relative z-10`, so clicking it never triggers the card link — the
 *    layering equivalent of stopPropagation, with no nested <a> (invalid HTML)
 *    and no client handler.
 *
 * Grid recipe for parents (stagger child = grid cell, card nested inside;
 * <Reveal> injects --stagger-i on each cell automatically):
 *   <Reveal as="div" stagger className="grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
 *     {products.map((p) => (
 *       <div key={p.slug} className="h-full"><ProductCard product={p} /></div>
 *     ))}
 *   </Reveal>
 */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productPath } from '@/lib/routes';
import { cn, truncateWords } from '@/lib/utils';
import type { Product } from '@/lib/types';

export interface ProductCardProps {
  product: Product;
  /** Human-readable category name (slug is not shown). Pages resolve it server-side. */
  categoryName?: string;
  className?: string;
}

export function ProductCard({ product, categoryName, className }: ProductCardProps) {
  const productHref = productPath(product);
  const quoteHref = `/get-custom-quote/?product=${encodeURIComponent(product.slug)}`;

  return (
    <article
      className={cn(
        'group card-lift relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-e1',
        // Keyboard: card shows a ring while the stretched link inside is focused.
        'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--focus-ring-color)]',
        className,
      )}
    >
      <div className="card-media relative aspect-[4/3] bg-kraft-100">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt ?? `${product.name} — custom printed packaging by Vital Custom Boxes`}
          fill
          unoptimized={product.imageUrl.startsWith('/api/product-images/')}
          sizes="(min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {(categoryName || product.sku) && (
          <div className="flex items-center justify-between gap-2">
            {categoryName ? (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                {categoryName}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            {product.sku && <Badge variant="outline">SKU {product.sku}</Badge>}
          </div>
        )}

        <h3 className="h4 line-clamp-2">
          <Link
            href={productHref}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        {/* Word-boundary truncation: server-side word cap + CSS line-clamp. */}
        <p className="line-clamp-2 text-sm text-slate-600">
          {truncateWords(product.description, 20)}
        </p>

        {/* CTA pinned to the bottom; z-10 lifts it above the stretched link. */}
        <div className="relative z-10 mt-auto pt-3">
          <Button
            href={quoteHref}
            variant="secondary"
            size="sm"
            fullWidth
            iconRight={<ArrowRight size={16} />}
            aria-label={`Get a quote for ${product.name}`}
          >
            Get a Quote
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
