/** Public Pixel ID, not an API secret. */
export const META_PIXEL_ID = '3576324595863930';

/** Load once from the root layout head with next/script beforeInteractive. */
export const META_PIXEL_BASE = `
(function () {
  if (location.hostname.toLowerCase().startsWith('admin.') || /^\\/admin(?:\\/|$)/.test(location.pathname)) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
  t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  if (window.__vitalMetaInitialized) return;
  window.__vitalMetaInitialized = true;
  // Use explicit events only; do not enable automatic form-field matching.
  window.fbq.disablePushState = true;
  fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
  fbq('init', '${META_PIXEL_ID}');
  // PageView is sent only by the route tracker after hydration.
})();
`;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __vitalMetaInitialized?: boolean;
    __vitalMetaLastPath?: string;
  }
}

export function trackMetaEvent(event: 'Lead' | 'Contact' | 'PageView'): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname.toLowerCase().startsWith('admin.')) return false;
  if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return false;
  if (!window.__vitalMetaInitialized || !window.fbq) return false;
  try {
    // No names, emails, phone numbers, artwork or form values are sent here.
    window.fbq('trackSingle', META_PIXEL_ID, event);
    return true;
  } catch {
    // Tracking must never interrupt navigation or a successful form submission.
    return false;
  }
}

/** Treat a trailing slash as the same route. */
export function normalizeMetaPath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

/** One PageView per consecutive route, shared across mounts and Strict Mode. */
export function trackMetaPageView(pathname: string): boolean {
  if (typeof window === 'undefined') return false;
  const path = normalizeMetaPath(pathname);
  // Never label a stale render as the new browser URL during navigation.
  if (path !== normalizeMetaPath(window.location.pathname)) return false;
  if (window.__vitalMetaLastPath === path) return false;
  if (!trackMetaEvent('PageView')) return false;
  window.__vitalMetaLastPath = path;
  return true;
}
