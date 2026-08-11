/**
 * Client-safe quote-form options mirrored from the live Vital quote form.
 * Keep this module dependency-free so selecting an option never ships the
 * server-side Zod validation library to the browser.
 */
export const CATEGORY_SLUGS = [
  'custom-apparel-boxes',
  'custom-bakery-boxes',
  'custom-candle-boxes',
  'custom-cbd-boxes',
  'custom-cosmetics-boxes',
  'custom-events-packaging',
  'custom-food-boxes',
  'custom-gift-boxes',
  'custom-pizza-boxes',
  'custom-takeout-boxes',
  'custom-tobacco-packaging',
  'custom-toy-boxes',
  'custom-boxes',
  'business-card',
  'mylar-bags',
  'custom-printed-bags',
  'custom-rigid-boxes',
  'custom-display-boxes',
  'custom-insert-boxes',
  'custom-mailer-boxes',
  'custom-product-packaging-boxes',
  'custom-retail-boxes',
] as const;

export const QUOTE_STOCKS = [
  '12pt Card Stock',
  '14pt Card Stock',
  '16pt Card Stock',
  '18pt Card Stock',
  '20pt Card Stock',
  '22pt Card Stock',
  '24pt Card Stock',
  'SBS Board',
  'Kraft Stock',
  'Eco Friendly Stock',
  'Corrugated Stock',
  'Rigid Stock',
  'Other',
] as const;

export const QUOTE_COLORS = [
  '1 color',
  '2 color',
  '3 color',
  '4 color',
  'No Printing',
] as const;

export const QUOTE_SURFACES = [
  'Outside Only',
  'Inside Only',
  'Outside & Inside',
] as const;

export const QUOTE_LAMINATIONS = [
  'Glossy',
  'Matte',
  'Anti Scratch Soft Touch',
] as const;

export const QUOTE_FINISHES = [
  'Embossing',
  'Debossing',
  'Foiling',
  'PVC Window',
  'UV Coating',
] as const;

export const DIMENSION_UNITS = ['in', 'cm'] as const;

/**
 * One catalog entry as served by GET /api/product-options and consumed by the
 * quote form's product picker. Lives here so the route (server) and the picker
 * (client) share one definition without either importing the other.
 */
export interface ProductOption {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
}

export const QUOTE_OPTIONS = {
  boxTypes: CATEGORY_SLUGS,
  stocks: QUOTE_STOCKS,
  colors: QUOTE_COLORS,
  surfaces: QUOTE_SURFACES,
  laminations: QUOTE_LAMINATIONS,
  finishes: QUOTE_FINISHES,
  units: DIMENSION_UNITS,
} as const;
