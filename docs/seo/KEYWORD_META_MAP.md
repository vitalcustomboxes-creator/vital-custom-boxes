# KEYWORD & META MAP — hmcustompackaging.com rebuild
**Owner:** SEO-2 · **Date:** 2026-06-12 · **Consumers:** BE-1, BE-2 (page metadata), DATA-ENG (may merge into content JSON), SEO-VERIFY

All values below are **final, ready-to-paste strings** — not placeholders. They are also codified as typed maps in `lib/seo.ts` (`CATEGORY_META`, `STATIC_PAGE_META`) so backend agents can import them directly instead of copy-pasting. Every title and meta length in this file has been machine-validated (see Appendix A).

---

## 1. Global rules (from audit checklist — non-negotiable)

| Rule | Value |
|---|---|
| Title pattern | `<Primary Keyword> \| HM Custom Packaging` — suffix is 22 chars, so the primary part must be **≤38 chars** |
| Title length | **≤60 characters** (hard cap; aim 45–58) |
| Meta description | **≤160 characters** (aim 110–158), unique per page, includes value props: **free US shipping · low MOQ 100 · free design support** (pick ≥2 per page; phrase naturally) |
| H1 | **Exactly one per page.** Category/product H1 = entity name. Live site has 2 H1s on most category/product pages — the second "marketing H1" becomes an H2 in the rebuild. |
| Canonical | `https://www.hmcustompackaging.com` + path, **trailing-slash form** (SEO-1 wired `trailingSlash: true`; see docs/seo/TECH_SEO.md §1–2). `lib/seo.ts#toAbsoluteUrl` normalizes: lowercase path, leading+trailing slash, query/fragment stripped. One host (`www`, https) everywhere. |
| OG/Twitter | Emitted automatically by `buildMetadata()`. `ogImage` = page hero/product image from content JSON; fallback `DEFAULT_OG_IMAGE`. |
| Robots | Index everything except: `/thank-you` (noindex), 404 (auto-noindex). Policy pages indexable. |
| Schema | Organization+LocalBusiness in root layout (`orgSchema()`), BreadcrumbList on all inner pages, FAQPage only where an FAQ block visibly renders, Product schema **without aggregateRating/review/offers** (no fabricated ratings or prices — quote-based). |

### SERP conventions observed (research 2026-06-12)
Queries sampled: "custom mailer boxes wholesale", "custom mylar bags with logo wholesale". Ranking titles lead with the exact head keyword, then one differentiator, then brand: *"Custom Mailer Boxes & Mailing Boxes - Low Minimums, Quick Turnaround | Packola"*, *"Custom Mylar Bags – Low MOQ from 100 pcs | Wholesale Prices"*, *"Custom Mylar Bags - Wholesale Pricing & Free Design"*. Differentiators that competitors monetize: **low minimums / MOQ 100, free design, free shipping, fast turnaround** — exactly our globals.json value props. Our pattern `<Keyword> Wholesale | HM Custom Packaging` matches the convention.

---

## 2. Live-site baseline (fetched 2026-06-12) — what we are fixing

| Live page | Current title (len) | Current meta (len) | Current H1(s) | Problems |
|---|---|---|---|---|
| `/` | "Home - HM Custom Packaging" (26) | "HM Custom Packaging provides high-quality custom boxes…" (160) | "Crafting Unforgettable Brand Experiences with Premium Custom Packaging Boxes" | Title has zero keyword value ("Home -"); H1 77 chars, no head keyword at front |
| `/custom-bakery-boxes/` | "Custom Bakery Boxes Wholesale \| Printed and Luxury Packaging" (61) | 199 chars | **TWO H1s** ("Custom Bakery Boxes" ×2) | Title 61>60; meta 199>160; double H1; FAQ says "2-3 weeks" vs global SLA 7–12 days |
| `/custom-printed-bags/` | "Custom Printed Bags Wholesale \| Premium **Luxuty** Packaging" (56) | 163 chars | "Custom Printed Bags" (single) | **"Luxuty" typo CONFIRMED**; meta 163>160; copy claims "no minimums" + "7 to 15 business days" (conflicts with globals MOQ 100 / SLA 7–12) |
| `/products/custom-cake-boxes/` | "Custom Wholesale & Printed Cake Boxes \| HM Custom Packaging" (59) | 106 chars (no value props) | **TWO H1s** + **TWO FAQ blocks** | Double H1; duplicate FAQ blocks; "Free worldwide shipping on orders over $100" + "Delivers in 3-7 Working Days" + "Turnaround 4–8 Business Days" all contradict globals; `http://` internal links |
| `/mylar-bags/` | "Premium Custom Mylar Bags Wholesale \| HM Custom Packaging" (58) | 117 chars | **TWO H1s** | Double H1; "no minimum" claims; cannabis wording compliance issues (§5); fabricated "5.0 / 47+ Reviews" badge linking to `#` |

