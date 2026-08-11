# DATA-ENG report — content layer
Date: 2026-06-12 · Status: DONE · Validation: `node scripts/validate-content.mjs` → PASS

## Final counts
| Dataset | File | Count | Notes |
|---|---|---|---|
| Categories | content/categories.json | **22** | type Industry 12 / Material 3 / Style 5 / General 2 + `navGroup` mirroring live mega-menu |
| Products | content/products.json | **153** | 157 sitemap URLs − 4 merged slugs (per brief) · 5 `copyStatus: live` · 148 derived · 13 with real SKUs |
| Posts | content/posts.json | **16** | titles derived from slugs, bodies are TODO-migrate placeholders, `publishedAt` from sitemap lastmod |
| Reviews | content/reviews.json | **6** (+ `_note`) | ALL placeholders — `source: "placeholder"`, `verified: false`; MUST be replaced with real Trustpilot data pre-launch |
| Sitewide FAQs | content/faqs.json | **8** | turnaround, free shipping, MOQ, design support, file formats, prototype, materials, quote process — answers locked to globals values |
| Globals | content/globals.json | 1 | brief shape + `complianceDisclaimer`; ONE SLA `7–12 business days`, MOQ 100, free US shipping, WELCOME10, socials from live footer |
| Case studies | content/casestudies.json | **3** | candle wholesale / multi-location pizzeria / CBD-smoke-shop counter display — from live portfolio subjects, `copyStatus: derived` |

