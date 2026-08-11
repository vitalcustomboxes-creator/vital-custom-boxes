# SEO VERIFICATION — hmcustompackaging.com rebuild
**Owner:** SEO-VERIFY · **Date:** 2026-06-12 · **Verdict: PASS (6/6 checks) — 2 minor S3 observations filed in ISSUES**

## Method & evidence source
- Verified against the production build of the current source: **BUILD_ID `v9DIxV5dn2SjAOmxYhaxD`** (built 2026-06-12 17:39 UTC). Freshness proven: `find app components lib content styles middleware.ts next.config.ts -newer .next/BUILD_ID` → **zero source files newer than the build**.
- Project code untouched. All analysis ran on an isolated copy at `/tmp/qa-seo` (source via `tar` copy + `ln -s node_modules`, build artifacts copied from the repo's `.next`, cache excluded). Two attempts at a from-scratch rebuild in `/tmp/qa-seo` were killed mid-compile by the sandbox process reaper (~2–5 min ceiling on detached processes); since the repo's `.next` is provably a build of the exact current source, it was adopted as the evidence base.
- Live behavior tested with one-shot `next start` servers (ports 3119/3121) against that build: boot → curl assertions → kill, all inside one shell call.
- Static analysis: Node scripts over all **212 prerendered HTML files** in `.next/server/app` (+ `sitemap.xml.body` / `robots.txt.body`), regex + JSON-LD parsing, HTML entities decoded before length/equality checks.
- **Post-verification rebuild note:** while this audit ran, QA-AUTO landed two non-SEO edits (`components/patterns/QuoteForm.tsx` client bundle fix, `next.config.ts` `poweredByHeader: false`) and the repo was rebuilt (**BUILD `YEbYQjpnJRD6Co8CY2x1Y`**, 18:08 UTC). Drift check against the new build: `app/`, `lib/`, `content/`, `middleware.ts` unchanged since the verified build; new build's sitemap = same **211** `<loc>`; robots.txt.body **byte-identical**; canonical spot-diff on 5 representative pages (home, category, product, case-studies, thank-you) identical; routes-manifest redirects still **266** (264 + 2 Next-internal). All conclusions below transfer to the current build unchanged.

---

## 1. Redirects — PASS

**Static counts (`lib/redirects.ts`, generated file):**

| Check | Expected | Actual |
|---|---:|---:|
| `grep -c ", permanent: true },"` | 264 | **264** |
| `source: '/locations/` (221 doorways + 1 hub) | 222 | **222** |
| `source: '/business-card/` | 31 | **31** |
| `source: '/products/` (merges) | 4 | **4** |
| utility (`/register/ /sign-in/ /user-home/ /my-account/ /order-completed/ /cart/ /checkout/`) | 7 | **7** |
| duplicate sources (`sort \| uniq -d`) | 0 | **0** |
| `.next/routes-manifest.json` redirects | 264 + Next internals | **266** (= 264 ours, all 308 + 2 Next-internal trailing-slash normalizers) |

**Live tests (one-shot `next start`, port 3119): 15 samples across all 5 groups — 15/15 PASS.**
Assertions per URL: status **308** + exact `location` header + target returns **200** + target emits **no further redirect** (zero chains).

| # | Group | Source | Location header | Target |
|---|---|---|---|---|
| 1 | G1 locations | `/locations/custom-frozen-pizza-boxes-in-dallas/` | 308 → `/custom-pizza-boxes/` | 200, 0 hops |
| 2 | G1 | `/locations/custom-detroit-pizza-boxes-in-chicago/` | 308 → `/products/custom-detroit-pizza-boxes/` | 200, 0 hops |
| 3 | G1 | `/locations/printed-slice-pizza-boxes-in-new-york-city/` | 308 → `/products/custom-slice-pizza-boxes/` | 200, 0 hops |
| 4 | G1 | `/locations/custom-disposable-pizza-boxes-in-jacksonville/` | 308 → `/products/custom-disposable-pizza-boxes/` | 200, 0 hops |
| 5 | G1 | `/locations/custom-holographic-pizza-boxes-wholesale-in-san-francisco/` | 308 → `/custom-pizza-boxes/` | 200, 0 hops |
| 6 | G1 | `/locations/custom-kraft-pizza-boxes-in-phoenix/` | 308 → `/products/custom-kraft-pizza-boxes/` | 200, 0 hops |
| 7 | G1 | `/locations/custom-luxury-pizza-boxes-in-san-antonio/` | 308 → `/products/custom-luxury-pizza-boxes/` | 200, 0 hops |
| 8 | G2 business-card | `/business-card/custom-business-cards-in-tampa-2/` | 308 → `/business-card/` | 200, 0 hops |
| 9 | G2 | `/business-card/custom-business-cards-in-washington-d-c/` | 308 → `/business-card/` | 200, 0 hops |
| 10 | G2 | `/business-card/custom-business-cards-in-salt-lake-city/` | 308 → `/business-card/` | 200, 0 hops |
| 11 | G3 merges | `/products/custom-hangtags/` | 308 → `/products/custom-hang-tags/` | 200, 0 hops |
| 12 | G3 | `/products/custom-pre-rolls-joints-boxes/` | 308 → `/products/custom-pre-roll-boxes/` | 200, 0 hops |
| 13 | G4 utility | `/cart/` | 308 → `/get-custom-quote/` | 200, 0 hops |
| 14 | G4 | `/register/` | 308 → `/` | 200, 0 hops |
| 15 | G5 hub | `/locations/` | 308 → `/custom-pizza-boxes/` | 200, 0 hops |

**Middleware:** `/?page_id=3` → **308** `location: /privacy-policy/` → 200. PASS.
**Sanity:** `/` → 200; unknown `/locations/nope/` → real **404** (no soft-404 redirect); `/thank-you/` → 200 (noindex page, see §2).

## 2. sitemap.xml + robots.txt — PASS (ISSUES #14 SEO-VERIFY portion confirmed)

Built output (`.next/server/app/sitemap.xml.body`):

| Check | Expected | Actual |
|---|---:|---:|
| Total `<loc>` entries | 211 | **211** |
| Composition | 3 hubs (`/`, `/products/`, `/blog/`) + 17 static + 22 categories + 153 products + 16 posts | **3 + 17 + 22 + 153 + 16 = 211** |
| Category slugs present | 22/22 | **22/22** (none missing) |
| **`/business-card/` present** | yes | **yes — 1 exact entry** (ISSUES #14 evidence) |
| `/thank-you/` entries | 0 | **0** |
| `/case-studies/` entries | 0 | **0** (canonicalized to `/portfolio/`) |
| `/locations/...` entries | 0 | **0** |
| Entries matching any of the 264 redirect sources | 0 | **0** |
| Entries not `https://www.hmcustompackaging.com/...` | 0 | **0** |
| Entries without trailing slash | 0 | **0** |
| Duplicate URLs | 0 | **0** |

Note: the 17 static routes include `/sitemap/` (PM decision: HTML sitemap keeps the live URL; `/sitemap-page` does not exist) — supersedes the older `/sitemap-page/` line in TECH_SEO §3's table.

**robots.txt** (`.next/server/app/robots.txt.body`, byte-for-byte):
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /thank-you/

Sitemap: https://www.hmcustompackaging.com/sitemap.xml
```
`/thank-you/` disallowed ✓ (and `noindex, nofollow` meta in its HTML — belt & braces) · sitemap referenced ✓ · redirect sources (`/sign-in/`, `/cart/`, `/locations/...`) correctly NOT disallowed so Google can process the 308s ✓.

## 3. Per-template head audit — PASS (2 minor observations)

**Full corpus (all 212 prerendered pages), not just a sample:**

| Assertion | Result |
|---|---|
| Exactly one `<title>`, ≤60 chars (entity-decoded) | **212/212** (max observed 58) |
| Meta description present, ≤160 chars | **212/212** (404 page excluded, see obs. 2) |
| Canonical = `https://www.hmcustompackaging.com` + own path, trailing slash | **212/212** (sole intended exception: `/case-studies/` → canonical `/portfolio/` per TECH_SEO §2.5 — verified) |
| Exactly one `<h1>` | **212/212** |
| `og:title` + `og:description` + `og:image` + `og:url` + `twitter:card="summary_large_image"` | **212/212** |
| Organization+LocalBusiness JSON-LD exactly **once** per page (root layout) | **212/212** |
| BreadcrumbList exactly once on every inner page (excl. `/`, `/thank-you/`, 404) | **all inner pages** |
| FAQPage schema | **25 pages**, exactly 1 each: 22 categories + `/` + `/faqs/` + `/products/custom-soap-boxes/` (the one product with captured FAQs). Schema ⇄ visible parity: every schema question string appears in visible body; **0** pages with a visible FAQ block but no schema (footer "FAQs" nav link excluded as false positive) |
| Product schema | **153/153 product pages, exactly 1 each; 0 elsewhere; 0 with `aggregateRating`, 0 with `review`, 0 with `offers`** |
| Article schema | **16/16 blog posts, exactly 1 each; 0 elsewhere** |
| Duplicate meta descriptions site-wide | **0** |
| Duplicate titles site-wide | **2 pairs** (observation 1 below) |

**22-category diff vs `docs/seo/KEYWORD_META_MAP.md` §3 (title + meta + H1, exact string compare after entity decode): 22/22 MATCH.**

| Slug | Title len | Meta len | H1 | Match |
|---|---:|---:|---|---|
| custom-apparel-boxes | 52 | 130 | Custom Apparel Boxes | ✓ |
| custom-bakery-boxes | 51 | 147 | Custom Bakery Boxes | ✓ |
| custom-candle-boxes | 51 | 129 | Custom Candle Boxes | ✓ |
| custom-cbd-boxes | 48 | 142 | Custom CBD Boxes | ✓ |
| custom-cosmetics-boxes | 54 | 126 | Custom Cosmetics Boxes | ✓ |
| custom-events-packaging | 58 | 140 | Custom Events Packaging | ✓ |
| custom-food-boxes | 49 | 132 | Custom Food Boxes | ✓ |
| custom-gift-boxes | 49 | 135 | Custom Gift Boxes | ✓ |
| custom-pizza-boxes | 50 | 141 | Custom Pizza Boxes | ✓ |
| custom-takeout-boxes | 52 | 136 | Custom Takeout Boxes | ✓ |
| custom-tobacco-packaging | 52 | 133 | Custom Tobacco Packaging | ✓ |
| custom-toy-boxes | 48 | 137 | Custom Toy Boxes | ✓ |
| custom-boxes | 54 | 136 | Custom Boxes | ✓ |
| business-card | 51 | 144 | Custom Business Cards | ✓ |
| mylar-bags | 49 | 145 | Custom Mylar Bags | ✓ |
| custom-printed-bags | 51 | 136 | Custom Printed Bags | ✓ |
| custom-rigid-boxes | 50 | 137 | Custom Rigid Boxes | ✓ |
| custom-display-boxes | 52 | 139 | Custom Display Boxes | ✓ |
| custom-insert-boxes | 51 | 137 | Custom Insert Boxes | ✓ |
| custom-mailer-boxes | 51 | 142 | Custom Mailer Boxes | ✓ |
| custom-product-packaging-boxes | 52 | 142 | Custom Product Packaging Boxes | ✓ |
| custom-retail-boxes | 51 | 130 | Custom Retail Boxes | ✓ |

**20+-page template sample inspected in detail** (home, 6 categories, 4 products incl. regulated `custom-weed-mylar-bags`, blog hub + 2 posts, `/faqs/`, `/portfolio/`, `/case-studies/`, `/thank-you/`, `/about-us/`, `/contact/`, `/sitemap/`, 404): canonicals self+slash; og:image = live hero/product URL on category/product/post pages and self-hosted `https://www.hmcustompackaging.com/og-default.svg` on 21 static pages (`public/og-default.svg` exists, 2130 bytes; SVG→PNG swap pre-launch already logged by DEVOPS in ISSUES); `/thank-you/` emits `robots: noindex, nofollow`; `/case-studies/` canonical → `/portfolio/`.

**Observations (S3, filed in ISSUES):**
1. **2 duplicate title pairs** — a category and its same-named product share identical titles: `/custom-display-boxes/` ↔ `/products/custom-display-boxes/` and `/custom-pizza-boxes/` ↔ `/products/custom-pizza-boxes/` (both "… Wholesale | HM Custom Packaging"). CONTENT_GUIDELINES §11 requires titles unique site-wide. Cosmetic; canonicals/URLs differ.
2. **404 page inherits home metadata** — `_not-found.html` carries home's meta description and `canonical: …/`/og:url via root-layout metadata inheritance. KEYWORD_META_MAP §4 says 404 should emit no meta description. Harmless (real HTTP 404 verified + `robots: noindex`), but trivially fixable.

## 4. Internal linking — PASS

**A. Category → products** (unique `/products/<slug>/` links inside `<main>`, header/footer excluded):

| Category | Products in content | Own products linked |
|---|---:|---:|
| custom-bakery-boxes | 12 | **12/12** |
| custom-pizza-boxes | 7 | **7/7** |
| mylar-bags | 7 | **7/7** |
| business-card | 2 | **2/2** |
| custom-mailer-boxes | 4 | **4/4** |
| custom-boxes | 11 | **11/11** |

**B. Product → related + breadcrumbs** (5 sampled): `custom-cake-boxes`, `custom-detroit-pizza-boxes`, `custom-weed-mylar-bags`, `custom-hang-tags`, `custom-soap-boxes` — each has exactly **4 related-product links**, a contextual link **up to its parent category** ("See every product in …"), and `aria-label="Breadcrumb"` nav with Home → Category → Product.

**C. Href hygiene — full corpus (11,962 `<a>` tags across 212 pages; 9,251 root-relative internal):**

| Pattern | Hits |
|---|---:|
| `href="http://…"` (any) | **0** |
| Absolute self-host `<a>` anchors (hard-coded `https://www.hmcustompackaging.com/...`) | **0** (the 1-per-page absolute URL is the `<link rel="canonical">` element — expected) |
| Internal href missing trailing slash (`href="/[^".?#]*[^/".?#]"`) | **0** |
| Internal href with slash-less path before `?` query | **0** |
| `href="#"` placeholder links | **0** |

False-positive exclusions documented: asset/file hrefs (`/og-default.svg`, `/_next/...`), pure-fragment (`#main` skip link), `mailto:`/`tel:`, and query forms like `/get-custom-quote/?product=…` (path part keeps its slash) were excluded by pattern design.

## 5. Banned-claims sweep — PASS (zero hits)

Ripgrep over **all 212 prerendered HTML files**, case-insensitive:

| Pattern | Hits |
|---|---:|
| `no minimum` | **0** |
| `worldwide shipping` | **0** |
| `2-3 weeks` | **0** |
| `10-15 business days` | **0** |
| `4-8 days` | **0** |
| `6926-437` (mis-grouped phone) | **0** |
| `078-2376` (broken tel) | **0** |
| `Luxuty` (live typo) | **0** |
| Bonus: `3-7 working days`, `7 to 15 business days`, `free worldwide`, `over $100`, `HM Custom Boxes` | **0** each |

Scanner positive-control: `HM Custom Packaging` matches in every file scanned (corpus was actually searched).

## 6. Live-equity parity — PASS

All **22 live category URLs** requested against the running build: **22/22 return HTTP 200, zero 404s** (custom-apparel-boxes, custom-bakery-boxes, custom-candle-boxes, custom-cbd-boxes, custom-cosmetics-boxes, custom-events-packaging, custom-food-boxes, custom-gift-boxes, custom-pizza-boxes, custom-takeout-boxes, custom-tobacco-packaging, custom-toy-boxes, custom-boxes, business-card, mylar-bags, custom-printed-bags, custom-rigid-boxes, custom-display-boxes, custom-insert-boxes, custom-mailer-boxes, custom-product-packaging-boxes, custom-retail-boxes).
Spot 200s: `/sitemap.xml`, `/sitemap/` (HTML sitemap at live URL), `/products/custom-cake-boxes/`, `/blog/`, `/portfolio/`, `/case-studies/`.
Content counts: categories.json = **22**, products.json = **153**, posts.json = **16** (matches brief).

---

## Verdict

| # | Check | Result |
|---|---|---|
| 1 | Redirects (264 static + middleware; 15 live samples, no chains) | **PASS** |
| 2 | sitemap.xml (211 exact, business-card in, thank-you/case-studies out) + robots.txt | **PASS** |
| 3 | Head audit (canonicals, titles ≤60, metas ≤160, single H1, OG/Twitter, JSON-LD discipline; 22/22 category meta match) | **PASS** (2 × S3 observations) |
| 4 | Internal linking (category→products 100%, product→related+breadcrumbs, zero href violations) | **PASS** |
| 5 | Banned claims (8 patterns + 5 bonus, all 212 pages) | **PASS — 0 hits** |
| 6 | Live parity (22/22 category URLs are 200 routes) | **PASS** |

**Overall: PASS.** ISSUES #14 (SEO-VERIFY portion) confirmed with evidence (§2). Two S3 cosmetic findings filed for QA-AUTO: duplicate title pairs (category vs same-named product ×2) and 404-page metadata inheritance.
