# MANUAL QA REPORT — hmcustompackaging.com rebuild
**Role:** QA-MANUAL (5-tester manual pass) · **Date:** 2026-06-12 · **Wave:** 3

## Method
- Workspace: project copied to `/tmp/qa-manual` (node_modules symlinked). Own `next build` was OOM/contention-killed mid-compile twice (QA-AUTO building concurrently on the shared sandbox), so evidence was taken from the **fresh green build of the identical tree** (`.next` BUILD_ID `dWH-_3qHVhNy4737HeRg3`, built 17:57 by QA-AUTO, 212 prerendered HTML files; freshness verified — zero source files newer than BUILD_ID except `QuoteForm.tsx`, see F-02) copied into `/tmp/qa-manual/.next`.
- Static review: grep/inspection of prerendered `.next/server/app/**.html` (all 212 files for the sweeps; per-page evidence below).
- Dynamic review: `next start -p 3201..3203` in `/tmp/qa-manual` (self-contained spawn → curl → kill), for 404 status, `/api/search/`, `/get-custom-quote/` SSR markup, `/products/?q=`, redirects, middleware.
- Source cross-reads for markup that only mounts client-side (drawer, lightbox, toasts).

## Sweeps (all 212 prerendered pages)
| Sweep | Result |
|---|---|
| `<h1>` count per page | **exactly 1 on every page** (0 violations) |
| `aggregateRating` in any HTML | **0 files** |
| `>undefined<` rendered | **0 files** |
| FAQPage JSON-LD without a visible FAQ block / >1 per page | **0 violations** (one false positive traced to a custom block title on /faqs — schema 8 Q&A = 8 visible items) |
| Titles ≤60 + `… | HM Custom Packaging` pattern / descriptions ≤160 | **22 categories + 153 products + 16 posts + 19 static pages = 0 violations** |
| Canonicals | all absolute `https://www.hmcustompackaging.com/...` **trailing-slash** |
| `not food-grade` contradiction | **0 occurrences** anywhere |

---

## Tester A — Home & navigation (14/14 PASS)
Evidence file: `.next/server/app/index.html`

| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | T1 section rhythm per DESIGN_SPEC §2 | PASS | Hero → TrustBar (`We accept: Visa · Mastercard…`) → CategoryTiles (`Shop by categories`) → Featured tabs → ProcessSteps (`How it works`) → ImageText ×2 (`Sustainability`) → StatsRow (dark) → ReviewWall → Comparison teaser → Blog teaser → FAQ → CTABand; alternation holds, exactly one `.dark-section` band + footer |
| A2 | Single H1 | PASS | `<h1 class="max-w-[16ch]">Custom Packaging Boxes That Build Your Brand</h1>` (count=1) |
| A3 | Promo bar fully linked w/ code | PASS | `<a class="flex min-h-10 …" href="/get-custom-quote/">` wrapping text + `WELCOME10` badge (Link normalized to trailing slash — zero hop) |
| A4 | Header menus markup | PASS | 3 triggers `aria-haspopup="true" aria-expanded aria-controls="mega-{industry,material,style}"` ↔ matching panel ids; burger `aria-haspopup="dialog" aria-controls="mobile-nav"`; `.menu-pop` closed state is `visibility:hidden` (unfocusable) |
| A5 | Search form GET /products/ + visible label | PASS | `<form role="search" … action="/products/" method="get">` + `<label for="header-search-input">Search products</label>` |
| A6 | Footer year auto = 2026 | PASS | `© <!-- -->2026` (`new Date().getFullYear()`) |
| A7 | Footer Reviews + Privacy links | PASS | `href="/reviews/"`, `href="/privacy-policy/"` (Quick Links + legal bar), `/sitemap/`, `/terms-conditions/` |
| A8 | No fake security badges | PASS | payments are plain text `We accept: Visa · Mastercard · Amex · Discover · PayPal`; grep norton/mcafee/ssl-secure/trust-badge = 0 |
| A9 | Phone display + href everywhere | PASS | `+1 (213) 692-6437` ×8, `tel:+12136926437` ×7 on home (header ghost, drawer, sticky CTA, footer, CTABand) — all from globals.json |
| A10 | data-js script in head | PASS | `document.documentElement.setAttribute('data-js','')` before body content |
| A11 | Skip link + #main | PASS | `class="skip-link"` first in body, `<main id="main" class="pb-24 md:pb-0">` |
| A12 | Organization schema once | PASS | `"@type":["Organization","LocalBusiness"]` ×1 + FAQPage ×1 (4 ld+json scripts incl. breadcrumb-free home) |
| A13 | Sheen budget | PASS | 2 `.sheen` total — hero primary + CTABand primary (opposite page ends, ≤1 per viewport) |
| A14 | aria-expanded inventory | PASS | 11 on home = 3 mega + search + burger + 6 FAQ triggers, all `"false"` at SSR |

