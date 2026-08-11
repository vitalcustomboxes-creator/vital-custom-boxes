/**
 * components/patterns/nav-types.ts — shared serializable shapes + pure helpers
 * for the navigation/layout pattern set. Owner: FE-2.
 *
 * WHY THIS FILE: lib/content.ts and lib/seo.ts are SERVER-ONLY (node:fs +
 * `server-only` guard — ISSUES #13/#15). Client components (Header, drawer,
 * sticky CTA) therefore receive content via props. Server pages call
 * `toNavCategories(getCategories())` and pass the result down — this module
 * has no directive so it is importable from both sides of the boundary.
 */
import type { Category } from '@/lib/types';

/** Light, serializable projection of a Category for nav/footer use. */
export interface NavCategory {
  slug: string;
  name: string;
  /** Mega-menu group label — "By Industry" | "By Material" | "By Style". */
  navGroup: string;
  /** Absolute https image URL (live www.hmcustompackaging.com asset). */
  imageUrl: string;
}

/** One dropdown/mega-menu group as rendered by Header + MobileNavDrawer. */
export interface NavGroup {
  /** Trigger label, e.g. "By Industry". */
  label: string;
  /** Stable id fragment, e.g. "industry" → panel id "mega-industry". */
  key: string;
  /** Hub page for the group's "View all" tail link. */
  viewAllHref: string;
  viewAllLabel: string;
  categories: NavCategory[];
}

/**
 * Self-hosted logo (public/VITAL Logo.webp, 565×226 — Vital Custom Boxes wordmark).
 * Matches ORG_LOGO_URL in
 * lib/seo.ts (server-only, hence not imported here). Override per-instance
 * via the `logoUrl` prop on Header/Footer.
 */
export const DEFAULT_LOGO_URL = '/VITAL%20Logo.webp';

/** Intrinsic dimensions of public/VITAL Logo.webp (keep next/image ratio correct). */
export const LOGO_WIDTH = 565;
export const LOGO_HEIGHT = 226;

/** Map full Category objects (server side) down to nav props. */
export function toNavCategories(categories: Category[]): NavCategory[] {
  return categories.map(({ slug, name, navGroup, imageUrl }) => ({
    slug,
    name,
    navGroup,
    imageUrl,
  }));
}

/**
 * Group categories for the Header mega menus / drawer sub-panels.
 * Grouping key is `navGroup` (the live mega-menu grouping): the two
 * type="General" categories (custom-boxes, business-card) carry
 * navGroup="By Industry" in content/categories.json, so nothing is dropped.
 * Order inside each group preserves categories.json order.
 */
export function groupNavCategories(categories: NavCategory[]): NavGroup[] {
  const defs = [
    {
      label: 'By Industry',
      key: 'industry',
      viewAllHref: '/industries/',
      viewAllLabel: 'View all industries',
    },
    {
      label: 'By Material',
      key: 'material',
      viewAllHref: '/materials/',
      viewAllLabel: 'View all materials',
    },
    {
      label: 'By Style',
      key: 'style',
      viewAllHref: '/box-styles/',
      viewAllLabel: 'View all box styles',
    },
  ];
  return defs.map((def) => ({
    ...def,
    categories: categories.filter((c) => c.navGroup === def.label),
  }));
}
