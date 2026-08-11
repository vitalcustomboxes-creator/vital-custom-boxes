'use client';

/**
 * Client-side `?product=…&stock=…` prefill for /get-custom-quote.
 *
 * Reading `searchParams` on the server marks the whole route dynamic, so a
 * page that is otherwise entirely static paid a full SSR render on every
 * visit. Moving the read here lets the route prerender: the hero, the trust
 * sidebar and the form shell are built once and served from the CDN, and the
 * prefill happens in the browser.
 *
 * The prefill is a convenience, never a correctness requirement — an absent or
 * unknown `?product=` slug simply leaves the picker empty, which is the same
 * outcome the server path produced.
 *
 * QuoteForm's own prop contract is untouched: CTABand renders it on ~23 other
 * pages with a real server-resolved `defaultProduct`, and that path still works
 * exactly as before. This wrapper is used only by the quote page.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuoteForm, type QuoteFormProps } from './QuoteForm';
import { useProductOptions } from './use-product-options';
import { productPath } from '@/lib/routes';

/** Spec fields arrive as plain strings and need no catalog lookup. */
function readSpecs(params: URLSearchParams): QuoteFormProps['defaultSpecs'] {
  const value = (key: string) => params.get(key) ?? undefined;
  const finishes = params.get('finishes');
  return {
    stock: value('stock'),
    colors: value('colors'),
    surface: value('surface'),
    lamination: value('lamination'),
    finishes: finishes ? finishes.split(',').filter(Boolean) : undefined,
    notes: value('notes'),
  };
}

export function QuoteFormWithParamPrefill(props: Omit<QuoteFormProps, 'defaultProduct' | 'defaultSpecs'>) {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product') ?? undefined;

  const defaultSpecs = useMemo(
    () => readSpecs(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  /**
   * The catalog lives behind `server-only`, so the product's display name and
   * category come from the same cached /api/product-options/ endpoint the
   * picker already uses — a CDN hit, not a function invocation.
   */
  const { options, load } = useProductOptions();
  const requested = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only fetch when a slug is actually present: visitors who land on the
    // bare page must not pay for a catalog request they never asked for.
    if (!productSlug || requested.current === productSlug) return;
    requested.current = productSlug;
    load();
  }, [productSlug, load]);

  const defaultProduct = useMemo<QuoteFormProps['defaultProduct']>(() => {
    if (!productSlug) return undefined;
    const match = options.find((option) => option.slug === productSlug);
    // An unknown slug resolves to nothing and the picker stays empty, matching
    // the previous server-side behaviour for an unrecognised product.
    if (!match) return undefined;
    return {
      slug: match.slug,
      name: match.name,
      categorySlug: match.category,
      categoryName: match.categoryName,
      sourcePath: productPath({ slug: match.slug, category: match.category }),
    };
  }, [productSlug, options]);

  /**
   * `defaultSpecs` is read synchronously from the URL, so the uncontrolled spec
   * fields carry the right `defaultValue` on the very first render. Only the
   * product resolves late, and QuoteForm adopts it into an empty picker — no
   * remount, so nothing the visitor has already typed is discarded.
   */
  return <QuoteForm {...props} defaultProduct={defaultProduct} defaultSpecs={defaultSpecs} />;
}