## Tester B — Category T2 ×6 (54/54 PASS)
Files: `custom-bakery-boxes custom-pizza-boxes mylar-bags business-card custom-retail-boxes custom-display-boxes .html`

| Category | h1 | intro lead | grid (in-cat/foreign) | disclaimer note | FAQ blocks | crumbs | CTA band | undefined |
|---|---|---|---|---|---|---|---|---|
| custom-bakery-boxes | 1 `Custom Bakery Boxes` | ✓ "Food-safe custom bakery boxes…" | 12/0 | 0 (correct) | 1 | ✓ | ✓ | 0 |
| custom-pizza-boxes | 1 `Custom Pizza Boxes` | ✓ | 7/0 | 0 (correct) | 1 | ✓ | ✓ | 0 |
| mylar-bags | 1 `Custom Mylar Bags` | ✓ | 7/0 | **1 role="note"** ✓ | 1 | ✓ | ✓ | 0 |
| business-card | 1 `Custom Business Cards` | ✓ | 2/0 | 0 (correct) | 1 | ✓ | ✓ | 0 |
| custom-retail-boxes | 1 `Custom Retail Boxes` | ✓ | 11/0 | 0 (correct) | 1 | ✓ | ✓ | 0 |
| custom-display-boxes | 1 `Custom Display Boxes` | ✓ | 7/0 | 0 (correct) | 1 | ✓ | ✓ | 0 |

- Disclaimer scope verified site-wide: `role="note"` appears on **exactly 19 pages** = 3 regulated categories (mylar-bags, custom-cbd-boxes, custom-tobacco-packaging) + their 16 products. Zero on non-regulated pages. (The separate one-line footer disclaimer is sitewide by design — FE-2 additive legal line, not the regulated banner.)
- Every product link in every sampled grid belongs to that category (Node cross-check vs products.json; foreign=0 across all 6).

## Tester C — Product T3 ×10 (80/80 PASS)
Slugs incl. all four merged targets: custom-hang-tags, custom-drawer-boxes, custom-printed-seed-boxes, custom-pre-roll-boxes + custom-pizza-boxes, custom-soap-boxes, custom-cigarette-boxes, standup-mylar-bags, custom-black-mailer-boxes, custom-jewelry-boxes.

| Check | Result |
|---|---|
| Single H1 = product name | 10/10 (`h1=1(=name)` for every slug) |
| Image alt = product name | 10/10 (`alt="Custom Hang Tags"` etc.; GalleryLightbox appends `— image i of n` only for multi-image) |
| SKU badge when sku present | ✓ pizza `SKU <!-- -->BB-HMC-1218`, soap `BB-HMC-1272` (initial misses were React text-node comments, not bugs); 13 SKU products in content, badge + JSON-LD `"sku"` both render |
| Quote CTA carries `?product=` | 10/10 `/get-custom-quote/?product=<slug>` |
| Related products same category, ≠ self | 10/10 (3–4 related each, 0 foreign-category, self excluded) |
| Product JSON-LD without aggregateRating/review/offers | 10/10 (and 0 in all 212 files) |
| Disclaimer on regulated products | pre-roll/cigarette/standup-mylar `note=1`; others 0 — exact |
| Breadcrumbs + BreadcrumbList | 10/10 |
| custom-soap-boxes captured FAQs | ✓ only product with a visible FAQ block + matching FAQPage LD |

## Tester D — Forms & utility (15/15 PASS, 1 fix-pending note)
Dynamic evidence via `next start` + curl:

