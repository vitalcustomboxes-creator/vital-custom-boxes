/**
 * app/robots.ts → /robots.txt (owner: BE-2). Spec: docs/seo/TECH_SEO.md §4.
 *
 * Deliberately permissive: unlike the live WP robots.txt we do NOT disallow
 * /sign-in/, /register/, /cart/, /checkout/, /locations/ or /business-card/
 * doorways — they are 308 redirects now and MUST stay crawlable so Google can
 * see and process the redirects (disallowing would freeze the old URLs in the
 * index). /thank-you/ stays crawlable so Google can read and honor its
 * noindex meta rule; blocking it here would hide that rule from Googlebot.
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: "https://www.vitalcustomboxes.com/sitemap.xml",
  };
}
