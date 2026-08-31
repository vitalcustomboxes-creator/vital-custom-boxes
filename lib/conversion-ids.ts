/**
 * lib/conversion-ids.ts — Google Ads conversion IDs/labels.
 *
 * Deliberately NOT a 'use client' module: app/layout.tsx and
 * app/thank-you/page.tsx are Server Components and need to read
 * GOOGLE_ADS_CONVERSION_ID directly (e.g. inside <Script> template
 * strings). A 'use client' file's exports become client-component
 * references and can't be read as plain values from server code —
 * that's what caused the "GOOGLE_ADS_CONVERSION_ID is on the client"
 * error. Keep this file plain; only lib/conversion-tracking.tsx
 * (the actual click-listener component) needs 'use client'.
 */
export const GOOGLE_ADS_CONVERSION_ID = 'AW-18048020998';

export const CONVERSION_LABELS = {
  quote: 'Egt7COTFnOscEIbk-51D',
  phone: 'eeacCOfFnOscEIbk-51D',
  whatsapp: 'M4hpCOrFnOscEIbk-51D',
} as const;

export type ConversionKey = keyof typeof CONVERSION_LABELS;