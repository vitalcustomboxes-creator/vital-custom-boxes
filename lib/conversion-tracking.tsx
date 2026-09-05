'use client';

/**
 * lib/conversion-tracking.tsx — Google Ads conversion click tracking.
 *
 * Per docs/team/vcb-conversion-tracking-spec.html (account 358-006-7062,
 * campaign "VCB | Search | US | Custom Boxes"). This file only holds the
 * client-side click listener; the IDs/labels themselves live in
 * lib/conversion-ids.ts (a plain module) so Server Components like
 * app/layout.tsx can read them directly.
 *
 * fireConversion() is defensive: gtag.js loads via next/script
 * strategy="afterInteractive", so window.gtag should normally exist by the
 * time any click happens — but if it's ever called in the narrow window
 * before that script has run (e.g. a very fast click right after
 * navigation), we retry briefly instead of silently dropping the event.
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

const RETRY_INTERVAL_MS = 200;
const MAX_RETRIES = 10; // ~2 seconds total

/**
 * Fires one of the conversion actions. If window.gtag isn't ready yet
 * (gtag.js hasn't finished loading), retries briefly instead of dropping
 * the event — a click can happen before the script has executed.
 */
export function fireConversion(key: ConversionKey, attempt = 0): void {
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_CONVERSION_ID}/${CONVERSION_LABELS[key]}`,
    });
    return;
  }
  if (attempt >= MAX_RETRIES) return; // gtag never loaded (blocked, offline, etc.) — give up quietly
  window.setTimeout(() => fireConversion(key, attempt + 1), RETRY_INTERVAL_MS);
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