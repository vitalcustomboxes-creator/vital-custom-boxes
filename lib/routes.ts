/**
 * lib/routes.ts — static content-route registry (owner: BE-2).
 *
 * Single source of truth for the site's NON-dynamic public content routes,
 * consumed by:
 *   - app/sitemap.ts        (XML sitemap — docs/seo/TECH_SEO.md §3)
 *   - app/sitemap/page.tsx  (HTML sitemap at /sitemap/ — PM decision in ISSUES)
 *
 * Dynamic routes (22 categories, 285 products, 16 posts) come from the typed
 * loaders in lib/content.ts — never hand-maintain those lists.
 *
 * Deliberately EXCLUDED from this registry (TECH_SEO §3 + KEYWORD_META_MAP §4):
 *   - "/"            home and the "/products/", "/blog/" hubs are added by the
 *                    consumers explicitly (they carry different labels/sections)
 *   - /case-studies/ permanently redirects to /portfolio/ — only final
 *                     canonical URLs are listed
 *   - /thank-you/    noindex conversion page
 *   - redirect sources (see lib/redirects.ts) and /api/*
 */

import legacyUrlRedirects from '@/content/legacy-url-redirects.json';

const legacyPaths = new Map(legacyUrlRedirects.map(({ source, destination }) => [source, destination]));

export interface StaticRoute {
  /** Human label for the HTML sitemap. */
  name: string;
  /** Trailing-slash path (trailingSlash: true — TECH_SEO §1). */
  path: string;
  /** Grouping for the HTML sitemap page. */
  group: "explore" | "company" | "legal";
}

export interface ProductRouteInput {
  slug: string;
  category: string;
}

export interface CategoryRouteInput {
  slug: string;
}

export function categoryPath(category: CategoryRouteInput): string {
  return `/shop/${category.slug}/`;
}

export function productPath(product: ProductRouteInput): string {
  const path = `/shop/${product.category}/${product.slug}/`;
  return legacyPaths.get(path) ?? path;
}

export function legacyProductPath(slug: string): string {
  return `/products/${slug}/`;
}

export const STATIC_CONTENT_ROUTES: StaticRoute[] = [
  { name: "Custom Soap Boxes", path: "/custom-soap-boxes/", group: "explore" },
  { name: "Custom Shipping Boxes", path: "/custom-shipping-boxes/", group: "explore" },
  { name: "Custom Kraft Boxes", path: "/custom-kraft-boxes/", group: "explore" },
  { name: "Custom Corrugated Boxes", path: "/custom-corrugated-boxes/", group: "explore" },
  { name: "Get a Custom Quote", path: "/get-custom-quote/", group: "explore" },
  { name: "Box Styles", path: "/box-styles/", group: "explore" },
  { name: "Materials Guide", path: "/materials/", group: "explore" },
  { name: "Packaging by Industry", path: "/industries/", group: "explore" },
  { name: "Request Samples", path: "/samples/", group: "explore" },
  { name: "How It Works", path: "/how-it-works/", group: "company" },
  { name: "About Us", path: "/about-us/", group: "company" },
  { name: "Sustainability", path: "/sustainability/", group: "company" },
  { name: "Portfolio", path: "/portfolio/", group: "company" },
  { name: "Customer Reviews", path: "/reviews/", group: "company" },
  { name: "FAQs", path: "/faqs/", group: "company" },
  { name: "Contact", path: "/contact/", group: "company" },
  { name: "Terms & Conditions", path: "/terms-conditions/", group: "legal" },
  { name: "Shipping Policy", path: "/shipping-policy/", group: "legal" },
  { name: "Return Policy", path: "/return-policy/", group: "legal" },
  { name: "Privacy Policy", path: "/privacy-policy/", group: "legal" },
  // PM decision (ISSUES): the HTML sitemap keeps the live URL /sitemap/
  // (app/sitemap/page.tsx) — NOT /sitemap-page. Coexists with /sitemap.xml.
  { name: "HTML Sitemap", path: "/sitemap/", group: "legal" },
];