## Files created (all DATA-ENG owned per BOARD)
- `lib/types.ts` — Category, Product, Post, Review, Faq, CaseStudy, Globals, Promo, SocialLinks, SearchResult, CopyStatus, CategoryType.
- `lib/content.ts` — server-only loaders (fs.readFileSync + module-level cache): getCategories/getCategory, getProducts/getProduct/getProductsByCategory, getPosts/getPost, getGlobals, getReviews (filters `_note`), getFaqs, getCaseStudies, search(q) includes-match over names+descriptions (products+categories+posts; name hits rank first).
- `content/*.json` — 7 files above.
- `scripts/validate-content.mjs` — integrity gate (counts, unique slugs, category∈22, bidirectional category⟷product consistency, imageUrl host = https://www.hmcustompackaging.com/, merged slugs absent, ≤60-char titles, placeholder review flags, globals shape). **scripts/ is broadly DEVOPS-owned; this file was PM-assigned to DATA-ENG — DEVOPS, please wire it into CI.**
- `scripts/generate-content.mjs` — provenance generator embedding all sitemap-captured data. **Re-running overwrites content/*.json** (would discard later hand edits) — kept for reproducibility only.

## Data sources (fetched live 2026-06-12, all first-try)
- products-sitemap.xml → 157 product slugs + image URLs (sitemap order preserved in products.json).
- page-sitemap.xml → 21 of 22 category hero images (see issue on business-card below).
- blog-sitemap.xml → exactly 16 post slugs + hero images.
- Live pages for real copy: `/custom-candle-boxes/` (category hero copy + 5 FAQs), `/products/custom-pizza-boxes/`, `/products/custom-soap-boxes/` (descriptions, SKUs, 5 product FAQs, related-product pattern, spec-table shape).

## Key decisions
1. **Merged products excluded** exactly per brief: custom-hangtags, custom-drawer-style-boxes, custom-seeds-boxes, custom-pre-rolls-joints-boxes → 153. Their canonical targets (custom-hang-tags, custom-drawer-boxes, custom-printed-seed-boxes, custom-pre-roll-boxes) are present.
2. **Category mapping**: every product mapped to one of the 22 slugs using live breadcrumbs (e.g. soap → cosmetics confirmed live), sitemap batch dating, and product semantics. Per-category counts: apparel 7, bakery 12, candle 3, cbd 5, cosmetics 10, events 6, food 14, gift 6, pizza 7, takeout 9, tobacco 4, toy 4, custom-boxes 11, business-card 2, mylar 7, printed-bags 7, rigid 5, display 7, insert 4, mailer 4, product-packaging 8, retail 11.
3. **`navGroup` field added to Category** ("By Industry"/"By Material"/"By Style", captured from live nav) so FE-2's MegaMenu can reproduce live IA from data; semantic `type` keeps General for custom-boxes/business-card.
4. **SKUs**: 13 real BB-HMC-#### SKUs captured from live pages (pizza family, candle family, soap/cosmetics family). All others omitted (optional field) rather than fabricated.
5. **copyStatus**: `live` only where copy is verbatim from the site (5 products + candle category). Everything else `derived` = clean slug-based name + 1–2 sentence description referencing the product type (rotating lead + category flavor sentence, so siblings don't read identically).
6. **Audit-driven normalization**: live site shows conflicting promises (product pages: “Delivers in 3-7 Working Days”, spec tables “4–8 Business Days”, “Free worldwide shipping over $100”; candle page: 500-unit wholesale tier, “no minimum”). ALL turnaround/MOQ/shipping copy in content (incl. 2 live-FAQ answers) is normalized to globals.json: SLA 7–12 business days, MOQ 100, free US shipping. Consumers must render these ONLY from getGlobals().
7. **Titles** included on all products/categories as `<Name> | HM Custom Packaging` — verified max 58 ≤ 60 chars.
8. **`related`** populated with up to 3 same-category siblings (mirrors live "Related Products" behavior).
9. **Reviews/case studies**: zero fabricated metrics or testimonials presented as real — reviews carry `_note` + placeholder/unverified flags; case studies carry `todo` client-approval markers and qualitative results only. Live "4.9 (49 Reviews)" style badges were NOT reproduced (audit finding).

## Cross-agent issue response (SEO-2 ran in parallel — ISSUES #6/#7 tagged DATA-ENG)
Applied `docs/seo/CONTENT_GUIDELINES.md` §7/§8 to the content layer after SEO-2's report landed:
- **§7 compliance rewrites** for mylar-bags / custom-cbd-boxes / custom-tobacco-packaging descriptions + flavor sentences: "licensed brands in regulated markets" framing, "child-resistant options **designed to help meet** … requirements" (never a compliance guarantee), "high-barrier, odor-control film keeps contents fresh" (no concealment language), no health claims. Product names/URLs like `custom-weed-mylar-bags` kept (search terms) per §7.
- **New data**: `Category.regulated: true` on those 3 categories; `Globals.complianceDisclaimer` carries the §7 required disclaimer — BE-1/FE-3 must render it on regulated category pages AND their product pages.
- **§8 banned-claims scan added to validate-content.mjs** ("no minimum", "worldwide shipping", "3-7 Working", "4–8 Business", "2-3 weeks", "7 to 15", "6926-437", "tel:+1-078") — runs over ALL content JSON, currently PASS.
- Live-captured FAQ answers were lightly normalized (MOQ/SLA to globals values; exclamation marks removed per §1) — flagged here since those products keep `copyStatus: "live"` for their descriptions.
- lib/seo.ts `getSiteGlobals()` reads content/globals.json lazily with fallback merge — verified compatible with the shipped shape (extra `complianceDisclaimer` key is additive).

## Handoff notes
- **BE-1/BE-2/FE-3**: import from `lib/content.ts` only; never read JSON directly. `getReviews()` already strips the `_note` row. Post.body paragraphs split on `\n\n`.
- **SEO-2**: title pattern already satisfied ≤60; meta descriptions can reuse `description` (longest is <200 — truncate at 160 word-boundary per audit). Do NOT emit aggregateRating from placeholder reviews.
- **BE-3**: `search()` in lib/content.ts is the simple includes-match the brief asks for — wrap or re-export from lib/search.ts.
- **ARCHITECT**: consider adding the `server-only` package; lib/content.ts has a comment slot for it. `next/image` remotePatterns already planned for www.hmcustompackaging.com (all 178 imageUrls point there).
- **DEVOPS**: add `node scripts/validate-content.mjs` to CI.
- Pre-launch client TODOs live in data: globals.address, reviews placeholders, post bodies (TODO-migrate), case-study `todo` fields.
