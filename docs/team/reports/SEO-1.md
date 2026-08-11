# SEO-1 Report — technical/migration SEO (redirects + URL policy)
**Date:** 2026-06-12 · **Status:** DONE

## What I did

1. **Live-site research (web_fetch, 2026-06-12)** — verified the redirect spec against production before writing anything:
   - `locations-sitemap.xml`: exactly **221** doorway URLs; proved set-parity with the brief's 17-variant × 13-city matrix via regex alternation counts (17/17 variants for a fixed city, 13/13 cities for a fixed variant, totals both 221 ⇒ identical cross product).
   - `business-card-sitemap.xml`: exactly **31** doorway URLs (incl. live duplicate `tampa-2`) + the `/business-card/` hub.
   - `products-sitemap.xml` + `page-sitemap.xml`: ALL 14 distinct redirect destinations exist live; all 4 merge sources and all 7 utility sources exist live.
   - Spot-checked 2 doorway pages (`custom-detroit-pizza-boxes-in-chicago`, `custom-business-cards-in-tampa-2`): HTTP 200, `index,follow`, self-canonical **with trailing slash**; live footer links privacy policy as `/?page_id=3` (confirms the middleware case).
   - `robots.txt` current state captured (WP disallows `/wp-admin/`, `/wp-login.php`, `/sign-in/`, `/register/`).
   - Trailing-slash evidence: every URL in every live sitemap + every canonical uses trailing slashes.

2. **`scripts/gen-redirects.mjs`** (new) — generator holding the city/variant matrices; hard-fails on: wrong group counts (221/31/4/7), duplicate sources, redirect chains (destination that is also a source), regex-unsafe chars, trailing-slash violations, destinations not on the route whitelist; recounts the written file. `TRAILING_SLASH` flag kept in sync with next.config. *(Note: file sits in `scripts/`, owned by DEVOPS — placed there per PM task spec; coordinate.)*

3. **`lib/redirects.ts`** (my file; replaced ARCHITECT's placeholder by running the generator) — **263 static entries, fully expanded**: 221 locations + 31 business-card + 4 product merges + 7 utility. Exported exactly as `const redirects: { source: string; destination: string; permanent: true }[]`. All entries 308, trailing-slash forms.

4. **`middleware.ts`** (new) — the 264th legacy URL: `/?page_id=3` → 308 `/privacy-policy/`. Matcher scoped to `/` only; documented why it cannot live in next.config (query-string-only source on `/` with the agreed 3-field array shape).

5. **`next.config.ts` (ARCHITECT's file — touched, minimally)** — ARCHITECT had already wired `import { redirects } from './lib/redirects'`. I added **`trailingSlash: true`** (required or all 263 sources never match; live site uses trailing slashes everywhere) with an explanatory comment, and corrected the redirect-count comment (264 → 263 + 1 middleware). Logged in ISSUES as S2, marked fixed-by-SEO-1.

6. **`docs/seo/REDIRECTS.md`** — counts table by group (263 config + 1 middleware = 264 total, matches brief), variant→target map, 10 verbatim example entries, 6-layer verification method (generator assertions, grep counts, live cross-check record, vitest test for QA-AUTO, post-deploy curl smoke, GSC monitoring), known gaps, regeneration instructions.

7. **`docs/seo/TECH_SEO.md`** — trailing-slash decision + evidence; canonical strategy (incl. `/case-studies` → `/portfolio` canonical decision); `sitemap.ts` spec for BE-2 (211 URLs: 1+22+1+153+1+16+17; exclusions each justified); `robots.ts` spec (do NOT disallow redirecting legacy paths); www+https enforcement at the edge (DEVOPS); GSC 90-day same-domain replatform checklist.

## Verification results (all passing)
- `node scripts/gen-redirects.mjs` → exits 0, prints 221/31/4/7 = 263.
- `grep -c ", permanent: true }," lib/redirects.ts` → 263; locations 221; business-card 31; products 4; dupes: none.
- Live parity checks as in §1 above.

## Decisions
- **`trailingSlash: true`** — preserve exact live URL forms; zero-hop for every indexed URL. Flip = regenerate redirects (script flag).
- **308 (`permanent: true`)** for everything — correct for a permanent migration; Google treats 308 as 301.
- Redirect entries generated **statically** (no regex/wildcard sources) — auditable, testable, zero ambiguity; doorways intentionally NOT pattern-matched (`/locations/:slug*`) so any future unknown URL 404s loudly instead of redirecting silently wrong.
- `?page_id=3` in middleware (matcher `/` only), not `has`-query config redirect — keeps `lib/redirects.ts` type-uniform per brief.
- `/case-studies/` canonicals to `/portfolio/` and stays out of the sitemap (duplicate content guard; SEO-2/BE-2 to implement).

## Issues found (logged in ISSUES.md)
- **S2 (fixed by me):** next.config.ts lacked `trailingSlash: true`.
- **S3:** live `/locations/` hub (in live nav) has no redirect in the 263 spec → would 404. Recommend `/locations/` → `/custom-pizza-boxes/` (PM approval; count → 264).
- **S3:** live `/sitemap/` HTML page renamed `/sitemap-page` in IA, no redirect specced. Recommend BE-2 redirect or route alias.
- **S3:** `/thank-you` must be noindex + excluded from sitemap.ts (live WP sitemap includes it; don't copy).

## Handoffs
- **ARCHITECT:** keep `trailingSlash: true` + the redirects() wiring; both commented in-file.
- **BE-2:** implement sitemap.ts/robots.ts exactly per TECH_SEO.md §3–4; add `/sitemap/` redirect decision.
- **SEO-2:** canonical helpers per TECH_SEO.md §2 (trailing-slash absolute URLs, metadataBase).
- **DATA-ENG:** keep the 4 merged slugs OUT of products.json (153 final) — redirect map depends on it.
- **QA-AUTO:** add the redirect + sitemap integrity tests (snippets in REDIRECTS.md §5D / TECH_SEO.md §3).
- **DEVOPS:** edge www+https per TECH_SEO.md §5; post-deploy smoke per REDIRECTS.md §5E. `scripts/gen-redirects.mjs` is mine content-wise; fold into CI if desired (`node scripts/gen-redirects.mjs && git diff --exit-code lib/redirects.ts`).
- **FE-2/FE-3/BE-1/BE-2:** write internal hrefs WITH trailing slash.