Cross-page baseline issues confirmed: broken mobile tel link `tel:+1-078-2376`; phone displayed mis-grouped as "+1 (213) 6926-437"; unlinked promo bar without code; rating badges linking to `#`; one product description says "HM Custom Boxes" instead of "HM Custom Packaging".

---

## 3. Category pages — 22 final values

Intent shorthand: **C/W** = commercial-transactional, B2B wholesale buyer comparing suppliers (true for all 22 — per-row note adds the nuance).

| # | Slug | Target keyword | Intent note | Title (≤60) | Meta description (≤160) | H1 |
|---|---|---|---|---|---|---|
| 1 | `custom-apparel-boxes` | custom apparel boxes | C/W — clothing/streetwear brands | Custom Apparel Boxes Wholesale \| HM Custom Packaging | Pack shirts, suits & streetwear in custom apparel boxes with your logo. Free US shipping, low 100-box MOQ and free design support. | Custom Apparel Boxes |
| 2 | `custom-bakery-boxes` | custom bakery boxes | C/W — bakeries; window/logo modifiers | Custom Bakery Boxes Wholesale \| HM Custom Packaging | Order custom bakery boxes with logo or window for cakes, cookies & pastries. Food-safe stocks, free US shipping, 100-box MOQ & free design support. | Custom Bakery Boxes |
| 3 | `custom-candle-boxes` | custom candle boxes | C/W — candle makers; protection angle | Custom Candle Boxes Wholesale \| HM Custom Packaging | Protect jars and lift shelf appeal with custom candle boxes with logo. Free design support, low 100-box MOQ and free US shipping. | Custom Candle Boxes |
| 4 | `custom-cbd-boxes` | custom CBD boxes | C/W — regulated; no health claims (§5) | Custom CBD Boxes Wholesale \| HM Custom Packaging | Retail-ready custom CBD boxes for tinctures, gummies & topicals, with label-friendly panels. Free shipping, 100-box MOQ & free design support. | Custom CBD Boxes |
| 5 | `custom-cosmetics-boxes` | custom cosmetic boxes | C/W — beauty brands; luxury finishes | Custom Cosmetics Boxes Wholesale \| HM Custom Packaging | Luxury custom cosmetics boxes for skincare, lipstick & beauty kits. Free design support, low 100-box MOQ and free US shipping. | Custom Cosmetics Boxes |
| 6 | `custom-events-packaging` | custom event packaging | C/W — planners, weddings, corporate | Custom Event Packaging & Favor Boxes \| HM Custom Packaging | Custom event packaging for weddings, parties & corporate gifts — favor boxes to gift bags. Free shipping, 100-box MOQ & free design support. | Custom Events Packaging |
| 7 | `custom-food-boxes` | custom food boxes | C/W — restaurants/CPG; food-safe angle | Custom Food Boxes Wholesale \| HM Custom Packaging | Food-safe custom food boxes for restaurants, meal-prep and retail brands. Free US shipping, low 100-box MOQ and free design support. | Custom Food Boxes |
| 8 | `custom-gift-boxes` | custom gift boxes wholesale | C/W — retail + corporate gifting | Custom Gift Boxes Wholesale \| HM Custom Packaging | Make every order feel like a gift with custom gift boxes with logo, ribbon & inserts. Free shipping, 100-box MOQ & free design support. | Custom Gift Boxes |
| 9 | `custom-pizza-boxes` | custom pizza boxes | C/W — pizzerias; 221 city redirects land here | Custom Pizza Boxes Wholesale \| HM Custom Packaging | Grease-resistant custom pizza boxes printed with your logo, from slice boxes to 18-inch. Free US shipping, 100-box MOQ & free design support. | Custom Pizza Boxes |
| 10 | `custom-takeout-boxes` | custom takeout boxes | C/W — restaurants/delivery | Custom Takeout Boxes Wholesale \| HM Custom Packaging | Custom takeout boxes that keep food hot and your brand in hand. Food-safe stocks, free design support, 100-box MOQ and free US shipping. | Custom Takeout Boxes |
| 11 | `custom-tobacco-packaging` | custom tobacco packaging | C/W — regulated, licensed brands only (§5) | Custom Tobacco Packaging Boxes \| HM Custom Packaging | Custom tobacco packaging for licensed cigar, cigarette & accessory brands. Free design support, low 100-box MOQ and free US shipping. | Custom Tobacco Packaging |
| 12 | `custom-toy-boxes` | custom toy boxes | C/W — toy brands; window/display angle | Custom Toy Boxes Wholesale \| HM Custom Packaging | Playful custom toy boxes with window cutouts and vivid print that stand out on shelves. Free shipping, 100-box MOQ & free design support. | Custom Toy Boxes |
| 13 | `custom-boxes` | custom boxes with logo | C/W — head term, catch-all category | Custom Boxes with Logo Wholesale \| HM Custom Packaging | Design custom boxes with logo in any size, style or material. Instant quotes, free US shipping, low 100-box MOQ and free design support. | Custom Boxes |
| 14 | `business-card` | custom business cards | C/W — print add-on; 31 city redirects land here | Custom Business Card Printing \| HM Custom Packaging | Print custom business cards with foil, emboss & spot UV finishes that match your packaging. Low minimums, free design support, free US shipping. | Custom Business Cards |
| 15 | `mylar-bags` ⚠ | custom mylar bags | C/W — food/coffee/regulated brands (§5 compliance) | Custom Mylar Bags Wholesale \| HM Custom Packaging | Custom mylar bags with logo — high-barrier, resealable, with child-resistant options. Free design support, low 100-unit MOQ and free US shipping. | Custom Mylar Bags |
| 16 | `custom-printed-bags` | custom printed bags | C/W — retail bags; **fixes "Luxuty" typo** | Custom Printed Bags Wholesale \| HM Custom Packaging | Custom printed bags in kraft, paper and canvas that carry your brand everywhere. Free design support, low minimums and free US shipping. | Custom Printed Bags |
| 17 | `custom-rigid-boxes` | custom rigid boxes | C/W — luxury/premium segment | Custom Rigid Boxes Wholesale \| HM Custom Packaging | Luxury custom rigid boxes with magnetic lids and foil finishes for premium brands. Free design support, 100-box MOQ and free US shipping. | Custom Rigid Boxes |
| 18 | `custom-display-boxes` | custom display boxes | C/W — retail POS | Custom Display Boxes Wholesale \| HM Custom Packaging | Counter and retail custom display boxes that sell your product at the point of sale. Free design support, 100-box MOQ and free US shipping. | Custom Display Boxes |
| 19 | `custom-insert-boxes` | custom insert boxes | C/W — protective/premium inserts | Custom Insert Boxes Wholesale \| HM Custom Packaging | Custom insert boxes with die-cut cardboard or foam inserts that lock products in place. Free shipping, 100-box MOQ & free design support. | Custom Insert Boxes |
| 20 | `custom-mailer-boxes` | custom mailer boxes | C/W — e-commerce/subscription; high volume | Custom Mailer Boxes Wholesale \| HM Custom Packaging | E-commerce-ready custom mailer boxes printed inside and out for a memorable unboxing. Free US shipping, low 100-box MOQ & free design support. | Custom Mailer Boxes |
| 21 | `custom-product-packaging-boxes` | custom product packaging | C/W — generic head, solution seekers | Custom Product Packaging Boxes \| HM Custom Packaging | Custom product packaging boxes engineered around your exact product, brand and budget. Free shipping, low 100-box MOQ and free design support. | Custom Product Packaging Boxes |
| 22 | `custom-retail-boxes` | custom retail boxes | C/W — shelf-ready retail | Custom Retail Boxes Wholesale \| HM Custom Packaging | Shelf-ready custom retail boxes with logo that win the in-store glance. Free US shipping, low 100-box MOQ and free design support. | Custom Retail Boxes |

