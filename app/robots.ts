/**
 * app/robots.ts → /robots.txt (owner: BE-2). Spec: docs/seo/TECH_SEO.md §4.
 *
 * Deliberately permissive: unlike the live WP robots.txt we do NOT disallow
 * /sign-in/, /register/, /cart/, /checkout/, /locations/ or /business-card/
 * doorways — they are 308 redirects now and MUST stay crawlable so Google can
 * see and process the redirects (disallowing would freeze the old URLs in the
 * index). /thank-you/ stays crawlable so Google can read and honor its
 * noindex meta rule; blocking it here would hide that rule from Googlebot.
 *
 * /api/product-images/ is explicitly re-allowed below: it's how all product
 * gallery photos are served (see ProductCard / GalleryLightbox), so blanket-
 * blocking /api/ was hiding the entire product catalog from Google Images and
 * from Googlebot's page rendering. Ahrefs confirmed 1,041 images across 246
 * product pages were "Blocked by robots.txt" because of this. The broader
 * /api/ disallow stays in place for actual API endpoints (auth, data, etc.).
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/product-images/"],
        disallow: "/api/",
      },
    ],
    sitemap: "https://www.vitalcustomboxes.com/sitemap.xml",
  };
}