| Check | Result | Evidence |
|---|---|---|
| Quote page 2-step markup | PASS | progress `<ol>` with `aria-current="step"`, dots/labels for `Box specs` / `Contact & artwork`, both steps mounted in one form |
| Labels visible | PASS | 16 `<label for="qf-…">` in SSR markup (Input/Select/Textarea primitives render visible labels) |
| Honeypot present but hidden | PASS | `name="website"` inside `aria-hidden="true" class="absolute -left-[9999px] … h-px w-px overflow-hidden"`, `tabindex=-1` |
| File counter inside dropzone | PASS | `0 of 5 files` (aria-live polite) inside the dashed dropzone |
| `?product=` preselect | PASS | `Requesting a quote for` + hidden `value="custom-pizza-boxes"` + Select default |
| No StickyMobileCTA on quote page | PASS | `aria-label="Quick actions"` = 0 on /get-custom-quote/ |
| Contact form labels | PASS | LeadForm renders ui primitives w/ visible labels + honeypot (`HONEYPOT_FIELD`), inline `role="alert"` error |
| Thank-you noindex | PASS | `<meta name="robots" content="noindex, nofollow">`; excluded from sitemap.xml (211 locs, 0 thank-you); `Disallow: /thank-you/` in robots.txt |
| 404 real + branded | PASS | junk URL → HTTP **404** with `Page not found` h1, labeled search form (GET /products/), 4 CategoryTiles, quote/home CTAs |
| /sitemap/ HTML page | PASS | lists pages + 22 categories + **153** products + **16** posts; `0` links to /cart /checkout /my-account /sign-in /thank-you /case-studies |
| /api/search/?q=mylar | PASS | JSON `count:8`, trailing-slash hrefs, mylar startsWith hits first |
| /products/?q= filter | PASS | `?q=mylar` renders 6 product cards; `?q=zzzqqq` → "No products match that search." |
| Redirects spot-check | PASS | `/locations/`→308 `/custom-pizza-boxes/` · `/cart/`,`/checkout/`→308 `/get-custom-quote/` · `/my-account/`→308 `/` · `/locations/custom-pizza-boxes-in-chicago/`→308 · `/?page_id=3`→308 `/privacy-policy/` (middleware) |
| robots.txt | PASS | allow all, disallow `/api/` + `/thank-you/` only, sitemap pointer |
| sitemap.xml | PASS | 211 `<loc>`, absolute www trailing-slash, /business-card included |

Note: ISSUES #21 (quantity min 25) and #42 (`data-quote-form`) were fixed in `components/patterns/QuoteForm.tsx` AFTER the 17:57 build (verified in source: `MIN_QUANTITY = 25`, `data-quote-form=""` at the form root) — needs the next rebuild to land in client bundles (F-02).

## Tester E — Content pages (all PASS, 1 S3 finding)
| Check | Result |
|---|---|
| /reviews placeholder note visible | PASS — "Reviews collected via Trustpilot — verification in progress." renders; reviews.json all `source:"placeholder", verified:false`; no Trustpilot/Verified badges on placeholder cards |
| No fabricated aggregate | PASS — `aggregateRating` 0, no "x.y from N reviews" patterns, hero rating strip omitted |
| Titles/meta ≤60/≤160 (head inspected) | PASS for all 19 statics (max T=47, max D=141) — see sweep |
| Legal pages food-grade | PASS — "Food-safe material options are available on request" (terms §6); `not food-grade` = 0 sitewide |
| Blog post Article schema | PASS 16/16 — Article LD with Organization author/publisher, datePublished, mainEntityOfPage |
| /case-studies canonical → /portfolio/ | PASS — `<link rel="canonical" href="https://www.hmcustompackaging.com/portfolio/">` in built HTML; excluded from sitemaps |
| /how-it-works 6 steps, SLA once | PASS — SLA verbatim at step 4 only |
| **Finding F-01** | /reviews double-wraps the section-owning ReviewWall (see findings) |

## Mobile pass (PASS)
- Drawer: burger `aria-controls="mobile-nav"`; row recipe `flex min-h-[44px] w-full …` on all drawer rows + group triggers (source `MobileNavDrawer.tsx:39,41,149`); FE-1 Drawer shell provides dialog semantics/trap/Esc/scroll-lock.
- StickyMobileCTA in rendered home: `<nav aria-label="Quick actions" class="fixed inset-x-0 bottom-0 … md:hidden …">` with Call (secondary, tel from globals) + Get a Quote, h-11 (44px) buttons, safe-area padding; absent on /get-custom-quote.
- Hero mobile type scale: tokens.css `--text-h1-mobile: 32px` (desktop 44) swapping at 768px per spec; hero CTAs `w-full min-[480px]:w-auto` (×2 in markup).
- Touch-target classes ≥44px verified on accordion triggers (`min-h-[44px] w-full`), icon buttons (`h-11 w-11`), chips (`min-h-[44px]`).

