# PROJECT BRIEF — HM Custom Packaging Full Rebuild
**Client:** Codewingz (for end-client HM Custom Packaging, hmcustompackaging.com)
**Date:** 2026-06-12 · **Program Manager:** Lead orchestrator agent
**Project root (file tools):** `/Users/applefoce/Desktop/hm-rebuild`
**Project root (bash):** `/sessions/clever-gallant-ritchie/mnt/Desktop/hm-rebuild`

## Mission
Rebuild hmcustompackaging.com as a fully custom Next.js site. KEEP: logo, all product images (reference live URLs), all content/URLs. REBUILD: everything else. Fix all 37 audit findings. No page, product, or redirect may be missed.

## SYNC PROTOCOL (mandatory for every agent)
1. **Read first:** this file + `docs/team/BOARD.md` + your dependencies' reports in `docs/team/reports/`.
2. **Work** only inside your assigned scope; respect files owned by other roles (file ownership listed in BOARD).
3. **Report:** write `docs/team/reports/<ROLE>.md` — what you did, files created, decisions, issues found, perf notes, handoff notes.
4. **Board:** append ONE line to the table in `docs/team/BOARD.md`: `| <ROLE> | <status: DONE/BLOCKED> | <key files> | <issues count> | <1-line note> |`
5. **Issues:** append blockers/bugs to `docs/team/ISSUES.md` as `- [ ] [<ROLE>] description (severity)`. Fix issues in YOUR scope listed there by earlier agents when feasible and tick them.

## Tech stack (fixed — do not change)
- Next.js **15** (App Router) + React 19 + TypeScript strict. Package manager: npm.
- Tailwind CSS **3.4** + CSS variables for tokens (no CSS-in-JS).
- Content: local JSON in `/content` + typed loaders in `lib/content.ts` (CMS-ready shape). NO database server.
- Forms: server actions + zod. No external services; email send = stub logged to console + `data/leads.jsonl`.
- Icons: lucide-react. Fonts: next/font local — Poppins (600,700) display, Manrope variable body. If font files unavailable offline, use next/font/google with fallback and note in report.
- Tests: vitest + @testing-library/react. Lint: eslint (next config). NO Storybook, NO Cypress/Playwright (sandbox limits).
- Images: `next/image` with `remotePatterns: [{hostname: 'www.hmcustompackaging.com'}]`, plus `images.unoptimized = true` for sandbox builds.

## Design tokens (Designer owns `styles/tokens.css`, everyone consumes)
Colors: ink-900 #0B2536 · ink-700 #163A52 · ink-100 #E7EEF3 · terra-500 #E06A4D (primary CTA) · terra-600 #C24E33 (hover/small text) · terra-100 #FBE9E3 · paper-50 #FAF8F5 (page bg) · kraft-100 #F2ECE3 (alt sections) · slate-600 #4A5A68 · slate-400 #8294A3 · gold-500 #C9A227 (decorative only) · success #2E7D4F · error #B3402A.
Type: H1 44/32(mobile) · H2 34/26 · H3 26/21 · H4 20/18 · body 16 · small 14 — Poppins headings, Manrope body.
Spacing 4px grid (4…128). Radius: sm 6 / md 10 / lg 16 / full. Shadows e1/e2/e3 (warm navy tint). Motion: 150–350ms ease-out `cubic-bezier(.16,1,.3,1)`; hero signature 1.2s once; ALWAYS guard with `prefers-reduced-motion`.

## Information architecture / routes (App Router)
```
/                      T1 Home
/[category]            T2 — 22 category slugs (dynamic, from content/categories.json)
/products              hub grid
/products/[slug]       T3 — 157 products (content/products.json)
/get-custom-quote      T4 2-step quote form
/contact /about-us /faqs /reviews /materials /box-styles /industries
/how-it-works /sustainability /samples /case-studies
/blog  /blog/[slug]    16 posts (content/posts.json)
/business-card         category page
/portfolio             case-study grid (alias of case-studies content)
/terms-conditions /shipping-policy /return-policy /privacy-policy /thank-you /sitemap-page
not-found.tsx          branded 404
sitemap.ts robots.ts   generated
```
Category slugs (22): custom-apparel-boxes, custom-bakery-boxes, custom-candle-boxes, custom-cbd-boxes, custom-cosmetics-boxes, custom-events-packaging, custom-food-boxes, custom-gift-boxes, custom-pizza-boxes, custom-takeout-boxes, custom-tobacco-packaging, custom-toy-boxes, custom-boxes, business-card, mylar-bags, custom-printed-bags, custom-rigid-boxes, custom-display-boxes, custom-insert-boxes, custom-mailer-boxes, custom-product-packaging-boxes, custom-retail-boxes.

