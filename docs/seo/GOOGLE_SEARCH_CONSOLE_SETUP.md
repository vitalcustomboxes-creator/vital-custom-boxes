# Google Search Console Setup

Use this after deploying `https://www.vitalcustomboxes.com/`.

## 1. Verify Ownership

Recommended: verify the full domain property in Google Search Console with a DNS TXT record.

Alternative: use the HTML meta tag method.

1. In Search Console, choose `URL prefix` for `https://www.vitalcustomboxes.com/`.
2. Copy the Google verification token.
3. Add this environment variable in the hosting project:

```bash
GOOGLE_SITE_VERIFICATION=your-google-token
```

The root layout will emit the verification meta tag automatically.

## 2. Submit Sitemap

Deploy the current build first, then submit this sitemap in Search Console:

```text
https://www.vitalcustomboxes.com/sitemap.xml
```

Pre-submission verification requirements:

- The sitemap returns HTTP `200` with `Content-Type: application/xml`.
- Every `<loc>` is an absolute `https://www.vitalcustomboxes.com/` URL.
- Every listed URL returns HTTP `200`, is indexable, and has one self-canonical.
- Sitemap URLs, canonical URLs, and page titles are unique.
- Redirects, `/thank-you/`, `/admin/`, API routes, and error pages are excluded.
- `robots.txt` references this exact sitemap URL.
- `<lastmod>` appears only where a trustworthy content date exists. Deployment
  time must not be presented as the page's modification time.

Do not submit the sitemap until a production crawl passes all of these checks.
Google treats sitemap submission as a hint, so a successful submission does
not guarantee indexing.

The sitemap includes:

- Home
- Shop
- Blog
- Static content pages
- Shop category pages
- Product pages under `/shop/[category]/[slug]/`
- Blog posts

It intentionally excludes:

- `/thank-you/`
- API routes
- 404 pages
- Redirect-only legacy URLs like `/products/` and `/products/[slug]/`
- `/case-studies/`, which permanently redirects to `/portfolio/`

## 3. Inspect Priority URLs

Use URL Inspection in Search Console for:

```text
https://www.vitalcustomboxes.com/
https://www.vitalcustomboxes.com/shop/
https://www.vitalcustomboxes.com/shop/custom-bakery-boxes/
https://www.vitalcustomboxes.com/shop/custom-bakery-boxes/custom-cake-boxes/
https://www.vitalcustomboxes.com/get-custom-quote/
```

Request indexing after the deployed pages return `200` and the sitemap is live.

After submission, the only value entered in the Search Console Sitemaps field
for this property should be:

```text
sitemap.xml
```

## 4. AI Search Discovery

This project also exposes:

```text
https://www.vitalcustomboxes.com/llms.txt
```

This is an emerging AI-readable content map. It is not a guaranteed Google ranking factor and does not replace normal SEO, sitemap submission, or crawlable page content.

## 5. Ranking Work That Still Needs Business Input

These affect first-page competitiveness more than another technical tag:

- Confirm real phone number and local business details.
- Confirm real production turnaround and MOQ claims.
- Add real customer photos/case studies.
- Localize product images before launch by running `node scripts/localize-images.mjs`.
- Keep adding unique FAQs to product pages where questions exist.