Category `ogImage`: use the live category banner from content JSON (e.g. `…/2025/11/Custom-Bakery-Boxes.png`); fallback `DEFAULT_OG_IMAGE`.

---

## 4. Static pages — final values

| Route | Target keyword / job | Intent note | Title (≤60) | Meta description (≤160) | H1 |
|---|---|---|---|---|---|
| `/` | custom packaging boxes | C/W — brand + head term | Custom Packaging Boxes Wholesale \| HM Custom Packaging | Custom packaging boxes with logo, made to order in the USA. Instant quotes, free design support, low 100-box MOQ and free US shipping on every order. | Custom Packaging Boxes That Build Your Brand |
| `/products` | custom box styles (hub) | C — browse/compare | Shop All Custom Packaging Products \| HM Custom Packaging | Browse 150+ custom box styles, bags and packaging products by industry, material and style. Free design support and free US shipping on every order. | All Custom Packaging Products |
| `/get-custom-quote` | custom packaging quote | Transactional — convert | Get a Free Custom Packaging Quote \| HM Custom Packaging | Tell us your size, stock and quantity to get a fast, no-obligation custom packaging quote — with free design support and free US shipping. | Get Your Free Custom Quote |
| `/contact` | contact | Navigational | Contact Us \| HM Custom Packaging | Talk to a packaging specialist. Call +1 (213) 692-6437 or email sales@hmcustompackaging.com for quotes, samples and order support. | Contact HM Custom Packaging |
| `/about-us` | about / trust | Navigational — E-E-A-T | About Us \| HM Custom Packaging | Meet HM Custom Packaging — a US custom box maker pairing premium printing with free design support, low MOQs and free shipping. | About HM Custom Packaging |
| `/faqs` | packaging FAQs | Informational — pre-sale objections | Packaging FAQs \| HM Custom Packaging | Answers about MOQs, turnaround, materials, artwork files and shipping for custom packaging orders from HM Custom Packaging. | Frequently Asked Questions |
| `/reviews` | reviews / trust | Navigational — social proof | Customer Reviews \| HM Custom Packaging | See what customers say about our custom boxes, bags and design service — ratings and reviews of HM Custom Packaging. | Customer Reviews |
| `/materials` | packaging materials | Informational hub — supports categories | Packaging Materials Guide \| HM Custom Packaging | Compare cardstock, corrugated, kraft and rigid stocks — weights, finishes and best uses — to choose the right material for your custom boxes. | Packaging Materials Guide |
| `/box-styles` | box styles | Informational hub — supports categories | Custom Box Styles Guide \| HM Custom Packaging | Explore mailer, tuck-end, rigid, gable, display and more box styles with diagrams to find the right structure for your product. | Custom Box Styles |
| `/industries` | packaging by industry | Informational hub — routes to categories | Packaging by Industry \| HM Custom Packaging | From bakery to beauty to CBD — find custom packaging tuned to your industry's shelf, shipping and labeling needs. | Packaging by Industry |
| `/how-it-works` | how to order custom boxes | Informational — process trust | How It Works \| HM Custom Packaging | From quote to doorstep in four steps: instant quote, free 3D design proof, production in 7–12 business days and free US shipping. | How It Works |
| `/sustainability` | sustainable packaging | Informational — eco buyers | Sustainable Packaging \| HM Custom Packaging | Recyclable kraft, soy-based inks and biodegradable options — how we help brands cut packaging waste without cutting corners. | Sustainable Packaging |
| `/samples` | packaging samples | Transactional — low-commitment lead | Packaging Samples \| HM Custom Packaging | See and feel the quality first — request material swatches and sample boxes before you commit to a full production run. | Request Packaging Samples |
| `/case-studies` | packaging case studies | Informational — proof | Packaging Case Studies \| HM Custom Packaging | Real packaging projects from quote to delivery — how brands use custom boxes to lift retail presence and unboxing moments. | Packaging Case Studies |
| `/portfolio` | packaging portfolio | Navigational — proof (live page w/ equity) | Packaging Portfolio \| HM Custom Packaging | A look at recent custom box and bag projects across bakery, beauty, food and retail — designed, printed and shipped by HM Custom Packaging. | Our Packaging Portfolio |
| `/blog` | packaging blog | Informational hub | Packaging Blog \| HM Custom Packaging | Packaging guides, sizing charts and design tips from the HM Custom Packaging team — learn before you print. | Packaging Insights & Guides |

