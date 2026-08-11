'use client';

/**
 * Lazy catalog loader for QuoteForm's product picker.
 *
 * `load()` is called on the combobox's first focus/keystroke rather than on
 * mount, so visitors who scroll past the form (22 of the 24 screens the form
 * renders on) pay no network cost. The in-flight promise is cached at module
 * scope so the fetch happens once per page session across remounts.
 */

import { useCallback, useState } from 'react';
import type { ProductOption } from '@/lib/quote-options';

export type { ProductOption };

let cache: Promise<ProductOption[]> | null = null;

async function fetchProductOptions(): Promise<ProductOption[]> {
  // Trailing slash matches next.config.ts `trailingSlash: true` — without it
  // every call eats a 308 redirect.
  const response = await fetch('/api/product-options/');
  if (!response.ok) throw new Error(`Product options request failed (${response.status})`);
  const body = (await response.json()) as { products?: ProductOption[] };
  return body.products ?? [];
}

function loadProductOptions(): Promise<ProductOption[]> {
  // Retry on the next `load()` if this attempt fails — don't cache the rejection.
  cache ??= fetchProductOptions().catch((error: unknown) => {
    cache = null;
    throw error;
  });
  return cache;
}

/** Test seam — drops the module cache between cases. */
export function resetProductOptionsCache() {
  cache = null;
}

export function useProductOptions() {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    if (options.length > 0 || loading) return;
    setLoading(true);
    setFailed(false);
    loadProductOptions()
      .then((next) => setOptions(next))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [options.length, loading]);

  return { options, loading, failed, load };
}
