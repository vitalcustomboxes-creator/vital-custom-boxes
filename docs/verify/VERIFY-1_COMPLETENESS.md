# VERIFY-1 — COMPLETENESS VERIFICATION (independent)
**Date:** 2026-06-12 · **Verifier:** VERIFY-1 · **Verdict: COMPLETE** (0 new gaps)

**Method.** Because VERIFY-2 rebuilds `.next` concurrently, the prerendered output was snapshotted FIRST
(`cp -r .next/server/app /tmp/v1-snap/app` + prerender/routes manifests, 40 MB, 212 HTML files) and every
build-output claim below was verified against that frozen snapshot + source files only. Inventory source of
truth: `/Users/applefoce/Desktop/HM_Rebuild_Master_Tracker.xlsx` (read via openpyxl: Pages 22 rows,
Categories 22, Products 157, Blog 16, New Pages 10, Redirects 264) diffed against `docs/PROJECT_BRIEF.md`
and the repo. No project code was modified.

---

## 1. Content vs tracker (set diffs, not just counts)

| Check | Expected (tracker) | Found (content/) | Set diff | Result |
|---|---|---|---|---|
| `content/categories.json` | 22 slugs (Categories sheet) | 22 | code−tracker = ∅ · tracker−code = ∅ | **PASS** |
| `content/products.json` | 157 − 4 merges = **153** | 153 | code−expected = ∅ · expected−code = ∅ | **PASS** |
| `content/posts.json` | 16 (Blog sheet) | 16 | code−tracker = ∅ · tracker−code = ∅ | **PASS** |

- All 4 merge slugs (`custom-hangtags`, `custom-drawer-style-boxes`, `custom-seeds-boxes`,
  `custom-pre-rolls-joints-boxes`) confirmed present in the tracker Products sheet and correctly EXCLUDED
  from products.json; each has a 301 in `lib/redirects.ts` (§3).
- Counts are regression-locked: `tests/content.integrity.test.ts` asserts exactly 22 / 153 / 16
  ("PROJECT_BRIEF invariants") plus slug uniqueness, referential integrity, image-URL host and banned-claims.
- Copy-fidelity flag (known, pre-logged): `copyStatus` = derived for 21/22 categories, 148/153 products,
  16/16 posts — verbatim live-copy migration is tracked in-data and in ISSUES #48 (blog bodies). Structural
  completeness is unaffected; no URL/entity is missing.

## 2. Routes vs tracker (Pages + New Pages) and orphan check

**Pages sheet (22 rows) → app/ mapping — every row accounted for:**

