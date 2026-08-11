/**
 * RelatedProducts — Server Component (FE-3 blocks). T3 "Related products"
 * band: section header + staggered ProductCard grid. Pages resolve the
 * Product objects (e.g. product.related → getProduct each) and own the
 * <section> wrapper/bg. Renders nothing when the list is empty.
 */
import { Reveal } from '@/components/ui/reveal';
import { ProductCard } from '@/components/patterns/ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

export interface RelatedProductsProps {
  products: Product[];
  /** Shown as the category overline on each card (pages resolve the name). */
  categoryName?: string;
  eyebrow?: string;
  title?: string;
  /** Section-owning — className lands on the <section> (bg override). */
  className?: string;
}

export function RelatedProducts({
  products,
  categoryName,
  eyebrow = 'Keep exploring',
  title = 'Related products',
  className,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn('section bg-paper-50', className)}>
      <div className="container-hm">
        <div className="mb-10 flex flex-col gap-3 md:mb-12">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        {/* Composition rule: grid cell = stagger child, card nested inside;
            Reveal injects --stagger-i on each cell automatically. */}
        <Reveal
          as="div"
          stagger
          className={cn(
            'grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3',
            products.length >= 4 && 'xl:grid-cols-4',
          )}
        >
          {products.map((product) => (
            <div key={product.slug} className="h-full">
              <ProductCard product={product} categoryName={categoryName} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default RelatedProducts;
