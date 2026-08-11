'use client';

/**
 * components/patterns/StickyMobileCTA.tsx — Client Component. Owner: FE-2.
 * DESIGN_SPEC §6.10: fixed bottom quick-action bar < 768px with Call (tel
 * from globals) + Get a Quote. Slides away (translate-y-full, transform only)
 * while the quote form OR the footer is in the viewport (IntersectionObserver)
 * and never renders on /get-custom-quote (the page IS the CTA).
 *
 * Integration contract:
 *  - FE-3 QuoteForm root (or its section) should carry `data-quote-form` —
 *    the default watch selector also matches `#quote-form` and `footer`.
 *  - BE-1: <main className="pb-24 md:pb-0"> so content clears the bar.
 *
 * Usage (BE-1 layout): <StickyMobileCTA globals={globals} />
 */

import { Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import type { Globals } from '@/lib/types';

export interface StickyMobileCTAProps {
  globals: Globals;
  /** Quote CTA target. */
  quoteHref?: string;
  /** Elements that suppress the bar while visible. */
  watchSelector?: string;
}

export function StickyMobileCTA({
  globals,
  quoteHref = '/get-custom-quote/',
  watchSelector = '[data-quote-form], #quote-form, footer',
}: StickyMobileCTAProps) {
  const pathname = usePathname();
  const [suppressed, setSuppressed] = useState(false);

  const onQuotePage = pathname?.startsWith('/get-custom-quote') ?? false;

  useEffect(() => {
    if (onQuotePage) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = Array.from(document.querySelectorAll(watchSelector));
    if (targets.length === 0) {
      setSuppressed(false);
      return;
    }

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setSuppressed(visible.size > 0);
      },
      // Trigger as soon as any part of the watched element shows.
      { threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));

    return () => {
      observer.disconnect();
      setSuppressed(false);
    };
    // Re-query per route — watched elements differ page to page.
  }, [pathname, watchSelector, onQuotePage]);

  if (onQuotePage) return null;

  return (
    <nav
      aria-label="Quick actions"
      // React 19 boolean `inert`: off-screen bar must not stay focusable.
      inert={suppressed || undefined}
      className={`fixed inset-x-0 bottom-0 z-[var(--z-sticky-cta)] border-t border-ink-100 bg-[var(--header-bg-blur)] px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-md transition-transform duration-300 ease-brand md:hidden ${
        suppressed ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex gap-3">
        {/* FE-1 Button: tel: href renders a plain <a>; internal href = next/link */}
        <Button
          href={globals.phoneHref}
          variant="secondary"
          size="md"
          className="flex-1"
          iconLeft={<Phone size={18} />}
        >
          Call us
        </Button>
        <Button href={quoteHref} variant="primary" size="md" className="flex-1">
          Get a Quote
        </Button>
      </div>
    </nav>
  );
}