| Tracker URL | Action | Implementation | OK |
|---|---|---|---|
| `/` | Rebuild | `app/page.tsx` | ✔ |
| `/about-us/` | Rebuild | `app/about-us/page.tsx` | ✔ |
| `/contact/` | Rebuild | `app/contact/page.tsx` | ✔ |
| `/faqs/` | Rebuild | `app/faqs/page.tsx` | ✔ |
| `/portfolio/` | Rebuild as Case Studies | `app/portfolio/page.tsx` (+ `app/case-studies/page.tsx`, canonical → /portfolio) | ✔ |
| `/blog/` | Rebuild | `app/blog/page.tsx` (+ `app/blog/[slug]/page.tsx`) | ✔ |
| `/get-custom-quote/` | Rebuild | `app/get-custom-quote/page.tsx` (request-rendered: `?product=` preselect — ISSUES #45) | ✔ |
| `/products/` | Rebuild | `app/products/page.tsx` (request-rendered: `?q=` filter — ISSUES #52) + `app/products/[slug]/page.tsx` | ✔ |
| `/sitemap/` | Rebuild | `app/sitemap/page.tsx` — PM decision: HTML sitemap kept AT `/sitemap/` (brief's `/sitemap-page` superseded, ISSUES row 3 ✓) | ✔ |
| `/thank-you/` | Rebuild | `app/thank-you/page.tsx` (noindex + sitemap-excluded) | ✔ |
| `/terms-conditions/` `/shipping-policy/` `/return-policy/` | Rewrite | `app/terms-conditions|shipping-policy|return-policy/page.tsx` | ✔ |
| `/locations/` | Repurpose or drop | dropped; hub + all 221 children 308-redirected (§3) | ✔ |
| `/business-card/` | Rebuild | served by `app/[category]/page.tsx` (business-card is one of the 22 category slugs; prerendered `business-card.html` confirmed) | ✔ |
| `/register/` `/sign-in/` `/user-home/` `/my-account/` `/order-completed/` | Drop + 301 → / | 5 entries in `lib/redirects.ts` | ✔ |
| `/cart/` `/checkout/` | Drop + 301 → /get-custom-quote/ | 2 entries in `lib/redirects.ts` | ✔ |

**New Pages sheet — 10/10 exist:** `/privacy-policy/`, `/reviews/`, `/materials/`, `/box-styles/`,
`/industries/`, `/how-it-works/`, `/sustainability/`, `/samples/`, `/case-studies/` → each has
`app/<slug>/page.tsx`; the "(template) Branded 404" row → `app/not-found.tsx` (prerendered `_not-found.html`).

**Orphan check:** full `app/` inventory = the 24 page routes above + `layout.tsx`, `not-found.tsx`,
`sitemap.ts`, `robots.ts`, `actions.ts` (server actions, BE-3 scope), `api/search/route.ts` (BE-3 scope).
Every file maps to the PROJECT_BRIEF IA / team roster — **zero orphan routes**. The only IA deviation is the
PM-approved `/sitemap/` naming (above).

## 3. Redirects — exact reconciliation (264 vs 264)

| Source | Count | Composition |
|---|---|---|
| Tracker Redirects sheet | **264** | 221 locations + 31 business-card + 4 merges + 7 utility + **1 `/?page_id=3`** |
| `lib/redirects.ts` | **264** | 221 locations + 31 business-card + 4 merges + 7 utility + **1 `/locations/` hub (PM-approved extra)** |

Exact From→To set diff (regex-extracted from code, paired against all 264 tracker rows):
- **In tracker, not in code (1):** `/?page_id=3 → /privacy-policy/` — *by design*: query-string sources are
  unsupported in next.config redirects; handled in `middleware.ts` (308, `matcher: '/'`,
  `searchParams.get('page_id') === '3'` → `/privacy-policy/`). Documented in lib/redirects.ts header +
  docs/seo/REDIRECTS.md.
- **In code, not in tracker (1):** `/locations/ → /custom-pizza-boxes/` — the PM-APPROVED extra
  (ISSUES rows 2/5, ticked by BE-2).
- **Destination mismatches on the 263 shared sources: 0. Duplicate sources: 0.**

Wiring verified: `next.config.ts` imports `{ redirects } from "./lib/redirects"` and returns it from
`async redirects()`; `trailingSlash: true` set (required for the trailing-slash sources to match).
Regression-locked by `tests/redirects.test.ts` (`toHaveLength(264)`, 222 `/locations/` sources, 31
business-card, sitemap 211) and runtime-verified by SEO-VERIFY (15/15 samples 308 → 200, zero chains,
`?page_id=3` live-tested).

## 4. Prerendered output (frozen snapshot /tmp/v1-snap)

| Artifact | Expected | Found | Result |
|---|---|---|---|
| Product pages `products/*.html` | 153 | **153** (slug set == products.json, 0 missing / 0 extra) | **PASS** |
| Category pages `<slug>.html` | 22 | **22/22** (incl. `business-card.html`) | **PASS** |
| Blog post pages `blog/*.html` | 16 | **16** (slug set == posts.json) | **PASS** |
| Total prerendered HTML | — | 212 (the above + 21 statics incl. home, `_not-found`) | ✔ |
| `sitemap.xml` | 211 `<loc>` | **211** (153 products + 16 posts + 22 categories + statics; thank-you/case-studies excluded) | **PASS** |
| `/products/` + `/get-custom-quote/` | routes exist | compiled `page.js` present; request-rendered by design (searchParams; ISSUES #45/#52) | ✔ |

**5 random product spot-checks (seed 42)** — name/H1/image all present:

| Slug | H1 | H1==name | imageUrl in HTML | live host |
|---|---|---|---|---|
| custom-chinese-food-bags | "Custom Chinese Food Bags" | ✔ | ✔ | ✔ |
| custom-appliance-boxes | "Custom Appliance Boxes" | ✔ | ✔ | ✔ |
| custom-hanging-tab-boxes | "Custom Hanging Tab Boxes" | ✔ | ✔ | ✔ |
| custom-gable-boxes | "Custom Gable Boxes" | ✔ | ✔ | ✔ |
| custom-flap-boxes | "Custom Flap Boxes" | ✔ | ✔ | ✔ |

## 5. Audit-findings checklist — 20 rows, item by item

Sweep basis: ALL 212 snapshot HTML pages (not samples) unless noted. "Enforced in" cites component/test/report.

| # | Finding | Enforced in | Snapshot evidence | Verdict |
|---|---|---|---|---|
| 1 | Single H1 per page | Hero/PageHero own the h1 (FE-2/BE-2); CI guard `scripts/qa-crawl.mjs` | `<h1` count == 1 on **212/212** pages (0 violations) | **PASS** |
| 2 | One FAQ block per page | `faqSchema()` rule in lib/seo.ts; section-owning FAQAccordion | 0 pages with >1 FAQPage schema; max 1 visible FAQ section/page | **PASS** |
| 3 | Correct tel link everywhere | `globals.phoneHref` only (Footer/Header/CTABand props); QA-AUTO swept 1001/1001 | exactly ONE distinct tel href site-wide: `tel:+12136926437` | **PASS** |
| 4 | Single SLA/MOQ/shipping from globals.json | `getGlobals()`/`getSiteGlobals()` props-only rendering (ISSUES #8 closed); validate-content banned-claims scan | only ONE SLA string variant across all 212 pages: `7–12 business days` | **PASS** |
| 5 | Linked promo bar w/ code | `PromoBar.tsx` — whole bar is `<a href={promo.href}>`, code verbatim from globals | home: anchor `href="/get-custom-quote/"` containing `WELCOME10` | **PASS** |
| 6 | No fake badges (payments as text ok) | `Footer.tsx` "payment methods — labeled plain-text row (audit: no fake badges)" | footer renders `We accept: Visa · Mastercard · Amex · Discover · PayPal` (lucide icon aria-hidden); no badge imagery | **PASS** |
| 7 | No fabricated testimonials | `content/reviews.json`: 7 entries all `source:"placeholder"`, `verified:false`, `_note`; ReviewWall gates badges on `verified===true` (ISSUES #37) | no Verified/Trustpilot badge rendered; provenance caveat pre-logged ISSUES #64 (import real reviews before launch) | **PASS** |
| 8 | Real 404 | `app/not-found.tsx` (BE-2); metadata fix QA-AUTO (ISSUES #66); HTTP 404 status live-verified by SEO-VERIFY | `_not-found.html`: branded, H1 `Page not found`, recovery nav links present | **PASS** |
| 9 | Visible form labels | `ui/field.tsx` §5.2 "VISIBLE label (audit)" → `<label htmlFor>`; QuoteForm/LeadForm consume it | `contact.html`: 4 `<label>` elements, **0** sr-only | **PASS** |
| 10 | Word-boundary truncation | `lib/seo.ts truncateAtWordBoundary` + `lib/utils truncateAtWord/truncateWords` (re-export lib/format.ts); `tests/utils.test.ts` | category-page card excerpts end `…` after whole words (e.g. `choice…`, `option…`, `versatile…`) — no mid-word cuts | **PASS** |
| 11 | Equal-height cards | `ProductCard.tsx`: `flex h-full flex-col` + `mt-auto` pinned CTA | `custom-boxes.html`: 45 `h-full` occurrences across card grid | **PASS** |
| 12 | Footer year auto | `Footer.tsx`: `© {new Date().getFullYear()}` | all pages render `© <!-- -->2026<!-- --> HM Custom Packaging` (React text-node markers prove runtime expression, not hardcoded) | **PASS** |
| 13 | https links only | content validator + QA-AUTO/SEO-VERIFY sweeps | **0** `http://` href/src on 212/212 pages | **PASS** |
| 14 | Titles ≤60, pattern `<Name> \| HM Custom Packaging` | `lib/seo.ts` TITLE_MAX/buildPageTitle/buildProductTitle (+ dedupe per ISSUES #65); `tests/seo.test.ts` | **0/212** titles >60 (entity-decoded; the one 62-char raw is `&amp;` escaping = 58 real). Suffix present site-wide; 7/16 blog posts drop it where it would exceed 60 — per documented rule KEYWORD_META_MAP §"Blog posts (16)" | **PASS** |
| 15 | Meta description ≤160 | DESCRIPTION_MAX + buildMetadata devWarn; tests/seo.test.ts | **0/212** descriptions >160 chars | **PASS** |
| 16 | Breadcrumbs UI on inner pages | `ui/breadcrumbs.tsx` + InteriorHero breadcrumbs slot (FE-1/FE-2/BE-2) | product page has `nav aria-label="Breadcrumb"`; SEO-VERIFY confirms across products | **PASS** |
| 17 | BreadcrumbList JSON-LD on inner pages | `breadcrumbSchema()` lib/seo.ts; buildMetadata+breadcrumb "everywhere" (BE-2 board row) | **153/153** product pages contain `BreadcrumbList` (0 missing) | **PASS** |
| 18 | Organization schema in layout | `orgSchema()` rendered once in `app/layout.tsx` | home HTML contains single `"@type":["Organization","LocalBusiness"]` node | **PASS** |
| 19 | FAQPage schema where FAQs render | `faqSchema()` emitted only with visible FAQ block | **25** pages w/ FAQPage (22 categories + /faqs + home + 1 product) — schema⇄visible parity 100% (3 regex "mismatches" were false positives: /faqs H1, headings merely containing "Questions"); matches SEO-VERIFY count 25 | **PASS** |
| 20 | Product schema WITHOUT fabricated ratings | `productSchema()` omits aggregateRating/review/offers by code contract; locked by `tests/seo.test.ts:164` `not.toHaveProperty("aggregateRating")` | 153/153 products have Product JSON-LD; **0** contain `aggregateRating`/`ratingValue` | **PASS** |

**20/20 PASS.** (Brief's checklist is 19 bullets; breadcrumbs UI and BreadcrumbList JSON-LD split into rows 16/17 for the mandated 20-row table.)

## 6. Asset reuse

- **Logo in header + footer:** home HTML renders 2 `<img alt="HM Custom Packaging" … src="/logo.svg">`
  (header `h-9 w-auto md:h-10`; footer inverted) via `DEFAULT_LOGO_URL = '/logo.svg'`
  (`components/patterns/nav-types.ts:41`); file exists at `public/logo.svg`. Known, pre-logged caveat
  (ISSUES #26 + DEVOPS board row): it is a token-faithful RECREATION because the live SVG is unfetchable from
  the sandbox — swap 1:1 with live `logo3.svg` at cutover, path stable, no code change.
- **Product images:** **153/153** `imageUrl` values start with
  `https://www.hmcustompackaging.com/wp-content/uploads/` (programmatic check of all products + enforced by
  content integrity tests). 10-product sample (seed 7): custom-t-shirt-boxes, custom-black-mailer-boxes,
  custom-chinese-food-bags, custom-display-boxes, custom-nail-polish-boxes, custom-noodles-boxes,
  custom-fast-food-boxes, custom-waffles-boxes, custom-detroit-pizza-boxes, custom-business-card-boxes — all
  live-host uploads, and the sampled products' imageUrls appear verbatim in their prerendered HTML.

---

## VERDICT: **COMPLETE**

Nothing from the contract was missed: 22/22 categories, 153/153 products (157−4 merges, slug-set exact),
16/16 posts, 22/22 tracker Pages rows accounted for, 10/10 New Pages, 0 orphan routes, 264/264 redirects
reconciled exactly (incl. middleware `?page_id=3` + PM-approved `/locations/` extra), 212 prerendered pages
with 153/22/16 coverage, 211-URL sitemap, 20/20 audit findings PASS with per-item evidence, logo in
header/footer, 153/153 live image URLs.

**New gaps filed: NONE.** All residual work items found during verification were already logged before this
pass (launch-blocker class, all open in docs/team/ISSUES.md): real logo swap (#26), og:image PNG (#27), real
Trustpilot reviews (#64), verbatim blog-body migration (#48), client street address (#39) & phone hours
(#46), legal sign-off (#47), CSP + durable lead storage at deploy (#53/#54). None affects contract
completeness of the build.
