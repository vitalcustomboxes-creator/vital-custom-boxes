/**
 * lib/seo.ts — Metadata + JSON-LD helpers for vitalcustomboxes.com
 * Owner: SEO-2 · Spec: docs/seo/KEYWORD_META_MAP.md + docs/PROJECT_BRIEF.md audit checklist
 *
 * SERVER-ONLY MODULE. Import from `generateMetadata`, server pages/layouts and
 * server components. Do NOT import from client components ("use client") —
 * `getSiteGlobals()` reads from disk with node:fs. Render <JsonLd/> at the
 * page/layout level (server) and pass plain data down.
 *
 * Hard rules implemented here (audit checklist + docs/seo/TECH_SEO.md):
 *  - titles ≤60 chars, pattern `<Primary Keyword> | Vital Custom Boxes`
 *  - meta descriptions ≤160 chars
 *  - canonical = https://www.vitalcustomboxes.com + path, TRAILING-SLASH form
 *    (SEO-1 set `trailingSlash: true`; all live URLs/canonicals use it)
 *  - Product JSON-LD WITHOUT aggregateRating/review/offers (nothing fabricated)
 *  - word-boundary truncation helper (shared; FE may re-export for card excerpts)
 *
 * content/globals.json is owned by DATA-ENG and is written in parallel with this
 * file: it is therefore read lazily at call time (never at import time) and every
 * field has a typed fallback, so this module works even if the file is missing.
 */

// ARCHITECT (ISSUES log, 2026-06-12): explicit server-only guard — importing
// this module from a "use client" component now fails at build time.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import type { Metadata } from "next";

/* ------------------------------------------------------------------------- */
/* Site constants                                                             */
/* ------------------------------------------------------------------------- */

export const SITE_URL = "https://www.vitalcustomboxes.com";
/** BE-1: set `metadataBase: METADATA_BASE` once in the root layout (TECH_SEO §2.1). */
export const METADATA_BASE = new URL("https://www.vitalcustomboxes.com");
export const SITE_NAME = "Vital Custom Boxes";
/** ` | Vital Custom Boxes` — 22 chars, leaving ≤38 for the primary keyword. */
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/**
 * Self-hosted brand assets — DEVOPS edit per ISSUES #9, 2026-06-12 (was:
 * live wp-content URLs, which die at WP cutover). Files live in /public:
 *   /og-default.svg  1200×630 branded card (TODO: swap to raster PNG before
 *                    launch — some social scrapers ignore SVG og:image; logged)
 *   /VITAL%20Logo.webp brand lockup used for site header/footer and structured data
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.webp`;
export const ORG_LOGO_URL = `${SITE_URL}/VITAL%20Logo.webp`;

/* ------------------------------------------------------------------------- */
/* Small utilities                                                            */
/* ------------------------------------------------------------------------- */

