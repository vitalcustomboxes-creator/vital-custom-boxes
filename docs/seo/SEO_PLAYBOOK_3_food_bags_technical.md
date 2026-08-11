# SEO Playbook 3 — Food / Bakery / Bags & Pouches / Pizza-Takeout + Sitewide Technical SEO

Owner: SEO Specialist #3 (Technical SEO lead)
Date: 2026-06-14
Site: Vital Custom Boxes — canonical host `https://www.hmcustompackaging.com` (trailing-slash URLs)
Scope: 6 categories / 75 products in this segment + sitewide technical audit
Status: Recommendations only. No code or content files were edited (read-only repo).

> Grounding note: all counts below were pulled live from `content/products.json`
> (223 products), `content/categories.json` (22 categories), `lib/seo.ts`,
> `lib/content.ts`, `app/sitemap.ts`, `app/robots.ts`, and `next.config.ts`.
> No traffic, ranking, or volume metrics are fabricated — keyword "difficulty"
> is a qualitative SEO judgment, not a tool score.

---

## 0. My segment at a glance

| Category | Slug | Products | Drafts (thin copy) |
|---|---|---|---|
| Custom Food Boxes | `custom-food-boxes` | 20 | 6 |
| Custom Bakery Boxes | `custom-bakery-boxes` | 17 | 5 |
| Custom Mylar Bags (incl. stand-up / spout / pet-food / coffee pouches) | `mylar-bags` | 11 | 4 |
| Custom Printed Bags (paper / kraft / food bags) | `custom-printed-bags` | 11 | 4 |
| Custom Pizza Boxes | `custom-pizza-boxes` | 7 | 0 |
| Custom Takeout Boxes | `custom-takeout-boxes` | 9 | 0 |
| **Total** | | **75** | **19** |

`copyStatus` across the whole catalog: 148 `derived`, 70 `draft`, 5 `live`.
The 70 `draft` products are the "newly-added" set the brief refers to, and they
are the weakest pages on the site (templated copy, non-canonical image domain,
no FAQs — see §6 and §7).

### Competitor landscape (this segment)
Every ranking competitor leads with the same four hooks the site already owns —
**wholesale + with logo + low/no MOQ + free design + free US shipping**. The
real ranking differentiator is **depth and specificity**, not slogans:

- **Food / takeout:** CP Food Boxes, OXO Packaging, TheCustomBoxes, Ibex,
  SilverEdge, BoxesGen, CustomBoxesMarket. They win with dedicated sub-product
  pages (fry boxes, burger boxes, noodle boxes) and heavy food-safety / grease-
  resistant language.
- **Bakery:** MrTakeOutBags, OXO, Claws Custom Boxes, IMH, Halcon, Mizz, the
  exact-match domains bakerypackagingboxes.com and thecustombakeryboxes.com.
  "Window box" and "with logo" are the recurring modifiers.
- **Mylar / pouches:** BrandMyDispo, OXO, thecustommylarbags.com, 7Packaging,
  iPackU (Made-in-USA angle), Print247, Crat. They win on **child-resistant**,
  **smell-proof**, **stand-up vs flat vs gusseted**, and 100-unit MOQ.
- **Paper bags / pizza:** SilverEdge, Spectra Paper, Elite, StaySure, Pioneer,
  CustomBoxMakers (no-MOQ angle). "No minimum" and "eco-friendly cardboard" are
  the wedges.

**Takeaway:** the catalog already has the right product depth (75 pages). The
gap vs these competitors is **on-page completeness** — unique copy on the 19
drafts, FAQ blocks (which the templates render but the data is empty), internal
linking, and clean structured data. Those are executable now without new SKUs.

