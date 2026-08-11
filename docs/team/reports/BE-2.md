# BE-2 REPORT — secondary routes + not-found + sitemap.ts/robots.ts
**Role:** BE-2 (backend/fullstack — all app/ routes outside BE-1's layout/home/category/product set) · **Date:** 2026-06-12
**Verification:** repo-wide `npx tsc --noEmit` exit 0 · `eslint app components/blocks lib/routes.ts` 0/0 · full `npx next build` ✓ 219/219 pages (first-load 103–143 kB, ≤150 kB budget) · built sitemap.xml = exactly **211** `<loc>` (0 thank-you, 0 case-studies) · built HTML spot-checks: /case-studies canonical→/portfolio ✓, /thank-you `noindex,nofollow` ✓, /faqs single h1 + one FAQPage schema ✓.

## Route list (all server components; metadata via `buildMetadata` on every page; BreadcrumbList JSON-LD + visible breadcrumbs on inner pages via PageHero)

| Route | File | Notable contents / decisions |
|---|---|---|
| /get-custom-quote/ | app/get-custom-quote/page.tsx | T4 grid §6.9: FE-3 QuoteForm (action=BE-3 submitQuote, categories slug/name, moq from globals, `?product=` → defaultProduct resolved server-side ⇒ route is ƒ dynamic, intentional) + lg sidebar (globals trust rows, phone secondary, 3-step "what happens next", /samples/ teaser) + mobile phone fallback. No CTABand/sticky CTA. |
| /contact/ | app/contact/page.tsx | NAP from globals — address rendered city-level only (TODO parenthetical stripped, never a fake street); hours w/ client TODO; tel:/mailto: from globals; social text links (no hotlinked assets); LeadForm→submitContact; map placeholder block w/ client TODO. |
| /about-us/ | app/about-us/page.tsx | E-E-A-T copy, zero invented history/staff/stats; values grid; globals-driven facts; cross-links. |
| /faqs/ | app/faqs/page.tsx | ALL 8 getFaqs() topic-ordered in ONE FAQAccordion (audit: one FAQ block) + faqSchema from the same items. (FE-3 unwrapped my extra section after making FAQAccordion section-owning — thanks.) |
| /how-it-works/ | app/how-it-works/page.tsx | SIX-step rail (page-local §6.12 recipe — FE-3 ProcessSteps is fixed-4; logged informational issue); SLA appears exactly once (step 4, verbatim globals.sla); checklist; CTABand. |
| /reviews/ | app/reviews/page.tsx | FE-3 ReviewWall (placeholder-flagged data, visible note, NO aggregate schema) + Trustpilot CTA to globals.social.trustpilot. |
| /materials/ | app/materials/page.tsx | FE-3 blocks/ComparisonTable (5 stocks × 5 attribute rows, honest recyclability strings) + 6 stock-guide cards + finishes; food-safe stocks "available on request" wording. |
| /box-styles/ | app/box-styles/page.tsx | Dieline static illustration (no draw-in — home-exclusive) + "what's a dieline" intro + ProductCard grid per Style category (5 cats / 34 products, Reveal stagger, alternating bands). |
| /industries/ | app/industries/page.tsx | 12 Industry CategoryTiles (+product counts) + "more ways to browse" cards. |
| /sustainability/ | app/sustainability/page.tsx | Only defensible claims (recyclable kraft, soy-ink options, biodegradable options, made-to-order); explicit no-badge/no-cert note; kraft deep-dive section. |
| /samples/ | app/samples/page.tsx | Kit contents + 3-step flow + LeadForm→submitSample (name/email/address/interest). NO free-sample promise (fees confirmed by email). Conversion page ⇒ no CTABand. |
| /portfolio/ | app/portfolio/page.tsx | CANONICAL of the pair; CaseStudyShowcase (3 studies, full alternating sections, visible verification note per audit honesty rule). In sitemap. |
| /case-studies/ | app/case-studies/page.tsx | Same showcase; **canonical → /portfolio/** (ISSUES #10 / TECH_SEO §2.5); excluded from sitemap. |
| /blog/ | app/blog/page.tsx | BlogCard grid (16 posts newest-first). |
| /blog/[slug]/ | app/blog/[slug]/page.tsx | generateStaticParams (16); title rule §6 (suffix ≤60 else word-boundary title-only); Article JSON-LD manual object (Organization author/publisher — no fake persons); body parser supports `## ` headings → anchored h2s + FE-3 TOC (renders null on current TODO-migrate placeholders); AuthorBox; 3 related BlogCards; notFound() on unknown slug. |
| /terms-conditions/ | app/terms-conditions/page.tsx | SHORT rewrite; globals SLA/MOQ/shipping; **food-grade contradiction removed** — "food-safe material options available on request"; regulated-products clause = globals.complianceDisclaimer verbatim; TODO legal review. |
| /shipping-policy/ | app/shipping-policy/page.tsx | globals.shipping + sla only (no live "worldwide/$100/3–7 day" claims); tracking, freight, address changes, non-US case-by-case; TODO legal review. |
| /return-policy/ | app/return-policy/page.tsx | Made-to-order = no general returns; defect/transit remedy w/ 7-business-day window (flagged for counsel); report-by-email flow; TODO legal review. |
| /privacy-policy/ | app/privacy-policy/page.tsx | Forms-only data collection, no sale, fulfilment-only sharing, no ad trackers, rights via email; TODO legal review. (Legacy /?page_id=3 308s here via SEO-1 middleware.) |
| /thank-you/ | app/thank-you/page.tsx | `noIndex:true` (verified meta), excluded from sitemap + robots-disallowed (ISSUES #5); 3 next-steps incl. one-business-day reply promise (mirrors faqs.json quote-process) + globals.sla; no CTABand/breadcrumbs (terminal utility page). |
| /sitemap/ | app/sitemap/page.tsx | HTML sitemap at the LIVE URL per PM decision (NOT /sitemap-page); public content pages only — pages/22 categories/153 products A–Z w/ category labels/16 posts; excludes thank-you + case-studies; meta from STATIC_PAGE_META["/sitemap-page"] with path "/sitemap/". |
| 404 | app/not-found.tsx | Real HTTP 404 (no soft redirect); single h1; labeled search form GET /products/?q=; 4 top CategoryTiles; quote + home CTAs; title-only metadata (no description per KEYWORD map). |
| /sitemap.xml | app/sitemap.ts | TECH_SEO §3: loaders + lib/routes.ts only, **211 entries verified on build output**, absolute https www trailing-slash, posts lastModified=publishedAt; exclusions documented in-file. |
| /robots.txt | app/robots.ts | TECH_SEO §4 verbatim: allow all, disallow /api/ + /thank-you/ ONLY (redirect sources deliberately crawlable), sitemap pointer. Verified build output. |

## Shared files created (BE-2-owned)
- `components/blocks/PageHero.tsx` — thin composition: FE-2 InteriorHero + FE-1 Breadcrumbs; one `crumbs` array feeds visuals AND breadcrumbSchema per page (can't drift).
- `components/blocks/LeadForm.tsx` — client wrapper for contact/samples: useActionState → BE-3 action → ok ? router.push("/thank-you/") : inline role="alert" error; honeypot via lib/forms HONEYPOT_FIELD; ui primitives (visible labels); pending state on submit Button.
- `components/blocks/CaseStudyShowcase.tsx` — shared /portfolio + /case-studies body (single source, visible verification note).
- `lib/routes.ts` — static-route registry consumed by BOTH sitemap.ts and the HTML sitemap page (XML/HTML can never drift).

## PM-decision / cross-team items executed
1. **/locations/ hub redirect (264):** added as group 5 "EXTRA" in scripts/gen-redirects.mjs (asserts 263→264), regenerated lib/redirects.ts (264 entries, `/locations/`→`/custom-pizza-boxes/`), updated next.config.ts count comments + docs/seo/REDIRECTS.md (§1 table now 264 config entries; §5 grep/test counts; §6 gaps marked resolved). Cross-file edits were the PM-assigned fix; noted per protocol.
2. **/sitemap/ route** (see table) — SEO-1's gap #2 closed without a redirect.
3. **#5 thank-you noindex + sitemap/robots exclusion** — done & verified.
4. **#10 case-studies canonical → portfolio** — done & verified in built HTML.
5. **Shim cleanup:** my temporary types/fe-contracts.d.ts turned out to SHADOW real modules (BE-3/FE-2 finding) — deleted entirely; all pages reconciled against real component APIs; ISSUES item ticked.

## Notes / handoffs
- QA-AUTO: suggested integrity tests — sitemap length 211 + no redirect-source overlap (TECH_SEO §3), redirects length **264** (REDIRECTS.md §5D updated), /case-studies canonical assertion.
- Client/PM launch blockers logged in ISSUES: street address (FE-2 item), contact hours, legal-counsel review, blog body migration, real Trustpilot reviews.
- DEVOPS S1 "build red" item: no longer reproduces — my full build is green (note appended to the ISSUES entry; left for DEVOPS to tick after CI re-run).
- Apostrophes in JSX text use ’ (U+2019) to satisfy react/no-unescaped-entities; CTABand headings are claim-free per FE-2's contract.
