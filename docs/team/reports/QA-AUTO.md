# QA-AUTO report — automated quality gates + test expansion — 2026-06-12

## Status: DONE — every gate green on the FINAL full pass (run after the last code edit)

## Gate table (before = wave start · after = final pass, gates run in order 1→7 on the frozen tree)

| # | Gate | Before (wave start) | After (FINAL pass) |
|---|---|---|---|
| 1 | `npx tsc --noEmit` | PASS — 0 errors | **PASS — 0 errors** |
| 2 | `npm run lint` (eslint .) | PASS — 0 errors, 0 warnings | **PASS — 0 errors, 0 warnings** (no warnings exist — the requested top-10 list is empty) |
| 3 | `npx vitest run` | PASS — 4 files / 35 tests | **PASS — 8 files / 88 tests** (53 new by QA-AUTO) |
| 4 | `npm run build` | green per BE-2 (not yet re-run this wave) | **PASS — ✓ compiled, 219/219 static pages, 26 routes in table** |
| 5 | `node scripts/check-budgets.mjs` | not runnable pre-build | **PASS — 26/26 routes ≤150 kB** · shared baseline 102.7 kB · biggest first-load **147.3 kB** (/contact, /samples) · /get-custom-quote **133.0 kB** |
| 6 | `node scripts/smoke.mjs` | 7/7 FAIL at DEVOPS handoff (S1 path break, since fixed by BE-1) | **PASS — 7/7 routes** (status + single-h1 + title) |
| 7 | `node scripts/qa-crawl.mjs` (NEW) | n/a | **PASS — 24/24 pages clean** |

Final-pass console summaries (verbatim):
```
GATE1 tsc: PASS 0 errors
GATE2 lint exit=0 (eslint . — no output = 0 errors, 0 warnings)
GATE3  Test Files  8 passed (8) · Tests  88 passed (88)
GATE4 build exit=0 · ✓ Generating static pages (219/219)
GATE5 [check-budgets] PASS — all 26 route(s) within 150 kB (budget 150 kB gzip · baseline 102.7 kB)
GATE6 [smoke] PASS — 7/7 routes ok
GATE7 [qa-crawl] PASS — 24/24 pages clean
```

## Mid-wave gate failure root-caused and fixed

`check-budgets` FAILED on first run: **/get-custom-quote = 151.3 kB** gzip
(`next build` column said 143 — DEVOPS' stricter per-file gzip accounting
crossed the 150 line). Cause: FE-3's QuoteForm (`'use client'`) imported zod
for UX-only validation → ~18.5 kB gzip chunk on the route. Fixed (see below);
route now **133.0 kB**.

## Edits to other roles' files (every one logged, commented in-file with attribution)

1. **components/patterns/QuoteForm.tsx (FE-3)** — client zod schemas →
   dependency-free per-field validators (messages/semantics 1:1; BE-3's
   submitQuote still zod-validates server-side). Also in the same file:
   **ISSUES #21** client quantity floor `MIN_QUANTITY = 25` + `min={25}`;
   **ISSUES #42** `data-quote-form=""` on the form root for StickyMobileCTA.
2. **.github/workflows/ci.yml (DEVOPS)** — appended the `QA crawl` stage after
   smoke (same job — consumes the build's `.next/`; port 3200 vs smoke's 3100).
   Sanctioned by the QA-AUTO brief.
3. **next.config.ts (ARCHITECT)** — `poweredByHeader: false` per SECURITY's
   ISSUE (S3, "SECURITY→QA-AUTO/DEVOPS"); `X-Powered-By` verified **null** on a
   live `next start` response after rebuild.
4. **app/reviews/page.tsx (BE-2)** — QA-MANUAL F-01: removed the double
   `.section` wrap around the section-owning ReviewWall + wired
   `trustpilotUrl={globals.social.trustpilot}`; rebuilt HTML verified (0 nested
   sections, link present).
5. **app/not-found.tsx (BE-2)** — SEO-VERIFY obs.2: 404 inherited HOME
   metadata; description/canonical/openGraph/twitter now nulled + explicit
   robots noindex; rebuilt `_not-found.html` verified clean.
6. **lib/seo.ts (SEO-2)** — SEO-VERIFY obs.1: `buildProductTitle` now skips
   Pattern A when it would duplicate a CATEGORY_META title (the 2 site-wide
   duplicate-title pairs: pizza/display category↔product). Verified in rebuilt
   HTML; locked by tests.
7. **content/globals.json (DATA-ENG)** — QA-MANUAL F-03: `promo.href` →
   `"/get-custom-quote/"` (trailing-slash normalization).