Sources:
- https://www.cpfoodboxes.com/ · https://oxopackaging.com/food-boxes.html · https://www.thecustomboxes.com/food-and-beverage/ · https://ibexpackaging.com/custom-food-packaging-boxes/ · https://www.silveredgepackaging.com/food-boxes/
- https://www.mrtakeoutbags.com/product/custom-cupcake-boxes.html · https://oxopackaging.com/bakery-boxes.html · https://www.clawscustomboxes.com/product/bakery-boxes/ · https://www.thecustombakeryboxes.com/ · https://mizzpackaging.com/bakery-boxes
- https://www.brandmydispo.com/collections/custommylarbags · https://oxopackaging.com/mylar-bags.html · https://www.thecustommylarbags.com/ · https://7packaging.com/custom-mylar-bags-in-the-us/ · https://ipacku.com/mylar-bags/ · https://print247.us/category/mylar-bags-mylar-pouch
- https://www.elitecustomboxes.com/pizza-boxes/ · https://www.customboxmakers.com/pizza-boxes/ · https://pioneercustomboxes.com/custom-pizza-boxes/ · https://www.silveredgepackaging.com/product/custom-pizza-bags/ · https://www.spectrapaper.com/custom-pizza-boxes

---

## 1. Segment keyword map

Intent key: **C** = commercial (ready to buy/quote), **I** = informational.
Difficulty is qualitative: **High** = dominated by aged exact-match domains;
**Med** = winnable with strong on-page + links; **Low** = long-tail, fast wins.

### 1.1 Custom Food Boxes (`/custom-food-boxes/`)
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom food boxes | C | High |
| Primary | custom food packaging boxes | C | High |
| Secondary | custom printed food boxes wholesale | C | Med |
| Secondary | food-safe / food-grade packaging boxes | C | Med |
| Long-tail | custom popcorn boxes, custom snack boxes, custom noodle boxes, custom french fry boxes, custom ice cream boxes, custom coffee boxes, custom cereal boxes | C | Low–Med |
| Long-tail | grease-resistant food box with logo, biodegradable takeout food boxes | C | Low |

### 1.2 Custom Bakery Boxes (`/custom-bakery-boxes/`)
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom bakery boxes | C | High |
| Primary | custom cake boxes with logo | C | High |
| Secondary | bakery boxes with window, custom cupcake boxes wholesale | C | Med |
| Long-tail | custom donut boxes, macaron boxes, pastry boxes, pie boxes, muffin boxes, cookie boxes, panettone boxes, cinnamon roll boxes | C | Low–Med |
| Long-tail | bakery boxes with insert / kraft cake box with window | C | Low |

### 1.3 Custom Mylar Bags & Pouches (`/mylar-bags/`)  ⚠ regulated
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom mylar bags | C | High |
| Primary | custom stand up pouches | C | High |
| Secondary | smell proof mylar bags, child resistant mylar bags, custom coffee bags, custom spout pouches | C | Med |
| Long-tail | die cut mylar bags, vacuum seal mylar bags, mushroom mylar bags, pet food pouches, custom weed mylar bags | C | Low–Med |
| Long-tail | resealable high-barrier stand-up pouch wholesale, 100 unit mylar bag MOQ | C | Low |

### 1.4 Custom Printed Bags / Paper Bags (`/custom-printed-bags/`)
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom paper bags | C | High |
| Primary | custom printed bags wholesale | C | High |
| Secondary | custom kraft bags with logo, custom shopping bags, custom food bags | C | Med |
| Long-tail | custom bakery bags, SOS bags, chinese food bags, gift bags with logo, makeup paper bag | C | Low–Med |

### 1.5 Custom Pizza Boxes (`/custom-pizza-boxes/`)
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom pizza boxes | C | High |
| Secondary | custom printed pizza boxes wholesale, pizza boxes with logo | C | Med |
| Long-tail | slice pizza boxes, Detroit pizza boxes, kraft pizza boxes, corrugated pizza boxes, luxury pizza boxes, disposable pizza boxes | C | Low–Med |

