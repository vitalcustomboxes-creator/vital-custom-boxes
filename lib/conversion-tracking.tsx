'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  CONVERSION_LABELS,
  GOOGLE_ADS_CONVERSION_ID,
  type ConversionKey,
} from '@/lib/conversion-ids';
import { trackMetaEvent } from '@/lib/meta-pixel';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const RETRY_INTERVAL_MS = 200;
const MAX_RETRIES = 10;

/** QuoteForm calls this only after its server action returns ok: true. */
export function fireConversion(key: ConversionKey, attempt = 0): void {
  if (typeof window === 'undefined') return;

  // Only the first call sends Meta: Google retry attempts cannot duplicate it.
  if (attempt === 0) {
    if (key === 'quote') trackMetaEvent('Lead');
    if (key === 'whatsapp') trackMetaEvent('Contact');
  }

  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_CONVERSION_ID}/${CONVERSION_LABELS[key]}`,
    });
    return;
  }
  if (attempt >= MAX_RETRIES) return;
  window.setTimeout(() => fireConversion(key, attempt + 1), RETRY_INTERVAL_MS);
}

function isWhatsAppHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'wa.me' ||
        (url.hostname === 'api.whatsapp.com' && url.pathname.startsWith('/send')) ||
        (url.hostname === 'web.whatsapp.com' && url.pathname.startsWith('/send')))
    );
  } catch {
    return false;
  }
}

/** One listener covers floating WhatsApp, header and other WhatsApp links. */
export function ConversionClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !window.__vitalMetaInitialized) return;
    if (/^\/admin(?:\/|$)/.test(pathname)) return;
    // The head script sends the first PageView. Track subsequent SPA routes.
    // A window-level path guard also avoids duplicates in React Strict Mode.
    if (window.__vitalMetaLastPath === pathname) return;
    trackMetaEvent('PageView');
    window.__vitalMetaLastPath = pathname;
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
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
