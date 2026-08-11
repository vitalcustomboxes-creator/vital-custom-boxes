# SEO-2 REPORT — content/on-page SEO
**Role:** SEO-2 · **Date:** 2026-06-12 · **Status:** DONE
**Files created:** `docs/seo/KEYWORD_META_MAP.md` · `lib/seo.ts` · `docs/seo/CONTENT_GUIDELINES.md`

## What I did
1. **Research (live baseline, fetched 2026-06-12):** homepage, `/custom-bakery-boxes/`, `/custom-printed-bags/`, `/products/custom-cake-boxes/`, `/mylar-bags/` + 2 SERP queries ("custom mailer boxes wholesale", "custom mylar bags with logo wholesale"). Findings baked into the map (§2):
   - Homepage title is "Home - HM Custom Packaging" (zero keyword value); bakery title 61 chars, meta 199 chars.
   - **"Luxuty" typo CONFIRMED** in `/custom-printed-bags/` title.
   - **Double H1s** on bakery/cake/mylar pages; **two FAQ blocks** on product pages.
   - Contradictory claims everywhere: "no minimum" vs MOQ 100; "free worldwide shipping over $100" vs free US; four different turnaround claims (2-3 weeks / 7-15 days / 4-8 days / 3-7 working days) vs global 7–12; broken `tel:+1-078-2376` in the mobile drawer; phone mis-grouped as "+1 (213) 6926-437"; rating badges (4.9/100+, 5.0/47+) linking to `#`; `http://` internal links.
   - Mylar page cannabis wording risk confirmed ("smell proof… discretion", "Custom Weed Mylar Bags", "no minimum").
   - SERP convention: head keyword first + one differentiator (low MOQ / free design / wholesale) + brand — our pattern matches.

2. **`docs/seo/KEYWORD_META_MAP.md`** — final, ready-to-paste keyword/intent/title/meta/H1 for **all 22 categories**, **16 static pages**, **7 policy/utility rows**, plus product TITLE/META patterns (A/B/C fallback chain) and blog patterns. All values machine-validated: **max title 58, max meta 149, 0 violations** (Appendix A documents the re-check procedure for SEO-VERIFY).