### 1.6 Custom Takeout Boxes (`/custom-takeout-boxes/`)
| Tier | Keyword | Intent | Difficulty |
|---|---|---|---|
| Primary | custom takeout boxes | C | High |
| Secondary | chinese takeout boxes, custom burger boxes, custom sushi boxes | C | Med |
| Long-tail | custom sandwich boxes, hot dog boxes, fast food boxes, paper food trays, french fries boxes | C | Low–Med |

---

## 2. Flagship titles & meta descriptions

These are READY VALUES for the 6 category pages. They are intentionally close to
the existing `CATEGORY_META` in `lib/seo.ts` (lines 458–542) but tightened for
keyword front-loading and char budget. Char counts verified ≤60 / ≤160 including
the ` | Vital Custom Boxes` suffix (22 chars).

**Custom Food Boxes** — keep existing (already optimal, 54 / 152).
- Title: `Custom Food Boxes Wholesale | Vital Custom Boxes`
- Meta: existing meta is good; alt emphasizing grease-resistance:
  `Food-safe custom food boxes with your logo — grease-resistant stocks, 100-unit MOQ, free design support & free US shipping.` (147)

**Custom Bakery Boxes** — keep existing title; meta good as-is (window angle present).

**Custom Mylar Bags** (regulated — keep compliance wording):
- Title: `Custom Mylar Bags Wholesale | Vital Custom Boxes` (48) — keep.
- Meta (alt, adds stand-up/pouch coverage):
  `Custom mylar bags & stand-up pouches — high-barrier, resealable, smell-proof & child-resistant options. 100-unit MOQ, free US shipping.` (150)

**Custom Printed Bags:**
- Title: `Custom Paper & Printed Bags Wholesale | Vital Boxes` (51) — note: front-loads "paper" (higher-volume head term) but drops the full brand; **prefer keeping existing** `Custom Printed Bags Wholesale | Vital Custom Boxes` (49) to preserve brand suffix consistency. Recommendation: keep existing title, swap meta to cover "paper bags":
  `Custom paper & printed bags — kraft, shopping & food bags with your logo. Low minimums, free design support and free US shipping.` (145)

**Custom Pizza Boxes** — keep existing (strong, covers slice→18-inch).

**Custom Takeout Boxes** — keep existing.

> Governance reminder: every value above respects the `TITLE_MAX = 60` /
> `DESCRIPTION_MAX = 160` constants and the ` | Vital Custom Boxes` pattern
> already enforced by `buildPageTitle` / `buildMetadata` (which dev-warns on
> overflow). Do not introduce titles that drop the brand suffix.

### 2.1 Flagship product titles/meta (highest-value sub-products)
`buildProductTitle` will auto-produce `<Name> Wholesale | Vital Custom Boxes`
when ≤60, else `<Name> | Vital Custom Boxes`. Verify these flagship names render
the **Wholesale** variant (they do, all ≤60):

| Product | Resulting title | Recommended meta (≤160) |
|---|---|---|
| Custom Cake Boxes | Custom Cake Boxes Wholesale \| Vital Custom Boxes | Custom cake boxes with logo & window — food-grade, grease-resistant stocks. 100-box MOQ, free design support & free US shipping. (138) |
| Custom Stand-Up Pouches | Custom Stand-Up Pouches \| Vital Custom Boxes | High-barrier custom stand-up pouches — resealable zippers, matte/gloss print, 100-unit MOQ. Free design support & free US shipping. (140) |
| Custom Coffee Bags | Custom Coffee Bags Wholesale \| Vital Custom Boxes | Custom coffee bags with degassing-valve & resealable options, printed to your brand. 100-unit MOQ, free design support, free US shipping. (150) |
| Custom Slice Pizza Boxes | Custom Slice Pizza Boxes \| Vital Custom Boxes | Grease-resistant custom slice pizza boxes printed with your logo. Low MOQ, free design support and free US shipping. (122) |
| Custom Donut Boxes | Custom Donut Boxes Wholesale \| Vital Custom Boxes | Custom donut boxes with window & logo in kraft or white. Food-safe, 100-box MOQ, free design support & free US shipping. (135) |

