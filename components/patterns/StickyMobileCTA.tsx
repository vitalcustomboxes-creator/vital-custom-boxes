'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui';
import type { Globals } from '@/lib/types';

export interface StickyMobileCTAProps {
  globals: Globals;
  quoteHref?: string;
  watchSelector?: string;
}

export function StickyMobileCTA({
  quoteHref = '/get-custom-quote/',
  watchSelector = '[data-quote-form], #quote-form, footer',
}: StickyMobileCTAProps) {
  const pathname = usePathname();
  const [suppressed, setSuppressed] = useState(false);

  const onQuotePage =
    pathname?.startsWith('/get-custom-quote') ?? false;

  useEffect(() => {
    if (onQuotePage) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = Array.from(
      document.querySelectorAll(watchSelector),
    );

    if (!targets.length) {
      setSuppressed(false);
      return;
    }

    const visible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }

        setSuppressed(visible.size > 0);
      },
      { threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      setSuppressed(false);
    };
  }, [pathname, watchSelector, onQuotePage]);

  if (onQuotePage) return null;

  return (
    <nav
      aria-label="Request a quote"
      inert={suppressed || undefined}
      className={`fixed inset-x-0 bottom-0 z-[var(--z-sticky-cta)] border-t border-ink-100 bg-white px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 transition-transform duration-300 ease-brand md:hidden ${
        suppressed ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <Button
        href={quoteHref}
        variant="primary"
        size="md"
        className="w-full"
      >
        Get a Quote
      </Button>
    </nav>
  );
}