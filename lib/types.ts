/**
 * lib/types.ts — content model for Vital Custom Boxes (DATA-ENG owned).
 *
 * Shapes mirror /content/*.json exactly (CMS-ready: flat, serializable,
 * referenced by slug). Loaders live in lib/content.ts.
 */

/** Whether copy was captured verbatim from the live site or derived from the slug. */
export type CopyStatus = 'live' | 'derived';

/** Semantic category grouping. */
export type CategoryType = 'Industry' | 'Material' | 'Style' | 'General';

export interface Faq {
  /** Stable id for sitewide FAQs (e.g. "turnaround"); omitted on inline product/category FAQs. */
  slug?: string;
  question: string;
  answer: string;
}

export interface Category {
  /** URL segment — route is /[slug] (22 slugs, see PROJECT_BRIEF.md). */
  slug: string;
  name: string;
  /** SEO title, pattern "<Name> | Vital Custom Boxes" (≤60 chars). */
  title?: string;
  type: CategoryType;
  /** Live mega-menu group this category appears under ("By Industry" | "By Material" | "By Style"). */
  navGroup: string;
  /** 1–2 sentence intro. */
  description: string;
  /** Hero image — absolute https URL on www.hmcustompackaging.com. */
  imageUrl: string;
  /** Slugs of the products mapped to this category (inverse of Product.category). */
  productSlugs: string[];
  /**
   * True for regulated verticals (mylar-bags, custom-cbd-boxes,
   * custom-tobacco-packaging): render Globals.complianceDisclaimer on the
   * category page AND its product pages (docs/seo/CONTENT_GUIDELINES.md §7).
   */
  regulated?: boolean;
  /** Category-level FAQs where captured from the live page. */
  faqs?: Faq[];
  /** Compact category buyer guidance rendered below the product grid. */
  intro?: string;
  highlights?: string[];
  buyersGuide?: string[];
  copyStatus: CopyStatus;
}

export interface Product {
  /** URL segment — route is /shop/[category]/[slug] (285 products). */
  slug: string;
  name: string;
  /** SEO title, pattern "<Name> | Vital Custom Boxes" (≤60 chars). */
  title?: string;
  /** 1–2 sentence description (copyStatus says whether it is live copy). */
  description: string;
  /** Primary image from products-sitemap.xml — absolute https URL on www.hmcustompackaging.com. */
  imageUrl: string;
  /** Descriptive alt text for SEO/a11y; falls back to a name-based pattern. */
  imageAlt?: string;
  /** Optional product gallery images; product detail pages prefer these when present. */
  images?: Array<{
    src: string;
    alt: string;
  }>;
  /** Owning category — MUST be one of the 22 Category slugs. */
  category: string;
  /** Live SKU (BB-HMC-####) where observed on the live site; omitted when unknown. */
  sku?: string;
  /** Product-level FAQs where captured from the live page. */
  faqs?: Faq[];
  /** Compact product benefits rendered on product detail pages. */
  highlights?: string[];
  /** Recommended product applications/use cases. */
  bestFor?: string[];
  /** Concise material guidance for this product. */
  materials?: string[];
  /** Concise finish guidance for this product. */
  finishes?: string[];
  /** Slugs of related products (same category). */
  related?: string[];
  copyStatus: CopyStatus;
}

export interface Post {
  /** URL segment — route is /blog/[slug] (16 posts). */
  slug: string;
  title: string;
  /** Hero image from blog-sitemap.xml — absolute https URL on www.hmcustompackaging.com. */
  imageUrl: string;
  /** One-sentence excerpt for cards/meta. */
  excerpt: string;
  /**
   * Body paragraphs separated by "\n\n".
   * Placeholder content is prefixed "TODO-migrate" until live copy is migrated.
   */
  body: string;
  /** ISO date (YYYY-MM-DD), from sitemap lastmod. */
  publishedAt?: string;
  copyStatus: CopyStatus;
}

export interface Review {
  author: string;
  location: string;
  /** 1–5 integer. */
  rating: number;
  text: string;
  /**
   * Provenance:
   *  - "migrated"    — real testimonial carried over from the previous site
   *  - "verified"    — review verified through the reviews data layer
   *  - "placeholder" — not real (kept only for legacy/seed compatibility)
   */
  source: 'placeholder' | 'migrated' | 'verified';
  /** True for real/verified reviews. */
  verified: boolean;
  /** ISO date (YYYY-MM-DD) the review was captured/posted. */
  date?: string;
}

/**
 * Aggregate rating summary (content/ratings.json). Feeds the hero badge and
 * the Organization JSON-LD aggregateRating. Mirrors schema.org AggregateRating.
 */
export interface RatingSummary {
  /** Average rating, e.g. 4.9. */
  ratingValue: number;
  /** Number of reviews behind the value. */
  reviewCount: number;
  /** Top of the scale — always 5 here. */
  bestRating: 5;
}

export interface CaseStudy {
  /** URL segment — used by /case-studies and /portfolio. */
  slug: string;
  title: string;
  industry: string;
  /** Related Category slug. */
  categorySlug: string;
  /** Absolute https URL on www.hmcustompackaging.com (live portfolio image). */
  imageUrl: string;
  summary: string;
  challenge: string;
  solution: string;
  /** Qualitative outcomes — no fabricated metrics. */
  results: string[];
  /** Pre-launch reminder; remove once client approves copy. */
  todo?: string;
  copyStatus: CopyStatus;
}

export interface Promo {
  text: string;
  href: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  x: string;
  pinterest: string;
  trustpilot: string;
}

/** Single source of truth for SLA/MOQ/contact/promo — see content/globals.json. */
export interface Globals {
  /** ONE sitewide SLA string — never restate different turnarounds elsewhere. */
  sla: string;
  /** ONE sitewide MOQ string. */
  moq: string;
  /** ONE sitewide shipping string. */
  shipping: string;
  phone: string;
  /** tel: href matching `phone`. */
  phoneHref: string;
  email: string;
  promo: Promo;
  address: string;
  /** Disclaimer for regulated categories/products (CONTENT_GUIDELINES §7). */
  complianceDisclaimer: string;
  social: SocialLinks;
}

/** Result row returned by lib/content.ts `search()`. */
export interface SearchResult {
  type: 'product' | 'category' | 'post';
  slug: string;
  name: string;
  description: string;
  href: string;
  imageUrl: string;
}
