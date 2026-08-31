'use client';

/**
 * lib/conversion-tracking.tsx — Google Ads conversion click tracking.
 *
 * Per docs/team/vcb-conversion-tracking-spec.html (account 358-006-7062,
 * campaign "VCB | Search | US | Custom Boxes"). This file only holds the
 * client-side click listener; the IDs/labels themselves live in
 * lib/conversion-ids.ts (a plain module) so Server Components like
 * app/layout.tsx and app/thank-you/page.tsx can read them directly.
 *
 * Delegated listener (rather than per-component onClick) so every current
 * and future tel:/wa.me link on the site is covered automatically —
 * phoneHref/WhatsApp links are threaded through 30+ files (Footer, Header,
 * CTABand, StickyMobileCTA, MobileNavDrawer, PromoBar, ...).
 */
import { useEffect } from 'react';

import { CONVERSION_LABELS, GOOGLE_ADS_CONVERSION_ID, type ConversionKey } from '@/lib/conversion-ids';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fires one of the three conversion actions. Safe to call before gtag.js loads (no-ops). */
export function fireConversion(key: ConversionKey): void {
  window.gtag?.('event', 'conversion', {
    send_to: `${GOOGLE_ADS_CONVERSION_ID}/${CONVERSION_LABELS[key]}`,
  });
}

function isWhatsAppHref(href: string): boolean {
  return href.includes('wa.me/') || href.includes('api.whatsapp.com/send');
}

/**
 * Mounted once in the root layout. Listens for clicks on any anchor whose
 * href is a tel: link or a WhatsApp link, anywhere in the document —
 * including inside client components that render after hydration.
 */
export function ConversionClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href]');
      const href = anchor?.getAttribute('href');
      if (!href) return;
      if (href.startsWith('tel:')) {
        fireConversion('phone');
      } else if (isWhatsAppHref(href)) {
        fireConversion('whatsapp');
      }
    }
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}