---

## 3. On-page recommendations (per category)

Applies to all 6 category templates (`app/[category]/page.tsx`) and the product
template (`app/products/[slug]/page.tsx`). The templates are well-structured
(single H1, breadcrumb + FAQ + product JSON-LD) — the gaps are **content depth**
and **internal linking**, not markup.

1. **Single H1 = entity name** (already enforced; marketing line is H2). Keep.
2. **Intro copy 120–180 words** front-loading the primary keyword + the 4 value
   props. Drafts currently have ~2 sentences — expand the 19 drafts (§6).
3. **H2 structure** per category: "Box/Bag styles", "Materials & food safety",
   "Sizes & MOQ", "Printing & finishes", "Industries we serve", "FAQs".
4. **Internal linking depth (high ROI):** category pages should link DOWN to all
   their sub-products (the grid does this) AND ACROSS to 2–3 sibling categories.
   Critically, **products must link back UP to their category** and across to
   related products — the `related` array exists on every product; ensure the
   template renders it (RelatedProducts block is imported, confirm it's not empty
   for drafts). Several pouch drafts point `related` only at mylar products,
   which is fine, but food/bakery drafts should cross-link within their own
   category cluster to flatten crawl depth.
5. **Food-safety language** is the segment's E-E-A-T signal: explicitly state
   "food-grade", "grease-resistant", "FDA-compliant stocks where applicable" on
   food/bakery/pizza/takeout pages. Competitors all lead with this.
6. **Mylar/pouches compliance:** keep the regulated disclaimer (template already
   renders `complianceDisclaimer` for `mylar-bags`). Do NOT make cannabis-
   specific claims on non-cannabis pouch pages (see §6.3 boilerplate leak).
7. **Image alt text:** every product/category image needs descriptive alt of the
   form `Custom [product] with logo` — confirm the `<Image>`/gallery components
   pass `alt={product.name}` (the data has no alt field, so it must be derived in
   the component). This is currently the biggest accessibility/SEO image gap.

### 3.1 FAQ questions (3–5 per key product) — for the empty `faqs` field
**Only 1 of 223 products has FAQ data.** The product template renders FAQPage
JSON-LD *only when the block visibly renders*, so right now ~222 products emit
**no FAQ rich-result eligibility**. Populate `faqs` for at least the flagship
products below (visible copy + matching JSON-LD).

**Custom Cake Boxes:** What sizes do custom cake boxes come in? · Are they
food-grade and grease-resistant? · Can I add a clear window? · What's the
minimum order? · How long is production and shipping?

**Custom Mylar Bags:** What barrier/film options are available? · Do you offer
child-resistant and smell-proof options? · Stand-up vs flat vs gusseted — which
do I need? · What is the minimum order (MOQ)? · Can you print full-color with
matte or gloss finish?

**Custom Stand-Up Pouches:** What's the smallest order? · Resealable zipper vs
tear-notch? · What films keep food fresh? · Do you do spouts/valves? · What
artwork files do you need?

**Custom Pizza Boxes:** What sizes (slice to 18-inch) can I order? · Are they
grease-resistant / corrugated? · Can I print the inside lid? · What's the MOQ? ·
Do you ship flat or assembled?

**Custom Paper Bags:** Kraft vs white vs coated — which is best? · Handle types
(twisted, flat, die-cut)? · Are they food-safe for bakery/takeout? · Minimum
order? · Turnaround and shipping?

**Custom Coffee Bags:** Do you offer degassing valves? · Resealable options? ·
Whole-bean vs ground sizing? · MOQ and lead time? · Recyclable/compostable films?

> Reuse the 6 generic site FAQs from `content/faqs.json` (turnaround, shipping,
> MOQ, design support, file formats, prototype) as a SECONDARY block site-wide,
> but the product-specific questions above are what win long-tail FAQ snippets.

