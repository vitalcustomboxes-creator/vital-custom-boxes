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
  fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
  fbq('init', '${META_PIXEL_ID}');
  fbq('trackSingle', '${META_PIXEL_ID}', 'PageView');
  window.__vitalMetaLastPath = location.pathname;
})();
`;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __vitalMetaInitialized?: boolean;
    __vitalMetaLastPath?: string;
  }
}

export function trackMetaEvent(event: 'Lead' | 'Contact' | 'PageView'): void {
  if (typeof window === 'undefined') return;
  if (window.location.hostname.toLowerCase().startsWith('admin.')) return;
  if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return;
  if (!window.__vitalMetaInitialized || !window.fbq) return;
  try {
    // No names, emails, phone numbers, artwork or form values are sent here.
    window.fbq('trackSingle', META_PIXEL_ID, event);
  } catch {
    // Tracking must never interrupt navigation or a successful form submission.
  }
}