## Tick-washing audit — ISSUES ticked items re-verified in rendered output
| Ticked item | Verified | Evidence |
|---|---|---|
| #2/#5 /locations/ redirect, 264 total | TRUE | lib/redirects.ts: 264 `{ source:` entries incl. `'/locations/' → '/custom-pizza-boxes/'`; live 308 confirmed on server |
| #3/#6 HTML sitemap AT /sitemap/ | TRUE | sitemap.html rendered; /sitemap-page does not exist; exclusions hold |
| #4 trailingSlash: true | TRUE | next.config.ts:21 + every canonical/internal link trailing-slash |
| #7 thank-you noindex + exclusions | TRUE | meta verified; sitemap 211/0; robots disallow |
| #8 claims single-source | TRUE | SLA/MOQ/shipping/phone strings in HTML match globals.json verbatim; no banned variants ("2-3 weeks", "+1 (213) 6926-437", worldwide-shipping) anywhere |
| #9 regulated disclaimer | TRUE | exactly 3 categories + 16 products carry role="note" banner |
| #10 trailing-slash canonicals | TRUE | sweep above |
| #11 self-hosted og/logo | TRUE | public/og-default.svg + public/logo.svg exist; lib/seo.ts:52-53 point at SITE_URL |
| #12 case-studies canonical | TRUE | built HTML |
| #16 data-js script | TRUE | in head before body paint |
| #18 eslint config | TRUE | eslint.config.mjs at root |
| #19 TS pin | TRUE | package.json `typescript ^5.9.3`, `@types/node ^22` |
| #24 build green | TRUE | BUILD_ID 17:57, 212 HTML prerendered |
| #32 ToastProvider wired | TRUE | app/layout.tsx wraps body content |
| #34/#38 shim deleted | TRUE | types/ dir gone; repo greps clean |
**No tick-washing found.**

## Findings (S-graded)
| ID | Sev | Where | Finding + evidence | Owner |
|---|---|---|---|---|
| F-01 | **S3** | app/reviews/page.tsx:41–45 | Section-owning `ReviewWall` is wrapped in an extra `<section class="section bg-paper-50"><div class="container-hm">` → rendered HTML contains nested `…container-hm"><section class="section bg-paper-50">` = doubled vertical padding + nested container on /reviews (same bug class FE-3 already fixed on /faqs). Fix: render `<ReviewWall reviews={reviews} trustpilotUrl={globals.social.trustpilot} />` bare (also restores the linked note + matches home usage). | QA-AUTO |
| F-02 | **S3** | components/patterns/QuoteForm.tsx | ISSUES #21 + #42 fixes (MIN_QUANTITY=25, `data-quote-form=""`) landed AFTER the verified build — source is correct; client bundle of the evidence build predates it. Re-run `next build` (CI) and tick #21/#42. | QA-AUTO/DEVOPS |
| F-03 | **S3** | content/globals.json promo.href | `"/get-custom-quote"` lacks the trailing slash used everywhere else. Harmless today (next/link emits `href="/get-custom-quote/"` in rendered HTML) but any non-Link consumer (emails, JSON-LD, RSS) would 308-hop. Normalize to `"/get-custom-quote/"`. | DATA-ENG/QA-AUTO |
| F-04 | **S3 (sign-off)** | ISSUES #36 | QuoteForm surfaces server failures in its aria-live, focus-managed error summary instead of a Toast. **QA-MANUAL verdict: ACCEPTED** — single live region is equal-or-better than spec's Toast for SR users; ToastProvider stays wired for future use. Ticked in ISSUES. | closed |
| F-05 | **Obs.** | ReviewWall note wording | "Reviews collected via Trustpilot — verification in progress." is the spec-prescribed note, but entries are invented placeholders (`source:"placeholder"`) — the wording implies Trustpilot provenance that doesn't exist yet. Already a client launch-blocker (real reviews import); no code change requested. | PM/client |
| F-06 | **Obs.** | Footer (all pages) | globals.complianceDisclaimer renders sitewide in the footer bottom bar (FE-2, additive). Page-level regulated banner is correctly scoped; flagging only so nobody mistakes the footer line for the regulated-page requirement. | none |

## Verdict
**PASS with 3 minor (S3) actions.** 0 S1, 0 S2. Totals: Tester A 14/14 · B 54/54 · C 80/80 · D 15/15 · E 8 checks all pass (1 S3 layout bug) · Mobile 4/4 · Sweeps 7/7 clean across 212 pages.