**`/portfolio` vs `/case-studies` (duplicate content):** both render the same case-study content. `/portfolio` exists on the live site (has link equity); `/case-studies` is new. **BE-2: set `alternates.canonical` of `/case-studies` → `https://www.hmcustompackaging.com/portfolio/` and keep `/case-studies` out of sitemap.ts** — SEO-1 reached the same decision independently (TECH_SEO.md §2.5). Do not let two indexable URLs serve identical content.

### Utility & policy pages (pattern rows)

| Route | Title | Meta description | Robots |
|---|---|---|---|
| `/terms-conditions` | Terms & Conditions \| HM Custom Packaging | Read the terms and conditions for ordering custom packaging from HM Custom Packaging, including quotes, proofs, production and delivery. | index |
| `/shipping-policy` | Shipping Policy \| HM Custom Packaging | How we ship custom packaging orders: free US shipping, production timelines, tracking and delivery details. | index |
| `/return-policy` | Return Policy \| HM Custom Packaging | Our policy for reprints and refunds on custom packaging orders, and how to report an issue with your delivery. | index |
| `/privacy-policy` | Privacy Policy \| HM Custom Packaging | How HM Custom Packaging collects, uses and protects your information when you request quotes or place orders. | index |
| `/sitemap-page` | HTML Sitemap \| HM Custom Packaging | Browse every page on HM Custom Packaging — categories, products, guides and policies — from one index. | index |
| `/thank-you` | Thank You \| HM Custom Packaging | Your request has been received — here is what happens next. | **noindex** |
| 404 (`not-found`) | Page Not Found \| HM Custom Packaging | — (404s emit no meta description; status code handles indexing) | auto |