---

## 4. SITEWIDE TECHNICAL SEO AUDIT

### 4.1 Title / description length governance — PASS (with one caveat)
- `lib/seo.ts` enforces `TITLE_MAX=60` / `DESCRIPTION_MAX=160` and dev-warns on
  overflow in `buildMetadata`, `buildPageTitle`, `buildProductTitle`. Good.
- `buildProductTitle` correctly avoids duplicating a CATEGORY title when a
  product shares the category name (Pattern A→B fallback, locked by tests). Good.
- **Caveat:** `buildProductDescription` falls back to a generic boilerplate when
  `blurb` is empty — but every product DOES have a `description`, so the fallback
  rarely fires. The real risk is the **drafts share near-identical descriptions**
  (templated), which dilutes uniqueness even though they pass length checks. See
  §6.

### 4.2 Canonical correctness — PASS
- `toAbsoluteUrl` produces `https://www.hmcustompackaging.com` + lowercase +
  trailing-slash canonicals; query/fragment stripped. `trailingSlash: true` in
  `next.config.ts` keeps live URLs zero-hop. Consistent and correct.
- `metadataBase` is set via `METADATA_BASE`. Good.
- `/case-studies/` correctly canonicalizes to `/portfolio/` and is excluded from
  the sitemap. Good.

### 4.3 JSON-LD coverage — PARTIAL (gaps on the 70 new products)
- Org/LocalBusiness, Breadcrumb, Product, FAQ builders all present and correct;
  Product schema correctly omits fabricated `aggregateRating`/`review`/`offers`.
- **GAP 1 — FAQPage essentially absent:** only 1/223 products has `faqs`, so
  ~222 products emit no FAQPage schema (template gates schema on visible block).
  Fix: populate `faqs` on flagships first (§3.1), then roll out.
- **GAP 2 — Product `image` points off-domain for 70 products:** the new
  products use `https://www.vitalcustomboxes.com/...` image URLs while the
  canonical host is `www.hmcustompackaging.com`. `productSchema` passes absolute
  URLs through `toAbsoluteUrl` unchanged, so JSON-LD `image`, OG `image`, and
  Twitter `image` for these 70 pages reference a **different domain** than the
  canonical. Not fatal, but it's an inconsistency Google can flag and a single-
  point-of-failure if that domain changes. Fix: migrate the 70 image assets onto
  the canonical host (or a shared CDN) and rewrite the `imageUrl` values.
- **GAP 3 — `LocalBusiness` address mismatch:** `orgSchema()` hardcodes
  `addressLocality: "Los Angeles", addressRegion: "CA"` (lines 320–322) while
  `FALLBACK_GLOBALS.address` says "3000 Shelby St, Indianapolis, IN 46227". The
  structured-data NAP and the human-readable NAP disagree, and street address is
  a TODO. **Fix before launch** — pick the real address, add full `streetAddress`
  + `postalCode`, and make schema + globals agree. Inconsistent NAP actively
  hurts local SEO.
- **GAP 4 — `sku` mostly empty:** only 13/223 products have `sku`; Product schema
  omits it when absent (fine), but populating SKUs improves entity clarity.

### 4.4 Sitemap completeness for new URLs — NEEDS VERIFICATION (likely PASS in code, stale docs)
- `app/sitemap.ts` builds from `getProducts()` which returns **all 223 products**
  (no filter in `lib/content.ts`), so the sitemap WILL emit all 223 product URLs
  + 22 categories + statics. The actual output is correct.
- **However** the file's header comment and the product route comment both say
  "153 products / 211 entries" and "153 static routes". These are **stale**
  (pre-merge). They are misleading but not functionally broken. Action: update
  the comments to 223/281-ish, and add a build-time assertion (e.g. a test that
  the sitemap entry count equals `1 home + 2 hubs + 17 static + 22 cat + N
  products + M posts`) so the count can't silently drift again.