function devWarn(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[lib/seo] ${message}`);
  }
}

/**
 * Resolve a route path (or already-absolute URL) against the canonical host.
 * URL policy per docs/seo/TECH_SEO.md §1–2 (SEO-1: `trailingSlash: true` is
 * wired in next.config.ts — every live URL uses trailing slashes):
 *   absolute https://www. + lowercase path + leading AND trailing slash,
 *   query/fragment stripped (canonicals are always the bare path).
 * Absolute http(s) inputs (e.g. live image URLs) pass through unchanged.
 * Do NOT change this convention post-launch (redirect map depends on it).
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  let path = (pathOrUrl.split(/[?#]/, 1)[0] ?? "").trim().toLowerCase();
  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.endsWith("/")) path = `${path}/`;
  return `${SITE_URL}${path}`;
}

/**
 * Truncate at a word boundary (audit rule: no mid-word "…ellips" cuts).
 * Collapses whitespace; appends a single ellipsis char; result ≤ max.
 */
export function truncateAtWordBoundary(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, Math.max(1, max - 1));
  const lastSpace = slice.lastIndexOf(" ");
  const cut = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(
    /[\s,;:.!?–—-]+$/u,
    "",
  );
  return `${cut}…`;
}

/* ------------------------------------------------------------------------- */
/* Site globals (content/globals.json — owned by DATA-ENG, read lazily)       */
/* ------------------------------------------------------------------------- */

export interface SitePromo {
  text: string;
  href: string;
}

export interface SiteGlobals {
  sla: string;
  moq: string;
  shipping: string;
  phone: string;
  phoneHref: string;
  email: string;
  promo: SitePromo;
  address: string;
  social?: Record<string, string>;
}

/** Values mirror docs/PROJECT_BRIEF.md; used when content/globals.json is absent. */
export const FALLBACK_GLOBALS: SiteGlobals = {
  sla: "Standard production in 8–12 business days, depending on order size",
  moq: "flexible — ask for your run size",
  shipping: "Free shipping across the USA & Canada",
  phone: "+1 (828) 455-0798",
  phoneHref: "tel:+18284550798",
  email: "sales@vitalcustomboxes.com",
  promo: {
    text: "Get 40% Off + Free Design Support + Free Shipping",
    href: "/get-custom-quote",
  },
  address: "3000 Shelby St, Indianapolis, IN 46227, USA",
  social: {},
};

let cachedGlobals: SiteGlobals | null = null;

/**
 * Lazy, fault-tolerant read of content/globals.json. Never throws; merges over
 * FALLBACK_GLOBALS so partial files are safe. Cached per server process.
 */
export function getSiteGlobals(): SiteGlobals {
  if (cachedGlobals) return cachedGlobals;
  let fromDisk: Partial<SiteGlobals> = {};
  try {
    const raw = readFileSync(join(process.cwd(), "content", "globals.json"), "utf8");
    fromDisk = JSON.parse(raw) as Partial<SiteGlobals>;
  } catch {
    devWarn(
      "content/globals.json not readable yet (DATA-ENG writes it); using FALLBACK_GLOBALS.",
    );
  }
  cachedGlobals = {
    ...FALLBACK_GLOBALS,
    ...fromDisk,
    promo: { ...FALLBACK_GLOBALS.promo, ...(fromDisk.promo ?? {}) },
  };
  return cachedGlobals;
}

/** Test hook: clear the globals cache (used by vitest after writing fixtures). */
export function __resetSiteGlobalsCache(): void {
  cachedGlobals = null;
}

/* ------------------------------------------------------------------------- */
/* Aggregate rating (content/ratings.json — real migrated reviews)            */
/* ------------------------------------------------------------------------- */

export interface SiteRatingSummary {
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
}

let cachedRating: SiteRatingSummary | null = null;

/**
 * Lazy, fault-tolerant read of content/ratings.json (real migrated reviews:
 * 4.9 / 100). Returns null if the file is missing/empty so callers can omit
 * aggregateRating rather than fabricate a score. Cached per server process.
 */
export function getSiteRatingSummary(): SiteRatingSummary | null {
  if (cachedRating) return cachedRating;
  try {
    const raw = readFileSync(join(process.cwd(), "content", "ratings.json"), "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteRatingSummary>;
    if (
      typeof parsed.ratingValue === "number" &&
      typeof parsed.reviewCount === "number" &&
      parsed.reviewCount > 0
    ) {
      cachedRating = {
        ratingValue: parsed.ratingValue,
        reviewCount: parsed.reviewCount,
        bestRating: typeof parsed.bestRating === "number" ? parsed.bestRating : 5,
      };
      return cachedRating;
    }
  } catch {
    devWarn("content/ratings.json not readable — omitting aggregateRating.");
  }
  return null;
}

/** Test hook: clear the rating cache. */
export function __resetSiteRatingCache(): void {
  cachedRating = null;
}

/* ------------------------------------------------------------------------- */
/* Metadata builder                                                           */
/* ------------------------------------------------------------------------- */

export interface BuildMetadataInput {
  /** Final title, ≤60 chars (use buildPageTitle / buildProductTitle / the maps below). */
  title: string;
  /** Final meta description, ≤160 chars. */
  description: string;
  /** Route path starting with "/", e.g. "/custom-bakery-boxes/" (slash added if missing). */
  path: string;
  /** Absolute URL or site-relative path; falls back to DEFAULT_OG_IMAGE. */
  ogImage?: string;
  /** "website" (default) for pages, "article" for blog posts. */
  ogType?: "website" | "article";
  /** true for /thank-you and other utility pages that must not be indexed. */
  noIndex?: boolean;
}

/**
 * Single source for per-page <head> metadata: canonical + Open Graph + Twitter.
 * Dev-warns (never throws) when audit limits are exceeded so QA catches it.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { title, description, path, ogImage, ogType = "website", noIndex = false } = input;

  if (title.length > TITLE_MAX) {
    devWarn(`title >${TITLE_MAX} chars (${title.length}) on ${path}: "${title}"`);
  }
  if (description.length > DESCRIPTION_MAX) {
    devWarn(`description >${DESCRIPTION_MAX} chars (${description.length}) on ${path}`);
  }

  const canonical = toAbsoluteUrl(path);
  const image = ogImage ? toAbsoluteUrl(ogImage) : DEFAULT_OG_IMAGE;

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_US",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  if (noIndex) {
    // Google must be allowed to crawl the page to see and honor `noindex`.
    // Keeping follow enabled also lets discovery flow through utility pages.
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

/* ------------------------------------------------------------------------- */
/* Title / description pattern helpers (spec: KEYWORD_META_MAP.md §6)         */
/* ------------------------------------------------------------------------- */

/** `<primary> | Vital Custom Boxes` — dev-warns if the result exceeds 60. */
export function buildPageTitle(primary: string): string {
  const title = `${primary.trim()}${TITLE_SUFFIX}`;
  if (title.length > TITLE_MAX) {
    devWarn(`buildPageTitle produced ${title.length} chars: "${title}"`);
  }
  return title;
}

/** Lazy memo of non-product titles (declared below; built at first call). */
let reservedPageTitleSet: Set<string> | null = null;
function reservedPageTitles(): Set<string> {
  reservedPageTitleSet ??= new Set([
    ...Object.values(CATEGORY_META).map((meta) => meta.title),
    ...Object.values(STATIC_PAGE_META).map((meta) => meta.title),
  ]);
  return reservedPageTitleSet;
}

/**
 * Product title patterns, with an optional curated title:
 *  0: curated title, when valid and not already used by a category/static page
 *  A: `<Name> Wholesale | Vital Custom Boxes` (when ≤60)
 *  B: `<Name> | Vital Custom Boxes`           (when A >60 and B ≤60)
 *  C: name alone, word-boundary truncated to 60, no suffix (names >38 — none today)
 *
 * QA-AUTO 2026-06-12 (ISSUES, SEO-VERIFY obs.1): when a product shares its name
 * with a category (custom-pizza-boxes, custom-display-boxes), Pattern A
 * duplicated the CATEGORY_META title site-wide (§11 wants unique titles) — such
 * products now fall through to Pattern B. Locked by tests/seo.test.ts.
 */
export function buildProductTitle(name: string, preferredTitle?: string): string {
  const base = name.trim().replace(/\s+/g, " ");
  const preferred = preferredTitle?.trim().replace(/\s+/g, " ");
  const reserved = reservedPageTitles();

  if (preferred && preferred.length <= TITLE_MAX && !reserved.has(preferred)) {
    return preferred;
  }

  const withWholesale = `${base} Wholesale${TITLE_SUFFIX}`;
  if (withWholesale.length <= TITLE_MAX && !reserved.has(withWholesale)) {
    return withWholesale;
  }
  const plain = `${base}${TITLE_SUFFIX}`;
  if (plain.length <= TITLE_MAX && !reserved.has(plain)) return plain;

  const productSpecific = `${base} Packaging${TITLE_SUFFIX}`;
  if (productSpecific.length <= TITLE_MAX && !reserved.has(productSpecific)) {
    return productSpecific;
  }

  return truncateAtWordBoundary(base, TITLE_MAX);
}

/** Blog title pattern shared by the page template and full-site SEO tests. */
export function buildBlogTitle(title: string): string {
  const clean = title.trim().replace(/\s+/g, " ");
  const suffixed = `${clean}${TITLE_SUFFIX}`;
  return suffixed.length <= TITLE_MAX
    ? suffixed
    : truncateAtWordBoundary(clean, TITLE_MAX);
}

/**
 * Product meta description template (≤160 guaranteed). Prefer a hand-written
 * unique blurb from products.json when available:
 *   buildProductDescription(name, { blurb: product.excerpt })
 */
export function buildProductDescription(
  name: string,
  opts?: { blurb?: string },
): string {
  if (opts?.blurb && opts.blurb.trim().length > 0) {
    return truncateAtWordBoundary(opts.blurb, DESCRIPTION_MAX);
  }
  const base = name.trim().replace(/\s+/g, " ");
  const text = `Order ${base} with your logo, wholesale — free design support and free shipping across the USA & Canada. Get a fast custom quote.`;
  return truncateAtWordBoundary(text, DESCRIPTION_MAX);
}

/* ------------------------------------------------------------------------- */
/* JSON-LD builders                                                           */
/* ------------------------------------------------------------------------- */

export type JsonLdObject = Record<string, unknown>;

/**
 * Organization + LocalBusiness (single node) for the root layout — render once
 * per page via <JsonLd data={orgSchema()} />. NAP pulled lazily from
 * content/globals.json with safe fallbacks.
 */
export function orgSchema(overrides?: Partial<SiteGlobals>): JsonLdObject {
  const g: SiteGlobals = { ...getSiteGlobals(), ...(overrides ?? {}) };
  const sameAs = Object.values(g.social ?? {}).filter((url) =>
    /^https:\/\//i.test(url),
  );

  // Real aggregate rating from content/ratings.json (migrated reviews: 4.9 /
  // 100). Emitted ONLY here on the Organization node — productSchema stays
  // free of aggregateRating by design (tests/seo.test.ts locks that).
  const rating = getSiteRatingSummary();

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: ORG_LOGO_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: g.phone,
    email: g.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "3000 Shelby St",
      addressLocality: "Indianapolis",
      addressRegion: "IN",
      postalCode: "46227",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: g.phone,
      email: g.email,
      areaServed: ["US", "CA"],
      availableLanguage: "English",
    },
    priceRange: "$$",
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount,
            bestRating: rating.bestRating,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Route path ("/custom-bakery-boxes/") or absolute URL. */
  path: string;
}

/** BreadcrumbList for inner pages — items in order, starting with Home. */
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  /** Plain text (no markdown/HTML) — must match the visible FAQ copy. */
  answer: string;
}

/**
 * FAQPage — emit ONLY on pages where the FAQ block visibly renders, and only
 * once per page (audit rule: one FAQ block per page).
 */
export function faqSchema(faqs: FaqItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface ProductSchemaInput {
  name: string;
  /** One or more gallery image URLs (absolute or site-relative). */
  image: string | string[];
  description: string;
  /** Route path ("/shop/custom-bakery-boxes/custom-cake-boxes/") or absolute URL. */
  url: string;
  sku?: string;
  category?: string;
}

/**
 * Product schema. AUDIT RULE: NO aggregateRating and NO review — the live
 * site's rating badges are unverified and must not be fabricated in structured
 * data. `offers` is also intentionally omitted: pricing is quote-based and an
 * invented price would be fake data. Do not "enhance" this without real data.
 */
export function productSchema(input: ProductSchemaInput): JsonLdObject {
  const images = (Array.isArray(input.image) ? input.image : [input.image])
    .filter((src) => src.trim().length > 0)
    .map(toAbsoluteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    ...(images.length > 0 ? { image: images } : {}),
    description: input.description,
    url: toAbsoluteUrl(input.url),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.category ? { category: input.category } : {}),
  };
}

/* ------------------------------------------------------------------------- */
/* <JsonLd/> component                                                        */
/* ------------------------------------------------------------------------- */

/** JSON.stringify with `<` escaped — prevents </script> breakout/XSS. */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[];
}

/**
 * Renders <script type="application/ld+json">…</script>.
 * Server components only (see module header). Plain .ts file, so no JSX here.
 */
export function JsonLd({ data }: JsonLdProps): ReactElement {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}

/* ------------------------------------------------------------------------- */
/* Canonical per-page values (single source: docs/seo/KEYWORD_META_MAP.md)    */
/* ------------------------------------------------------------------------- */

export interface PageMeta {
  /** ≤60 chars, brand-suffixed. */
  title: string;
  /** ≤160 chars, includes value props. */
  description: string;
  /** The page's single H1. */
  h1: string;
}

/**
 * Final metadata for all 22 category routes, keyed by slug.
 * BE-1: `const meta = CATEGORY_META[params.category]` →
 * `buildMetadata({ ...meta, path: \`/${params.category}/\`, ogImage: category.image })`.
 */
export const CATEGORY_META: Record<string, PageMeta> = {
  "custom-apparel-boxes": {
    title: "Custom Apparel Boxes Wholesale | Vital Custom Boxes",
    description:
      "Pack shirts, suits & streetwear in custom apparel boxes with your logo. Free US shipping, free design support.",
    h1: "Custom Apparel Boxes",
  },
  "custom-bakery-boxes": {
    title: "Custom Bakery Boxes Wholesale | Vital Custom Boxes",
    description:
      "Order custom bakery boxes with logo or window for cakes, cookies & pastries. Food-safe stocks, free US shipping, free design support.",
    h1: "Custom Bakery Boxes",
  },
  "custom-candle-boxes": {
    title: "Custom Candle Boxes Wholesale | Vital Custom Boxes",
    description:
      "Protect jars and lift shelf appeal with custom candle boxes with logo. Free design support and free US shipping.",
    h1: "Custom Candle Boxes",
  },
  "custom-cbd-boxes": {
    title: "Custom CBD Boxes Wholesale | Vital Custom Boxes",
    description:
      "Retail-ready custom CBD boxes for tinctures, gummies & topicals, with label-friendly panels. Free shipping, free design support.",
    h1: "Custom CBD Boxes",
  },
  "custom-cosmetics-boxes": {
    title: "Custom Cosmetics Boxes Wholesale | Vital Custom Boxes",
    description:
      "Luxury custom cosmetics boxes for skincare, lipstick & beauty kits. Free design support and free US shipping.",
    h1: "Custom Cosmetics Boxes",
  },
  "custom-events-packaging": {
    title: "Custom Event Packaging & Favor Boxes | Vital Custom Boxes",
    description:
      "Custom event packaging for weddings, parties & corporate gifts — favor boxes to gift bags. Free shipping, free design support.",
    h1: "Custom Events Packaging",
  },
  "custom-food-boxes": {
    title: "Custom Food Boxes Wholesale | Vital Custom Boxes",
    description:
      "Food-safe custom food boxes for restaurants, meal-prep and retail brands. Free US shipping, free design support.",
    h1: "Custom Food Boxes",
  },
  "custom-gift-boxes": {
    title: "Custom Gift Boxes Wholesale | Vital Custom Boxes",
    description:
      "Make every order feel like a gift with custom gift boxes with logo, ribbon & inserts. Free shipping, free design support.",
    h1: "Custom Gift Boxes",
  },
  "custom-pizza-boxes": {
    title: "Custom Pizza Boxes Wholesale | Vital Custom Boxes",
    description:
      "Grease-resistant custom pizza boxes printed with your logo, from slice boxes to 18-inch. Free US shipping, free design support.",
    h1: "Custom Pizza Boxes",
  },
  "custom-takeout-boxes": {
    title: "Custom Takeout Boxes Wholesale | Vital Custom Boxes",
    description:
      "Custom takeout boxes that keep food hot and your brand in hand. Food-safe stocks, free design support and free US shipping.",
    h1: "Custom Takeout Boxes",
  },
  "custom-tobacco-packaging": {
    title: "Custom Tobacco Packaging Boxes | Vital Custom Boxes",
    description:
      "Custom tobacco packaging for licensed cigar, cigarette & accessory brands. Free design support and free US shipping.",
    h1: "Custom Tobacco Packaging",
  },
  "custom-toy-boxes": {
    title: "Custom Toy Boxes Wholesale | Vital Custom Boxes",
    description:
      "Playful custom toy boxes with window cutouts and vivid print that stand out on shelves. Free shipping, free design support.",
    h1: "Custom Toy Boxes",
  },
  "custom-boxes": {
    title: "Custom Boxes with Logo Wholesale | Vital Custom Boxes",
    description:
      "Design custom boxes with logo in any size, style or material. Fast quotes, free US shipping and free design support.",
    h1: "Custom Boxes",
  },
  "business-card": {
    title: "Custom Business Card Printing | Vital Custom Boxes",
    description:
      "Print custom business cards with foil, emboss & spot UV finishes that match your packaging. Low minimums, free design support, free US shipping.",
    h1: "Custom Business Cards",
  },
  "mylar-bags": {
    // ⚠ Compliance wording rules apply — KEYWORD_META_MAP.md §5 / CONTENT_GUIDELINES.md §7.
    title: "Custom Mylar Bags Wholesale | Vital Custom Boxes",
    description:
      "Custom mylar bags with logo — high-barrier, resealable, with child-resistant options. Free design support and free US shipping.",
    h1: "Custom Mylar Bags",
  },
  "custom-printed-bags": {
    // Fixes the live "Luxuty" title typo.
    title: "Custom Printed Bags Wholesale | Vital Custom Boxes",
    description:
      "Custom printed bags in kraft, paper and canvas that carry your brand everywhere. Free design support and free US shipping.",
    h1: "Custom Printed Bags",
  },
  "custom-rigid-boxes": {
    title: "Custom Rigid Boxes Wholesale | Vital Custom Boxes",
    description:
      "Luxury custom rigid boxes with magnetic lids and foil finishes for premium brands. Free design support and free US shipping.",
    h1: "Custom Rigid Boxes",
  },
  "custom-display-boxes": {
    title: "Custom Display Boxes Wholesale | Vital Custom Boxes",
    description:
      "Counter and retail custom display boxes that sell your product at the point of sale. Free design support and free US shipping.",
    h1: "Custom Display Boxes",
  },
  "custom-insert-boxes": {
    title: "Custom Insert Boxes Wholesale | Vital Custom Boxes",
    description:
      "Custom insert boxes with die-cut cardboard or foam inserts that lock products in place. Free shipping, free design support.",
    h1: "Custom Insert Boxes",
  },
  "custom-mailer-boxes": {
    title: "Custom Mailer Boxes Wholesale | Vital Custom Boxes",
    description:
      "E-commerce-ready custom mailer boxes printed inside and out for a memorable unboxing. Free US shipping and free design support.",
    h1: "Custom Mailer Boxes",
  },
  "custom-product-packaging-boxes": {
    title: "Custom Product Packaging Boxes | Vital Custom Boxes",
    description:
      "Custom product packaging boxes engineered around your exact product, brand and budget. Free shipping, free design support.",
    h1: "Custom Product Packaging Boxes",
  },
  "custom-retail-boxes": {
    title: "Custom Retail Boxes Wholesale | Vital Custom Boxes",
    description:
      "Shelf-ready custom retail boxes with logo that win the in-store glance. Free US shipping, free design support.",
    h1: "Custom Retail Boxes",
  },
};

/**
 * Final metadata for the key static routes, keyed by slash-less route key
 * (lookup key only — emitted canonicals are trailing-slashed by toAbsoluteUrl).
 * BE-2: `buildMetadata({ ...STATIC_PAGE_META["/faqs"], path: "/faqs/" })`
 * or use `getStaticPageMeta(path)` for slash-insensitive lookup.
 * /thank-you additionally passes `noIndex: true`.
 */
export const STATIC_PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Custom Packaging Boxes Wholesale | Vital Custom Boxes",
    description:
      "Custom packaging boxes with logo, made to order in the USA. Fast quotes, free design support and free US shipping on every order.",
    h1: "Custom Packaging Boxes That Build Your Brand",
  },
  "/products": {
    title: "Shop All Custom Packaging Products | Vital Custom Boxes",
    description:
      "Browse 150+ custom box styles, bags and packaging products by industry, material and style. Free design support and free US shipping on every order.",
    h1: "All Custom Packaging Products",
  },
  "/shop": {
    title: "Shop Custom Packaging | Vital Custom Boxes",
    description:
      "Shop custom packaging categories by industry, material and box style. Find the right starting point for your custom quote.",
    h1: "Shop Custom Packaging",
  },
  "/get-custom-quote": {
    title: "Get a Free Custom Packaging Quote | Vital Custom Boxes",
    description:
      "Tell us your size, stock and quantity to get a fast, no-obligation custom packaging quote — with free design support and free US shipping.",
    h1: "Get Your Free Custom Quote",
  },
  "/contact": {
    title: "Contact Us | Vital Custom Boxes",
    description:
      "Talk to a packaging specialist. Call +1 (828) 455-0798 or email sales@vitalcustomboxes.com for quotes, samples and order support.",
    h1: "Contact Vital Custom Boxes",
  },
  "/about-us": {
    title: "About Us | Vital Custom Boxes",
    description:
      "Meet Vital Custom Boxes — a US custom box maker pairing premium printing with free design support and free shipping.",
    h1: "About Vital Custom Boxes",
  },
  "/faqs": {
    title: "Packaging FAQs | Vital Custom Boxes",
    description:
      "Answers about MOQs, turnaround, materials, artwork files and shipping for custom packaging orders from Vital Custom Boxes.",
    h1: "Frequently Asked Questions",
  },
  "/reviews": {
    title: "Customer Reviews | Vital Custom Boxes",
    description:
      "See what customers say about our custom boxes, bags and design service — ratings and reviews of Vital Custom Boxes.",
    h1: "Customer Reviews",
  },
  "/materials": {
    title: "Packaging Materials Guide | Vital Custom Boxes",
    description:
      "Compare cardstock, corrugated, kraft and rigid stocks — weights, finishes and best uses — to choose the right material for your custom boxes.",
    h1: "Packaging Materials Guide",
  },
  "/box-styles": {
    title: "Custom Box Styles Guide | Vital Custom Boxes",
    description:
      "Explore mailer, tuck-end, rigid, gable, display and more box styles with diagrams to find the right structure for your product.",
    h1: "Custom Box Styles",
  },
  "/industries": {
    title: "Packaging by Industry | Vital Custom Boxes",
    description:
      "From bakery to beauty to CBD — find custom packaging tuned to your industry's shelf, shipping and labeling needs.",
    h1: "Packaging by Industry",
  },
  "/how-it-works": {
    title: "How It Works | Vital Custom Boxes",
    description:
      "From quote to doorstep: quote reply within one business day, free design proof, 8–12 business day production depending on order size, and free shipping.",
    h1: "How It Works",
  },
  "/sustainability": {
    title: "Sustainable Packaging | Vital Custom Boxes",
    description:
      "Recyclable kraft, soy-based inks and biodegradable options — how we help brands cut packaging waste without cutting corners.",
    h1: "Sustainable Packaging",
  },
  "/samples": {
    title: "Packaging Samples | Vital Custom Boxes",
    description:
      "See and feel the quality first — request material swatches and sample boxes before you commit to a full production run.",
    h1: "Request Packaging Samples",
  },
  "/case-studies": {
    // Canonicalize to /portfolio (duplicate content) — KEYWORD_META_MAP.md §4.
    title: "Packaging Case Studies | Vital Custom Boxes",
    description:
      "Real packaging projects from quote to delivery — how brands use custom boxes to lift retail presence and unboxing moments.",
    h1: "Packaging Case Studies",
  },
  "/portfolio": {
    title: "Packaging Portfolio | Vital Custom Boxes",
    description:
      "A look at recent custom box and bag projects across bakery, beauty, food and retail — designed, printed and shipped by Vital Custom Boxes.",
    h1: "Our Packaging Portfolio",
  },
  "/blog": {
    title: "Packaging Blog | Vital Custom Boxes",
    description:
      "Packaging guides, sizing charts and design tips from the Vital Custom Boxes team — learn before you print.",
    h1: "Packaging Insights & Guides",
  },
  "/terms-conditions": {
    title: "Terms & Conditions | Vital Custom Boxes",
    description:
      "Read the terms and conditions for ordering custom packaging from Vital Custom Boxes, including quotes, proofs, production and delivery.",
    h1: "Terms & Conditions",
  },
  "/shipping-policy": {
    title: "Shipping Policy | Vital Custom Boxes",
    description:
      "How we ship custom packaging orders: free US shipping, production timelines, tracking and delivery details.",
    h1: "Shipping Policy",
  },
  "/return-policy": {
    title: "Return Policy | Vital Custom Boxes",
    description:
      "Our policy for reprints and refunds on custom packaging orders, and how to report an issue with your delivery.",
    h1: "Return Policy",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Vital Custom Boxes",
    description:
      "How Vital Custom Boxes collects, uses and protects your information when you request quotes or place orders.",
    h1: "Privacy Policy",
  },
  "/sitemap-page": {
    title: "HTML Sitemap | Vital Custom Boxes",
    description:
      "Browse every page on Vital Custom Boxes — categories, products, guides and policies — from one index.",
    h1: "Sitemap",
  },
  "/thank-you": {
    // BE-2: pass noIndex: true for this route.
    title: "Thank You | Vital Custom Boxes",
    description: "Your request has been received — here is what happens next.",
    h1: "Thank You — Request Received",
  },
};

/**
 * Slash-insensitive lookup into STATIC_PAGE_META ("/faqs", "/faqs/", "faqs"
 * all resolve). Returns undefined for unmapped routes so callers can fall
 * back to buildPageTitle()/custom copy.
 */
export function getStaticPageMeta(path: string): PageMeta | undefined {
  let key = path.trim().toLowerCase();
  if (!key.startsWith("/")) key = `/${key}`;
  if (key.length > 1 && key.endsWith("/")) key = key.slice(0, -1);
  return STATIC_PAGE_META[key];
}