tests/* and scripts/qa-crawl.mjs are QA-AUTO-owned new files. No other
production files touched.

## New test suites (tests/ — 53 new tests, all green)

1. **tests/content.integrity.test.ts** (16) — counts locked to the brief: 22
   categories / 153 products / 16 posts; unique slugs per collection; every
   `product.category` ∈ category slugs; every imageUrl is an
   `https://www.hmcustompackaging.com` asset; banned-claims regex scan over the
   RAW text of every content/*.json (CONTENT_GUIDELINES §8: `no minimum`,
   `worldwide shipping`, `2-3 weeks`, `7-15 days`, `4-8 days`, `3-7 days`,
   `10-15 business`, mis-grouped `6926-437`, broken `078-2376`, foreign
   `custompackaging.com` via lookbehind) — second line of defense on top of
   scripts/validate-content.mjs.
2. **tests/redirects.test.ts** (10) — exactly **264** entries; **no chains**
   (no destination equals another entry's source); every source starts with `/`
   and ends with `/` (trailingSlash: true); destinations site-relative
   trailing-slash; all `permanent: true`; sources unique; spec group counts
   (222 `/locations/` incl. hub + 31 `/business-card/`); BE-2 handoff
   cross-checks: `sitemap()` = exactly **211** entries, none a redirect source,
   all absolute https-www trailing-slash.
3. **tests/seo.test.ts** (17) — buildMetadata canonical = absolute
   trailing-slash (slash appended when missing, og:url mirror, query/fragment
   stripped, lowercased); robots noindex only when asked; all 22 CATEGORY_META
   titles ≤60 + ` | HM Custom Packaging` suffix, descriptions ≤160, h1
   non-empty; STATIC_PAGE_META same limits; productSchema emits **no
   aggregateRating** (nor review/offers); product-title uniqueness vs category
   titles (Pattern-B fallback + dataset-wide no-collision scan).
4. **tests/utils.test.ts** (10) — truncateWords/truncateAtWord word-boundary
   contract: untouched under budget, whole-word cuts + single ellipsis,
   trailing-punctuation strip, whitespace collapse, ≤0 budget → '',
   never-mid-word property.

## New CI gate (scripts/qa-crawl.mjs — wired into ci.yml after smoke)

Boots `next start` (port 3200) on the production build (clear exit-1 if .next
missing) and crawls a 24-page sample — home · 5 categories (incl. regulated
mylar-bags + business-card) · 10 products across 10 categories (regulated
first) · quote · contact · reviews · blog index + newest post · /sitemap/ ·
terms + privacy. Per page: HTTP 200 · exactly one `<h1` · ≤1 FAQPage JSON-LD
(recursive @type walk) · BreadcrumbList JSON-LD on every inner page · no
`undefined`/`NaN`/`[object Object]` literals in visible HTML (script/style
stripped) · banned-claims scan (same list as the content test) · every tel:
href === `tel:+12136926437` · no `http://www.hmcustompackaging` links · every
`<img>` has alt. Product/post slugs derive from /content at runtime.

## Whole-build sweeps (beyond the 24-page sample)

Grep over ALL prerendered `.next/server/app/**/*.html`: **zero** banned-claim
hits, **zero** insecure `http://www.hmcustompackaging` links, **1001/1001**
`tel:` hrefs canonical.

## Ticked-ISSUES spot-verification (brief: "verify ticked items where cheap")

#2/#5 redirects = 264 incl. /locations/ hub (parsed + test-locked) ✓ · #3 HTML
sitemap at /sitemap/ (crawled clean) ✓ · #4 trailingSlash:true ✓ · #7 thank-you
noIndex + robots disallow ✓ · #8/#9 banned claims/compliance (content scan +
crawl clean) ✓ · #11 lib/seo.ts self-hosted asset constants ✓ · #12
/case-studies canonical → /portfolio/ ✓ · #16 data-js script in layout head ✓ ·
#18 eslint flat config 0/0 ✓ · #24 blocks/ import paths (build green) ✓ · #32
ToastProvider in layout ✓ · #34 types/fe-contracts.d.ts deleted ✓

## ISSUES ticked by QA-AUTO this wave

#21 (quantity min 25) · #42 (data-quote-form) · #55 (poweredByHeader) ·
QA-MANUAL F-01 (reviews double-wrap) · F-02 (rebuild carried QuoteForm fixes) ·
F-03 (promo.href slash) · SEO-VERIFY obs.1 (duplicate titles) · obs.2 (404
metadata) — plus my own budget S2. Filed: lib/forms client-zod split
suggestion (S3, prereq for #20) · qa-crawl CI stage FYI (S3).

## Notes for VERIFY wave

- Sandbox: background processes do NOT survive between bash calls;
  `npm run build` fits the 45s cap only with a warm `.next` cache (CI
  unaffected).
- /get-custom-quote and /products are ƒ dynamic by design (searchParams);
  both crawled clean at runtime.
- lib/seo.ts FALLBACK_GLOBALS still has slash-less promo.href (fallback-only
  path; SEO-2 may align).
- The 88-test suite + qa-crawl encode every machine-checkable audit rule;
  visual/contrast/keyboard checks remain with QA-MANUAL (their report is in).