---

## 5. ⚠ Compliance wording — mylar-bags / CBD / tobacco (REQUIRED FIX)

Live `/mylar-bags/` markets directly to cannabis use with risky phrasing. Rules for the rebuild (full do/don't table in `docs/seo/CONTENT_GUIDELINES.md` §7):

1. **Audience framing:** sell packaging to **licensed/legally operating businesses** — "for licensed cannabis and hemp brands in regulated markets", never to consumers, never implying we sell or ship the product itself.
2. **No concealment language:** the live copy pairs "smell proof" with "discretion". Replace with functional wording: "odor-barrier film keeps contents fresh". Never imply evading detection, parents, neighbors, or law enforcement. ("Smell-proof" may remain in product *names/keywords* — `custom-smell-proof-mylar-bags` is the search term — but the copy explains it as freshness/odor containment only.)
3. **Child-resistant = "designed to help meet"**, never "guarantees compliance": "child-resistant zipper options designed to help licensed brands meet state packaging requirements." Regulatory responsibility stays with the client brand — add the standard disclaimer line (CONTENT_GUIDELINES §7) on mylar-bags, custom-cbd-boxes and custom-tobacco-packaging pages.
4. **No "no minimum" claims** on these or any pages — live mylar/printed-bags pages claim "no minimum", contradicting globals MOQ 100. Use the globals.json MOQ string verbatim.
5. **CBD:** zero health/medical claims (FDA). Describe the box, not the product's effects.
6. **Tobacco:** "for licensed adult brands"; no youth-appealing language; note that FDA/state warning-label placement is the brand's responsibility (we accommodate required label panels).
7. **Slang in metadata:** keep the keyword where it has real volume (product `custom-weed-mylar-bags` keeps its URL and name), but category-level titles/metas/H1 use "cannabis", not slang. The mylar category meta above is fully compliant.

---

## 6. Product pages — TITLE / META patterns (153 products)

Backend agents should call the helpers in `lib/seo.ts` (they implement exactly this spec and dev-warn on violations):

**Title — `buildProductTitle(name)`**
1. **Pattern A (preferred):** `<Product Name> Wholesale | HM Custom Packaging` — used when total ≤60 (i.e., name ≤28 chars). Example: `Custom Cake Boxes Wholesale | HM Custom Packaging` (50).
2. **Pattern B (fallback):** `<Product Name> | HM Custom Packaging` — when A exceeds 60 and the name is ≤38 chars. Example: `Custom Roll End Tuck Front Boxes | HM Custom Packaging` (54).
3. **Pattern C (rare, name >38):** product name alone, word-boundary-truncated to ≤60, no suffix. No current product name needs this; the helper guards regressions.

**Meta — `buildProductDescription(name)`**
Template (then word-boundary-trimmed to ≤160):
`Order <Product Name> with your logo, wholesale. Free US shipping, low 100-unit MOQ & free design support — get an instant quote.`
Example (`Custom Cake Boxes`): `Order Custom Cake Boxes with your logo, wholesale. Free US shipping, low 100-unit MOQ & free design support — get an instant quote.` (131)
If DATA-ENG ships a hand-written unique product blurb, prefer it (trimmed to ≤160 via `truncateAtWordBoundary`) over the template.

**H1** = product name exactly (e.g., `Custom Cake Boxes`), single H1; the live pages' second marketing H1 ("Custom Cake Boxes: Elegant & Durable Packaging…") becomes the first H2.

**Display-name fixes that do NOT change URLs:** `custom-mylar-vacum-seal-bags` keeps its slug but displays "Custom Mylar Vacuum Seal Bags"; copy saying "HM Custom Boxes" must read "HM Custom Packaging".

**Product schema:** `productSchema({name, image, description, url, sku?})` — brand = HM Custom Packaging; **NO aggregateRating, NO review, NO offers** (quote-based pricing; fabricating a price or rating violates the audit rules). `ogImage` = first product gallery image (live URL from products.json).

### Blog posts (16)
- Title: `<Post Title> | HM Custom Packaging` when ≤60; otherwise post title alone, word-boundary-truncated to ≤60. Example: `What Are the Dimensions of a Business Card? | HM Custom Packaging` (65) → falls back to `What Are the Dimensions of a Business Card?` (44).
- Meta: post excerpt (first paragraph), `truncateAtWordBoundary(…, 160)`. `ogType: "article"`, `ogImage` = post banner.

---

## Appendix A — validation

All proposed values in this file and in `lib/seo.ts` were validated by node script on 2026-06-12:
- Markdown tables: **45 rows** (22 category + 16 static + 7 policy/utility) — 0 violations.
- `lib/seo.ts` `CATEGORY_META` + `STATIC_PAGE_META`: **44 entries** — 0 violations.
- Result: **max title = 58 chars, max meta = 149 chars, min meta = 59** (the noindex `/thank-you`).
- Helper smoke test: `buildProductTitle` / `buildProductDescription` stay ≤60/≤160 for the longest real product names ("Custom Roll End Tuck Front Boxes" → 54-char title) and degrade safely (word-boundary "…") for hypothetical >38-char names.

SEO-VERIFY: re-run by checking every table cell ending in `| HM Custom Packaging` (title) and the cell after it (meta), plus the two maps in `lib/seo.ts`.