- **Confirm** every one of the 70 new product slugs is statically generated:
  `generateStaticParams` returns `getProducts().map(...)` → yes, all 223. Good.
  But the route comment "153 static routes" + `dynamicParams = false` means if
  any loader were ever filtered to 153, the 70 new pages would 404. Keep the
  loader unfiltered; add a test asserting `getProducts().length === 223`.

### 4.5 Internal-linking depth — NEEDS WORK
- Sitemap-level discovery is fine, but **click-depth** matters for the 70 new
  products. Ensure: (a) each new product is in its category's `productSlugs`
  array (so it shows in the grid — verify for the 70), (b) the homepage / `/products/`
  hub surfaces categories, (c) products cross-link via `related`. Flat, well-
  linked clusters are how the long-tail food/bakery/pouch pages will rank.
- Add contextual in-copy links (e.g. bakery intro links to "cake boxes",
  "cupcake boxes", "donut boxes"). Competitors do this heavily.

### 4.6 Images: alt / sizing / CWV — NEEDS WORK (LCP risk)
- **`images.unoptimized: true`** in `next.config.ts` disables the Next.js image
  optimizer. Comment says it's for sandbox/CI. **In production this is a real LCP
  risk** on long product grids (22 categories × up to 21 products) — full-size
  source images shipped unresized. Action: enable the optimizer in prod (or a
  CDN/loader), serve AVIF/WebP, and set explicit `width`/`height` + `sizes` on
  grid images.
- **CLS:** ensure every `<Image>` has explicit dimensions / aspect-ratio
  containers so the grid doesn't reflow as images load. Reserve space for the
  gallery/lightbox on product pages.
- **LCP element:** category hero + first grid row are the LCP candidates — add
  `priority` to the hero image and the first 1–2 grid images; lazy-load the rest.
- **Alt text:** data has no `alt` field; the rendering component must derive
  `alt` from `product.name` / `category.name`. Verify this is happening; missing
  alt on 223 product images is a sitewide gap.
- **≤150 kB budget:** unoptimized images are the most likely budget-buster on
  grids — optimization (above) is the single biggest CWV win.

### 4.7 Mobile — VERIFY
- Quote-only flow means the primary mobile CTA is "Get a Quote". Confirm sticky/
  reachable CTA, tap targets ≥44px, and that the long product grids use a
  responsive column count. No code-level blocker found; validate in device lab.

### 4.8 Local SEO — NEEDS WORK
- Single `Organization`+`LocalBusiness` node is rendered once per page (good
  pattern). But: (a) **NAP inconsistency** (§4.3 GAP 3) must be resolved; (b) no
  `streetAddress`/`postalCode` in schema; (c) `priceRange: "$$"` is fine. If the
  business genuinely serves nationally and isn't a walk-in storefront, consider
  whether `LocalBusiness` is even appropriate vs pure `Organization` — a fake
  storefront locality can do more harm than good. Decide with the client.
- `sameAs` social profiles are emitted only if present in `globals.json` — add
  real profile URLs to strengthen the entity.

### 4.9 robots / indexation — PASS
- `app/robots.ts` is permissive, disallows `/api/` and `/thank-you/`, and points
  at the sitemap. `/thank-you/` is also noindexed. Redirect doorways kept
  crawlable so Google can process the 264 redirects. All correct.

---

## 5. Prioritized sitewide action checklist (highest ROI first)

1. **Resolve the NAP / LocalBusiness address conflict** (`orgSchema` LA/CA vs
   globals Indianapolis; missing street address). Cheapest, highest-trust fix;
   blocks correct local + entity signals. *(§4.3, §4.8)*
2. **Enable production image optimization** (turn off `unoptimized` for prod,
   serve WebP/AVIF, explicit dims + `sizes`, `priority` on hero/first row).
   Biggest Core Web Vitals / LCP / 150 kB-budget win across all product grids.
   *(§4.6)*
