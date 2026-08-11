# CONTENT GUIDELINES — hmcustompackaging.com rebuild
**Owner:** SEO-2 · **Date:** 2026-06-12 · **Applies to:** DATA-ENG (content JSON), FE-3 (content components), BE-1/BE-2 (templates), QA/SEO-VERIFY (checks)
Companion docs: `docs/seo/KEYWORD_META_MAP.md` (titles/metas/H1s) · `lib/seo.ts` (helpers).

---

## 1. Voice & tone
- B2B, confident, concrete. Talk about the **buyer's product and shelf**, not our adjectives. Prefer "grease-resistant board for 18-inch pies" over "premium high-quality solutions".
- US English. Headings in Title Case, body in sentence case. Numerals for specs ("100 boxes", "12pt"), no exclamation marks in body copy, at most one in promos.
- Every factual claim (SLA, MOQ, shipping, phone, promo) comes from `content/globals.json` — never hard-typed in copy. See §8.

## 2. Category page copy rules (22 pages)
Template order (single H1 — audit rule):
1. **H1** = category name (exact strings in KEYWORD_META_MAP §3).
2. **Intro** under the H1: 40–70 words, primary keyword once in the first sentence.
3. Product grid (cards link to `/products/[slug]`).
4. **Editorial section: unique 150–250 words total** under 2–3 H2s (e.g., "Why <Category> from HM", "Materials & Finishes", "Sizing & Ordering"). This replaces the live site's 800+ word stuffed essays — shorter, unique, specific. No two categories may share sentences.
5. **One FAQ block, 4–6 questions** (see §5).
6. CTA band → `/get-custom-quote`.

**Keyword usage (anti-stuffing rules — the live site fails these):**
- Primary keyword: H1, title, first sentence of intro, one H2 max, meta description. **≤5 total mentions** in body copy; after that use natural variants ("these boxes", "bakery packaging").
- Never chain modifier keywords the way the live copy does ("custom bakery boxes with logo wholesale reviews"). One modifier per sentence, grammatical.
- No keyword-list paragraphs, no bolding keywords for SEO, no "as a leading <keyword> manufacturer" boilerplate repeated across pages.
- Forbidden filler openers: "Welcome to…", "In today's competitive market…", "In the modern retail landscape…" (all on the live site, all on multiple pages).

## 3. Product page copy rules (153 pages)
- Single H1 = product name. The live pages have a second marketing H1 — it becomes the first H2.
- Unique opening blurb 40–80 words (also feeds meta description via `buildProductDescription(name, { blurb })` and card excerpts).
- Body: 2–4 short H2 sections (features, materials/finishes, use cases) — unique per product; spec table (FE-3 `SpecTable`); related products (3–4 from the same category).
- **At most one FAQ block** (live product pages have two — merge to one, 4–5 Qs).
- Keep SKU display (e.g., `BB-HMC-1369`) — it is real data and aids quote references.
- Display-name fixes WITHOUT URL changes: "Custom Mylar Vacuum Seal Bags" (slug stays `custom-mylar-vacum-seal-bags`); replace any "HM Custom Boxes" with "HM Custom Packaging".

## 4. Hub & info pages
- `/materials`, `/box-styles`, `/industries` are **linking hubs**: every section must link to at least one category or product. No dead-end paragraphs.
- `/faqs` is the only page allowed a long FAQ list (10–16 Qs, grouped). It still renders FAQPage schema once.
- Blog posts: 1 H1 (post title), intro answers the query in the first 100 words, 2–4 internal links to commercial pages (§6).

## 5. FAQ rules (audit: "one FAQ block per page")
- **Exactly one FAQ block per page**, 4–6 Qs (products 4–5). No FAQ block = no FAQPage schema.
- `faqSchema(faqs)` must receive **the exact visible Q/A text** (plain text, no markdown) — Google requires parity between schema and page.
- Answers 30–90 words, factual, one link max. SLA/MOQ/shipping answers must interpolate `globals.json` values — this kills the live site's "2-3 weeks" vs "7-15 days" vs "7-12 days" contradictions.
- Don't duplicate the same Q on every page; each category gets ≥2 category-specific Qs (e.g., bakery: food-safe inks; mylar: child-resistant options).

## 6. Internal linking rules
- **Category → products:** product grid + ≥1 contextual in-copy link to a flagship product; link 1–2 sibling categories where natural (bakery ↔ food, rigid ↔ gift).
- **Product → related:** 3–4 related products from the same category (FE-3 `RelatedProducts`); breadcrumb to parent category (Home → Category → Product) + one contextual link back to the category in body copy.
- **Hubs:** `/materials`, `/box-styles`, `/industries` link out to categories; every category links to ≥1 hub page ("see our materials guide"). Home links all 22 categories (mega menu) + featured products.
- **Blog → money pages:** every post links 2–4 relevant category/product pages with descriptive anchors; categories may link relevant posts ("Candle Shipping Guide").
- **Anchor text:** descriptive entity names ("custom mailer boxes"), never "click here" / "read more" as the only anchor (card "Read More" buttons need `aria-label` with the target name — FE-3).
- **Href hygiene:** internal links are root-relative **with trailing slash** (`/custom-bakery-boxes/` — `trailingSlash: true` is wired; slash-less hrefs cost a redirect hop, see TECH_SEO §1) — never `http://` or hard-coded `www` URLs in copy (live site mixes `http://` links — audit "https links only"). External links: https only, `rel="noopener"`.
- No orphan pages: every product reachable from its category; every category from home/mega-menu; ≤3 clicks to any product.