## Content data (Data Engineer owns /content)
Fetch live sitemaps with the web_fetch tool and parse slugs + image URLs:
- https://www.hmcustompackaging.com/products-sitemap.xml  → 157 products (+ hub)
- https://www.hmcustompackaging.com/page-sitemap.xml      → pages/categories
- https://www.hmcustompackaging.com/blog-sitemap.xml      → 16 posts
Merged products (EXCLUDE from products.json; they live in redirects): custom-hangtags→custom-hang-tags, custom-drawer-style-boxes→custom-drawer-boxes, custom-seeds-boxes→custom-printed-seed-boxes, custom-pre-rolls-joints-boxes→custom-pre-roll-boxes. Final count = **153 products**.
`content/globals.json` single source of truth: `{ "sla": "7–12 business days production + free US shipping", "moq": "100 boxes (smaller pilot runs on request)", "shipping": "Free shipping on all US orders", "phone": "+1 (213) 692-6437", "phoneHref": "tel:+12136926437", "email": "sales@hmcustompackaging.com", "promo": {"text": "Get 10% off your first order", "code": "WELCOME10", "href": "/get-custom-quote"}, "address": "Los Angeles, CA (TODO client: street address)", "social": {...} }`.

## Redirects (SEO-1 owns next.config.ts redirects via lib/redirects.ts) — 264 total
- 221 = 17 pizza variants × 13 cities `/locations/<variant>-in-<city>/`. Cities: new-york-city, los-angeles, chicago, houston, phoenix, philadelphia, san-antonio, san-diego, dallas, san-jose, austin, jacksonville, san-francisco. Variants→targets: corrugated/detroit/kraft/luxury → `/products/custom-<variant>-pizza-boxes`; printed-slice-pizza-boxes → `/products/custom-slice-pizza-boxes`; custom-disposable-pizza-boxes → `/products/custom-disposable-pizza-boxes`; ALL others (custom-pizza-boxes, cardboard, crooked, digital-printed, frozen, hexagonal, holographic-…-wholesale, michigan-style, octagonal, sicilian, unique-shaped) → `/custom-pizza-boxes`.
- 31 business-card cities → `/business-card` (cities: tampa, new-york-city, chicago, houston, dallas, austin, san-francisco, seattle, washington-d-c, boston, denver, atlanta, miami, minneapolis, portland, charlotte, tampa-2, nashville, raleigh, san-jose, los-angeles, san-diego, phoenix, orlando, baltimore, las-vegas, kansas-city, columbus, indianapolis, pittsburgh, salt-lake-city) — pattern `/business-card/custom-business-cards-in-<city>/`.
- 4 product merges (above). 8 utility: /register,/sign-in,/user-home,/my-account,/order-completed → `/`; /cart,/checkout → `/get-custom-quote`; source `/?page_id=3` handled as middleware or note (query redirects unsupported in next.config — document).

## Audit findings to fix in build (verbatim checklist — bake into components/content)
single H1 per page · one FAQ block per page · correct tel link everywhere · single SLA/MOQ/shipping from globals.json · linked promo bar w/ code · no fake badges (real payment icons ok as text/SVG list) · no fabricated testimonials (ReviewWall reads content/reviews.json marked `"source": "trustpilot", "verified": false` placeholder + TODO note) · real 404 · visible form labels · word-boundary truncation · equal-height cards · footer year auto · https links only · titles ≤60 chars pattern `<Name> | HM Custom Packaging` · meta ≤160 · breadcrumbs + BreadcrumbList JSON-LD on inner pages · Organization schema in layout · FAQPage schema where FAQs render · Product schema WITHOUT fabricated ratings.

## Quality budgets (CI + reviews enforce)
TS strict no errors · eslint clean · vitest green · every route renders (dev-server smoke) · no console errors on sampled pages · JS first-load ≤ 150KB/route target · a11y: labels, focus-visible, aria-expanded on menus, skip link.

## Team roster & file ownership
| Role | Owns |
|---|---|
| ARCHITECT | repo scaffold, package.json, next.config.ts, tsconfig, README |
| DESIGNER | styles/tokens.css, styles/globals.css, animation css, docs/DESIGN_SPEC.md |
| DATA-ENG | content/*.json, lib/content.ts, lib/types.ts |
| SEO-1 | lib/redirects.ts, docs/seo/REDIRECTS.md, sitemap/robots requirements |
| SEO-2 | docs/seo/KEYWORD_META_MAP.md, lib/seo.ts (metadata helpers + JSON-LD builders) |
| FE-1 | components/ui/* (primitives) |
| FE-2 | components/patterns nav/layout (Header, MegaMenu, MobileDrawer, Footer, Hero, StickyMobileCTA, CTABand, PromoBar) |
| FE-3 | components/patterns content (ProductCard, CategoryTile, QuoteForm, SpecTable, ProcessSteps, ReviewWall, FAQAccordion, Gallery, BlogCard, Breadcrumbs usage) |
| BE-1 | app/: layout, home, [category], products, products/[slug] |
| BE-2 | app/: all other routes + not-found + sitemap.ts + robots.ts |
| BE-3 | server actions (quote/contact), lib/search.ts, app/api/search |
| DEVOPS | .github/workflows/ci.yml, vitest config, eslint, scripts/, vercel.json, .gitignore |
| QA-AUTO | tests/* (unit + integrity), runs tsc/eslint/vitest, fixes trivial breaks |
| QA-MANUAL | dev-server page sampling report, docs/qa/MANUAL_QA.md |
| SECURITY | docs/qa/SECURITY_REPORT.md + header hardening PR notes |
| SEO-VERIFY | docs/seo/SEO_VERIFICATION.md |
| VERIFY-1/2/3 | final completeness/build/docs verification |
Do not edit another role's files except to fix a listed ISSUE (note it in your report).