3. **`lib/seo.ts`** — typed, server-only helpers for BE agents:
   - `buildMetadata({title, description, path, ogImage?, ogType?, noIndex?}): Metadata` — canonical on `https://www.hmcustompackaging.com` in **trailing-slash form** (aligned with SEO-1's `trailingSlash: true` decision after reading their report; `toAbsoluteUrl` lowercases, strips query/fragment, adds leading+trailing slash — 7/7 case test passed), OG + Twitter, dev-warns on >60/>160. `METADATA_BASE` exported for the root layout.
   - JSON-LD: `orgSchema()` (Organization+LocalBusiness, NAP lazily read from `content/globals.json` — **tolerates the file missing**, typed `SiteGlobals` + `FALLBACK_GLOBALS` mirror the brief; cached; `__resetSiteGlobalsCache()` test hook), `breadcrumbSchema(items)`, `faqSchema(faqs)`, `productSchema({name,image,description,url,sku?,category?})` with **NO aggregateRating/review/offers** (audit rule — commented in code so nobody "enhances" it).
   - `JsonLd({data})` React component (`createElement`, so the file stays `.ts`) with `<`-escaped serialization (`serializeJsonLd`) against `</script>` breakout.
   - Pattern helpers: `buildPageTitle`, `buildProductTitle`, `buildProductDescription(name, {blurb?})`, `truncateAtWordBoundary` (audit's word-boundary truncation — FE-3 should use it for card excerpts), `toAbsoluteUrl`.
   - **`CATEGORY_META` (22) + `STATIC_PAGE_META` (22)** — the map's final strings as typed records so BE-1/BE-2 import instead of copy-pasting; `getStaticPageMeta(path)` does slash-insensitive lookup.

4. **`docs/seo/CONTENT_GUIDELINES.md`** — category copy rules (single H1, 150–250 unique editorial words, anti-stuffing limits, banned filler openers), one-FAQ-block rule (4–6 Qs, schema/visible-text parity), internal-linking rules (category→products, product→related+breadcrumb, hubs, blog→money pages, anchor + href hygiene), image alt conventions (≤125 chars, no keyword-chain alts, decorative `alt=""`), §7 compliance do/don't table for mylar/CBD/tobacco **with required disclaimer line**, §8 banned-claims list, §11 per-page pre-publish checklist.

## Key decisions
- Title pattern `<Primary Keyword> Wholesale | HM Custom Packaging` (matches SERP conventions; suffix 22 chars → primary ≤38).
- Product titles via helper, not hand-written ×153: Pattern A adds " Wholesale" only when total ≤60; B drops it; C (name >38, none today) truncates at word boundary.
- Mylar category metadata uses "cannabis"-free, compliant phrasing; product `custom-weed-mylar-bags` keeps its URL/name (search volume) with compliant body copy per guidelines §7.
- `/case-studies` should canonicalize to `/portfolio/` (live page with equity) — duplicate grid content. SEO-1 reached the same decision independently (TECH_SEO §2.5) — converged.
- **Cross-agent sync with SEO-1 (post-publish):** their report landed `trailingSlash: true` while I was writing; I updated `toAbsoluteUrl` + both my docs to trailing-slash convention and ticked the coordination issue in ISSUES.md. Canonicals, JSON-LD urls and internal-href guidance now all match the redirect map's URL forms.
- `getSiteGlobals()` reads at call time with `node:fs` + try/catch (never a top-level JSON import), so the module imports cleanly before DATA-ENG lands `content/globals.json`.

## Handoff notes
- **BE-1:** set `metadataBase: METADATA_BASE` in root layout; `buildMetadata({ ...CATEGORY_META[slug], path: "/" + slug + "/", ogImage: category.image })`; products: `buildProductTitle/Description` + `productSchema` + `breadcrumbSchema`. Render `<JsonLd data={orgSchema()} />` once in root layout.
- **BE-2:** `STATIC_PAGE_META[path]`; pass `noIndex: true` for `/thank-you`; `faqSchema` only where the FAQ block renders; canonical override for `/case-studies` → `/portfolio`.
- **FE-2/FE-3:** do NOT import `lib/seo.ts` from `"use client"` components (server-only, uses `node:fs`); take `truncateAtWordBoundary` via a server parent or copy the 10-line util if needed client-side. FAQ data passed to `FAQAccordion` must be the same array passed to `faqSchema`.
- **DATA-ENG:** strip banned claims (guidelines §8) when extracting copy; display-name fixes without slug changes (`custom-mylar-vacum-seal-bags` → "Custom Mylar Vacuum Seal Bags"; "HM Custom Boxes" → "HM Custom Packaging"); category/product blurbs ≤160-ready.
- **QA-AUTO:** good unit targets — `truncateAtWordBoundary` (word boundary + ellipsis + ≤max), `buildProductTitle` (A/B/C), `toAbsoluteUrl` (trailing slash, absolute passthrough), `serializeJsonLd` (escapes `<`), `getSiteGlobals` (fallback when file missing; use `__resetSiteGlobalsCache`), and a length sweep over `CATEGORY_META`/`STATIC_PAGE_META`.
- **SEO-VERIFY:** re-run the Appendix A length check; verify one H1 per rendered page; FAQPage only where FAQs render; Product schema has no aggregateRating.

## Issues logged (6, 1 already resolved) — see docs/team/ISSUES.md
Claims contradictions (S2) · compliance wording + disclaimer (S2) · trailingSlash coordination (S2 — **resolved**: aligned to SEO-1's `trailingSlash: true`) · live-asset OG/logo constants at cutover (S3) · case-studies canonical (S3) · server-only import constraint (S3).