## 7. Compliance wording — mylar-bags, custom-cbd-boxes, custom-tobacco-packaging ⚠
We sell **packaging to licensed, legally operating businesses**. We do not sell, ship, or promote the regulated products themselves.

| Don't (live-site wording) | Do (rebuild wording) |
|---|---|
| "smell proof" + "discretion" framing | "high-barrier, odor-control film keeps contents fresh" |
| "Enhance your cannabis branding" (consumer-facing hype) | "packaging for licensed cannabis and hemp brands in regulated markets" |
| "child resistant closures" stated as a compliance guarantee | "child-resistant zipper options **designed to help** licensed brands meet state packaging requirements" |
| "custom printed mylar bags no minimum" | globals MOQ string: "MOQ 100 (smaller pilot runs on request)" |
| Slang ("weed") in category titles/metas/H1s | "cannabis" in category-level metadata; the product `custom-weed-mylar-bags` keeps its name/URL (search term), with compliant body copy |
| Health/medical claims on CBD pages | describe the box only — materials, panels, finishes; zero product-effect claims (FDA) |
| Youth-appealing tobacco copy | "for licensed adult tobacco brands"; note warning-label panel accommodation |

**Required disclaimer line** (footer of these 3 category pages + their products):
> *HM Custom Packaging supplies packaging exclusively to legally operating businesses. Regulatory compliance of the packaged product, including labeling and warnings, remains the responsibility of the brand.*

## 8. Claims hygiene (single source of truth)
All of these appear ONLY via `content/globals.json` (helpers: `getSiteGlobals()` in `lib/seo.ts`, loaders in `lib/content.ts`):
- SLA: "7–12 business days production + free US shipping" · MOQ: "100 boxes (smaller pilot runs on request)" · Shipping: "Free shipping on all US orders" · Phone: "+1 (213) 692-6437" / `tel:+12136926437` · Promo: "Get 10% off your first order" + code WELCOME10 → `/get-custom-quote`.

**Banned claims** (all currently live somewhere — do not migrate them):
- "no minimum" / "No Minimum Order Required" (contradicts MOQ 100)
- "Free worldwide shipping on all orders over $100" (shipping is free US, no threshold)
- "Delivers in: 3-7 Working Days", "Turnaround 4–8 Business Days", "2-3 weeks", "7 to 15 business days" (one SLA only)
- Phone displayed as "+1 (213) 6926-437" (mis-grouped) or `tel:+1-078-2376` (broken)
- Invented review counts/scores ("4.9 · 100+ Reviews" linking to `#`), fake security/trust badges
- Reviews: only `content/reviews.json` entries marked `"source": "trustpilot", "verified": false` placeholder + visible TODO note (brief rule); never present them as verified.

## 9. Image alt-text conventions
- Formula: `<entity name> — <distinguishing detail>` in plain language, ≤125 chars, no "image of/picture of/photo of", no keyword chains.
  - Product gallery (vary per image): `Custom cake box with logo — kraft, window lid`, `Custom cake boxes — gold foil embossed detail`, `Custom cake box — flat-pack stack, wholesale`.
  - Category tiles: `Custom bakery boxes — assorted printed pastry packaging`.
  - Never reuse the live site's stuffed alts (`custom cupcake boxes wholesale` as alt is keyword stuffing — describe the picture).
- Decorative/duplicate images: `alt=""` (and `aria-hidden` where appropriate). Icons next to text labels: `alt=""`.
- Logo: `alt="HM Custom Packaging"` (links home). Payment methods: real text/SVG list with named alts ("Visa", "Mastercard"…), not one merged "Payment" strip image like the live footer.
- OG images: per-page hero/product image (live URL from content JSON); fallback `DEFAULT_OG_IMAGE` — already wired in `buildMetadata`.

## 10. Truncation & card text
- Any truncated text (card excerpts, breadcrumb labels, meta fallbacks) uses `truncateAtWordBoundary()` from `lib/seo.ts` — never `slice(0, n)` (audit: live cards cut mid-word: "our boxe...").
- Card excerpts: 110–140 chars from the product blurb; equal-height cards are a layout concern (FE-1/FE-3) but copy must not exceed 2 lines of ~70 chars.

## 11. Pre-publish checklist (per page)
- [ ] Exactly one H1; heading levels don't skip (H1→H2→H3)
- [ ] Title ≤60 (pattern), meta ≤160 with ≥2 value props, both unique site-wide
- [ ] 150–250 unique editorial words (categories) / 40–80 word blurb (products)
- [ ] One FAQ block (4–6 Qs) + matching `faqSchema` only if block renders
- [ ] Breadcrumbs + `breadcrumbSchema` on inner pages
- [ ] All claims sourced from globals.json; zero banned claims (§8)
- [ ] Internal links per §6; no `http://`, no `#` placeholder hrefs
- [ ] Alts per §9; regulated pages carry §7 disclaimer
