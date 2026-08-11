# BE-1 report — core routes (layout, home, category, products hub, product) — 2026-06-12

## Scope delivered
| File | Replaces | What it is |
|---|---|---|
| `app/layout.tsx` | ARCHITECT placeholder | Root layout: data-js script, fonts fallback, metadataBase + default metadata, viewport, skip link, orgSchema JSON-LD, PromoBar/Header/Footer/StickyMobileCTA/RevealProvider/ToastProvider, `<main id="main" class="pb-24 md:pb-0">` |
| `app/page.tsx` | ARCHITECT placeholder | T1 Home — full DESIGN_SPEC §2 T1 rhythm (12 sections, see below) |
| `app/[category]/page.tsx` | new | T2 — 22 SSG category routes (`generateStaticParams` + `dynamicParams=false` + `notFound()` guard) |
| `app/products/page.tsx` | new | Products hub — 22 category sections × full product grids + no-JS `?q=` search (GET form, visible label) |
| `app/products/[slug]/page.tsx` | new | T3 — 153 SSG product routes |

## Verification (all run against the FINAL tree)
- `npx tsc --noEmit` → **0 errors repo-wide** (re-verified after every parallel-agent contract change I absorbed).
- `npx next build` → **PASS**: `/` + 22 `/[category]` + 153 `/products/[slug]` prerendered (SSG); `/products` is `ƒ` dynamic (searchParams — intentional, see Decisions); first-load JS 118–142 kB per route (≤150 kB budget); middleware 34.2 kB.
- Prerendered-HTML spot checks (`.next/server/app/*.html`):
  - exactly **one `<h1>`** on `/`, `/custom-bakery-boxes/`, `/products/custom-pizza-boxes/`, `/products/custom-soap-boxes/`, `/mylar-bags/`;
  - **one FAQPage** JSON-LD only where a FAQ block renders (home, categories, `custom-soap-boxes` — the only product with captured FAQs); **zero** on products without FAQs;
  - **BreadcrumbList** on every inner page sampled; canonical = `https://www.hmcustompackaging.com/...` trailing-slash form;
  - **Product JSON-LD with NO aggregateRating/review/offers** (grep `aggregateRating` = 0);
  - compliance disclaimer banner present on `/mylar-bags/` and `/products/custom-cigarette-boxes/` (regulated), absent from the bakery page body (footer's sitewide legal line is FE-2's, additive);
  - titles match `… | HM Custom Packaging` ≤60; `data-js` script present in `<head>` (see Decisions #2); skip link + `#main` present; Organization+LocalBusiness schema once.

## Key decisions (please read before QA)
1. **Fonts (S3 ISSUE logged):** `fonts.googleapis.com` is unreachable from the build sandbox (egress is npm-allowlisted — `curl` 000; npm registry 200), so `next/font/google` would hard-fail every build. The layout therefore ships WITHOUT next/font; `styles/tokens.css` already falls back (`var(--font-poppins, 'Poppins', …)`). The exact production snippet (DESIGN_SPEC §0.2, correct `--font-poppins`/`--font-manrope` variable names) is preserved in the `app/layout.tsx` header comment — restore at cutover where network exists.
2. **data-js placement:** the script is authored as the first child of an explicit `<head>` in the layout (spec §0.3). React 19/Next 15 merge it into the document head AFTER the framework-hoisted charset/viewport/CSS/preload tags — position 0 is not achievable in App Router. Functionally equivalent: it still executes during head parsing, i.e. **before any body content can paint**, which is all the reveal CSS needs. Verified in prerendered HTML (one `<head>`, script before all JS chunks; the second grep hit is just the RSC flight payload).
3. **MobileNavDrawer is NOT in the layout:** FE-2's drawer is controlled (`open`/`onClose`) and `Header` renders it internally — rendering it as a layout sibling per the original plan would duplicate it. Layout renders PromoBar/Header/Footer/StickyMobileCTA/RevealProvider (+ ToastProvider per FE-1's ISSUE).
4. **Hero rating strip:** `HeroProps.rating` requires REAL numeric value/count; none exists yet, so it is omitted (audit: nothing fabricated). The real Trustpilot profile link renders inside ReviewWall's verification note instead (`trustpilotUrl={globals.social.trustpilot}` — link verified in built HTML). When verified Trustpilot data lands, pass `rating={{value, count, href: globals.social.trustpilot}}` to `<Hero>`.
5. **Home collections tabs:** Trending / Top Picks / New Arrivals are deterministic slices of the real catalog by category *type* (Industry / Style / Material+General, 12 each) — merchandising labels, no fabricated popularity data.
6. **StatsRow figures:** real content counts (153 products, 22 categories) + numbers PARSED from `globals.moq`/`globals.sla` at render (regex; a failed parse drops the stat) — single-source rule holds even if globals.json changes.
7. **/products hub is dynamic (SSR)** because it reads `searchParams` for the `?q=` filter. Filter uses BE-3's canonical `lib/search` ranking over a products-only corpus, mapped back to full Product objects for ProductCard grids. All detail routes remain static.
8. **T2 sibling categories** render as CategoryTile grid (4, same-type first); **T3 related products** use FE-3's `blocks/RelatedProducts` fed by `product.related` (same-category only) topped up to 4 from category siblings.
9. **Section ownership (FINAL, after FE-3's last revision):** Hero, TrustBar, CTABand, FAQAccordion (`section` + container, bg via `className`), ReviewWall (`section bg-paper-50`), StatsRow (`dark-section section-compact`), RelatedProducts (`section bg-paper-50`) all own their `<section>` — pages render them BARE (double-wrapping causes the double-padding bug FE-3 logged on app/faqs). ImageText and ComparisonTable render bare grids/divs — pages own those wrappers. §2 alternation holds: paper→kraft, exactly one dark band on home, FAQ directly above CTABand.
10. **Layout default metadata** uses buildMetadata (per task) — its canonical "/" is inherited by any route that forgets its own metadata export. BE-2: always export per-route metadata (ISSUE noted, informational).

## Cross-agent integration absorbed mid-flight
FE-1/FE-2/FE-3/BE-2/BE-3 landed/refactored components WHILE these pages were written (THREE contract waves absorbed: initial guesses → first real APIs → FE-3's final section-owning revision). Final reconciled contracts in use: `PromoBar{globals}`, `Header{globals, categories: NavCategory[] via toNavCategories}` (renders MobileNavDrawer itself), `Footer{globals, categories: curated 8}`, `StickyMobileCTA{globals}`, `Hero{eyebrow, heading, sub, trustItems}`, `TrustBar{shipping, moq, sla}`, `CategoryTile{category, count}`, `ProductCard{product, categoryName}`, `SpecTable{rows, globals, caption}` (appends MOQ/Turnaround/Shipping itself), `FAQAccordion{faqs, className}`, `CTABand{heading, sub, phone, phoneHref}`, `StatsRow{stats: {value:number, prefix?, suffix?, label}[]}`, `ReviewWall{reviews, trustpilotUrl}` (renders the Trustpilot link in its note), `GalleryLightbox{images: (string|{src,alt})[], alt}`, `RelatedProducts{products, title}`, `ImageText`, `ComparisonTable`, `PageHero{title, lead, crumbs, children}` (disclaimer/search-form slot), ui `Button(href|type)/Badge/Breadcrumbs/Tabs/ToastProvider`. Section ownership per Decision 9.
- An earlier BE-1 temp typecheck shim (`__be1-temp-contract-shims.d.ts`) was deleted the moment real components appeared — ambient `declare module "@/…"` SHADOWS real files (same finding as ISSUES #34 re BE-2's `types/fe-contracts.d.ts`, which still needs deleting — not mine).
- DEVOPS S1 ISSUE (#24, patterns/TrustBar + patterns/RelatedProducts import paths) was resolved by pointing my imports at `components/blocks/…`; build re-verified green.

## Issues ticked / filed (docs/team/ISSUES.md)
- Ticked: data-js layout script (DESIGNER S2); SEO-2 §7 disclaimer item (BE-1 was last remaining part); BE-1 portion of SEO-2 claims item (#8) noted done; DEVOPS S1 build-break (#24); FE-1 ToastProvider wiring (#32); FE-1 typecheck item (#33, all parts now resolved).
- Filed: next/font sandbox fallback (S3); layout-metadata canonical inheritance reminder for BE-2 (S3); /products dynamic rendering note (S3).

## Handoff notes
- **BE-2:** `<main id="main">` lives in the layout — pages must NOT render their own `<main>`. Always export per-route `metadata` (see Decision 10). PageHero is shared and takes `children` for hero-slot extras.
- **FE-2:** when real Trustpilot data ships, home hero rating per Decision 4.
- **QA-AUTO:** good machine checks: one `<h1>`/page, one FAQPage JSON-LD max, `aggregateRating` absent, disclaimer present on the 3 regulated categories + their 16 products (`category.regulated`).
- **QA-MANUAL:** /products with and without `?q=`; tabs keyboard nav (roving tabindex); StatsRow count-up under prefers-reduced-motion; disclaimer visibility on mylar/CBD/tobacco pages on mobile.
