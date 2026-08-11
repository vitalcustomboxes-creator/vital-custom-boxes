/**
 * CategoryTile — Server Component (FE-3). DESIGN_SPEC §6.8.
 *
 * Whole tile is one link. The image and text are separate so category names
 * remain readable across busy packaging photos.
 *
 * Grid recipe (parent): grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6
 * lg:grid-cols-4, wrapped in <Reveal stagger> with tiles inside cells.
 */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoryPath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

export interface CategoryTileProps {
  category: Pick<Category, 'slug' | 'name' | 'imageUrl'>;
  /** Optional product count, e.g. category.productSlugs.length (resolved by the page). */
  count?: number;
  className?: string;
}

export function CategoryTile({ category, count, className }: CategoryTileProps) {
  const label =
    count !== undefined
      ? `${category.name} — ${count} ${count === 1 ? 'product' : 'products'}`
      : category.name;

  return (
    <Link
      href={categoryPath(category)}
      aria-label={label}
      className={cn(
        'group card-lift relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-e1 transition-[border-color,box-shadow,transform] duration-300 ease-brand hover:border-terra-200 hover:shadow-e3 focus-visible:border-terra-500 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-terra-100)]',
        className,
      )}
    >
      <span className="card-media relative block aspect-[1.18/1] overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#fff_0%,var(--color-paper-50)_58%,var(--color-kraft-100)_100%)] p-2">
        {/* The link carries the accessible name; the image is presentational here. */}
        <span className="relative block h-full w-full overflow-hidden rounded-lg">
          <Image
            src={category.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-2 transition-transform duration-500 ease-brand group-hover:scale-[1.045] md:p-3"
          />
        </span>
        {count !== undefined ? (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-e1 backdrop-blur-sm">
            {count} {count === 1 ? 'product' : 'products'}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/35 to-transparent"
        />
      </span>

      <span className="flex flex-1 flex-col border-t border-ink-100 p-4 md:p-5">
        <span className="text-pretty font-display text-lg font-semibold leading-snug text-ink-900 transition-colors duration-200 ease-brand group-hover:text-terra-600 md:text-xl">
          {category.name}
        </span>

        <span className="mt-auto flex min-h-11 items-center justify-between gap-3 pt-3">
          <span className="text-sm font-semibold text-terra-600 transition-colors duration-200 ease-brand group-hover:text-terra-500">
            View collection
          </span>
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-100 bg-paper-50 text-ink-900 transition-[background-color,border-color,color,transform] duration-200 ease-brand group-hover:translate-x-1 group-hover:border-terra-500 group-hover:bg-terra-500 group-hover:text-white"
          >
            <ArrowRight size={19} strokeWidth={2.25} />
          </span>
        </span>
      </span>
    </Link>
  );
}

export default CategoryTile;