3. **Migrate the 70 new-product images to the canonical host** so JSON-LD/OG/
   Twitter `image` URLs match the canonical domain. *(§4.3 GAP 2)*
4. **Rewrite the 19 draft pages in this segment (and 70 sitewide) with unique
   120–180-word copy** — kill the templated "licensed cannabis" boilerplate on
   non-cannabis pouches (pet food, coffee, spout). Uniqueness + relevance.
   *(§6, §4.1)*
5. **Populate per-product `faqs`** starting with the flagships in §3.1 to unlock
   FAQPage rich results on 75 segment pages (template already supports it).
   *(§3.1, §4.3 GAP 1)*
6. **Fix stale sitemap/route comments + add count-assertion tests**
   (`getProducts().length === 223`; sitemap entry-count check) so the new 70
   pages can never be silently dropped from static generation or the sitemap.
   *(§4.4)*
7. **Strengthen internal linking**: confirm all 70 new slugs are in their
   category `productSlugs`; add contextual in-copy links and sibling-category
   links to flatten crawl depth. *(§4.5)*
8. **Add descriptive image alt text** derived from product/category names in the
   image components. *(§4.6)*
9. **Resolve duplicate-name collision** `custom-cookie-boxes` vs
   `custom-cookies-boxes` (both render H1/title "Custom Cookie Boxes"). Merge one
   into a 301/308 redirect or differentiate (e.g. "Cookie Boxes" vs "Cookie Gift
   Boxes") to avoid self-cannibalization. Also review near-dupes
   `custom-cupcake-boxes`/`custom-cup-cake-boxes` and
   `custom-waffle-boxes`/`custom-waffles-boxes`. *(§6.2)*
10. **Populate `sku`** on products and add real `sameAs` social profiles. *(§4.3)*

---

## 6. Segment content-quality issues (detail)

### 6.1 Thin / templated drafts
19 of 75 segment products are `copyStatus: draft` with 1–2 sentences of copy.
These are the priority rewrites (food: empanada, deli paper, cone sleeves,
butcher paper, french fry, hot dog trays; bakery: waffle, panettone, cookies,
cinnamon, cup-cake; bags: SOS, food paper, gift, bakery; mylar: weed bags,
stand-up pouches, spout pouches, pet-food pouches).

### 6.2 Duplicate / near-duplicate slugs (cannibalization)
- `custom-cookie-boxes` (derived) and `custom-cookies-boxes` (draft) → **same
  name "Custom Cookie Boxes"** → identical H1 + title. Pick one canonical, 308
  the other.
- `custom-cupcake-boxes` vs `custom-cup-cake-boxes`, and `custom-waffle-boxes`
  vs `custom-waffles-boxes` — review and consolidate.

### 6.3 Boilerplate relevance leak (mylar/pouch family)
The pouch drafts share a templated description. The clause **"for food brands and
licensed cannabis businesses alike"** appears on `custom-stand-up-pouches`,
`custom-spout-pouches`, and `custom-pet-food-packaging`. Cannabis wording on a
**pet-food** page is both off-topic for ranking and a compliance smell. Rewrite
each pouch page with use-case-specific copy (coffee → degassing valve;
pet food → barrier + portion sizing; spout → liquids/sauces).

---

## 7. What's already good (don't regress)
- Title/desc length governance with dev-warnings (`lib/seo.ts`).
- Trailing-slash canonical policy + `metadataBase` + zero-hop redirect map.
- Product schema correctly omitting fabricated ratings/reviews/offers.
- Single-node Org/LocalBusiness, single-H1 templates, FAQ-gated schema.
- robots.txt permissiveness for redirect doorways; `/thank-you` noindex.
- Sitemap built from typed loaders (not hand-maintained) — just fix the comments.

---
*End of Playbook 3.*
