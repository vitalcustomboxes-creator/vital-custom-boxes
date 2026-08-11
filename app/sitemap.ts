/**
 * app/sitemap.ts → /sitemap.xml (owner: BE-2). Spec: docs/seo/TECH_SEO.md §3.
 *
 * Built EXCLUSIVELY from the typed loaders + lib/routes.ts — never a
 * hand-maintained URL list. The total grows with the Firestore catalog:
 *   1 home + 1 /shop/ hub + 1 /blog/ hub + 17 static
 *   (lib/routes.ts)
 *   + 22 categories + current products + 16 posts.
 *
 * Deliberately EXCLUDED (documented per spec):
 *  - /case-studies/  → permanently redirects to /portfolio/; sitemaps list
 *                      final canonical URLs only.
 *  - /thank-you/     → noindex conversion page (ISSUES #5). The live WP
 *                      sitemap wrongly includes it — do not copy that.
 *  - /api/*, not-found, and all 297 redirect sources (lib/redirects.ts).
 *
 * Format: absolute https://www. URLs with trailing slashes (trailingSlash:
 * true). Blog posts use their real published date as lastModified. Routes
 * without a trustworthy content-update date omit lastModified; a deployment
 * timestamp is not a content update. changeFrequency/priority are omitted —
 * Google ignores them.
 */
import type { MetadataRoute } from "next";
import { getCategories, getPosts } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { categoryPath, productPath, STATIC_CONTENT_ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublicProducts();

  const entry = (path: string, lastModified?: Date) => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    // Hubs (labelled separately from the static registry — see lib/routes.ts).
    entry("/"),
    entry("/shop/"),
    entry("/blog/"),

    // 17 static content routes (includes /sitemap/ per PM decision).
    ...STATIC_CONTENT_ROUTES.map((route) => entry(route.path)),

    // 22 category pages (incl. /shop/business-card/ — ISSUES, DATA-ENG note).
    ...getCategories().map((category) => entry(categoryPath(category))),

    // Product detail pages from the current catalog.
    ...products.map((product) => entry(productPath(product))),

    // 16 blog posts — lastModified from publishedAt where present.
    ...getPosts().map((post) =>
      entry(
        `/blog/${post.slug}/`,
        post.publishedAt ? new Date(`${post.publishedAt}T00:00:00Z`) : undefined,
      ),
    ),
  ];
}
