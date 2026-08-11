# SEO Playbook 2 — Cosmetics / CBD / Tobacco / Soap / Candle

**Owner:** SEO Specialist #2
**Date:** 2026-06-14
**Site:** Vital Custom Boxes (Next.js, quote-only, ~223 products / 22 categories)
**Segment covered:** Custom Cosmetics Boxes (incl. soap & nail/press-on), Custom CBD Boxes, Custom Tobacco Packaging, Custom Candle Boxes
**Status of data when written:** most product pages in this segment are `copyStatus: draft`/`derived` with **duplicated boilerplate descriptions** and **0 FAQs** (only `custom-soap-boxes` and the candle *category* carry FAQs today). That is the single biggest on-page gap to close.

> **Branding note:** This doc uses the live rebuild brand **"Vital Custom Boxes"** and the title suffix ` | Vital Custom Boxes` (matches `content/*.json`). The older `docs/seo/KEYWORD_META_MAP.md` still shows the legacy `| HM Custom Packaging` suffix — where the two conflict, **Vital Custom Boxes wins** for this segment. All other global rules from `KEYWORD_META_MAP.md` and `CONTENT_GUIDELINES.md` (single H1, ≤60 title, ≤160 meta, Product schema w/o ratings/offers, FAQPage only where FAQ visibly renders, trailing-slash canonical) still apply.

---

## 0. How to read this doc

- **Title** = the `<title>` string, paste-ready, ≤60 chars including the ` | Vital Custom Boxes` suffix (suffix = 21 chars, so the keyword part must be **≤39 chars**). Where the keyword + suffix can't both fit ≤60, I use a shorter suffix `| Vital Boxes` and flag it.
- **Meta** = meta description, ≤160 chars, with ≥2 value props (low MOQ 100 · free design support · free US shipping · fast turnaround) phrased naturally. **No prices, no fabricated ratings** (quote-only site).
- **KD** = rough keyword difficulty on a relative 1–10 scale based on SERP composition observed 2026-06-14 (head "custom X boxes" terms are saturated by packaging aggregators; long-tail modifiers are softer). **No fabricated search-volume numbers** — treat KD as directional only.
- Compliance-sensitive pages are flagged ⚠ and must carry the §7 regulated disclaimer.

---

## 1. Competitor SERP findings (research 2026-06-14)

Queries sampled: *custom cosmetic boxes wholesale*, *custom lip balm boxes wholesale no minimum*, *custom cbd boxes packaging wholesale*, *custom vape boxes wholesale child resistant*, *custom candle boxes wholesale with logo*, *custom soap boxes wholesale*, *custom perfume boxes wholesale rigid luxury*, *custom pre roll boxes wholesale cannabis*.

**Who ranks top-10 (the field we compete against):** customboxesmarket.com (CBM), plusprinters, boxlark, print247, thecustomboxes.com, blueboxpackaging, oxopackaging, packagingbee, boxesgen, icustomboxes, imhpackaging, cbd-boxes.com, cbdpackagingstore, ibexpackaging, brandmydispo, shoprigidboxes, soapboxeswholesale.com, limcypackaging, ezcustomboxes, dreamcustomboxes. These are packaging-aggregator domains with hundreds of near-identical product pages — **beatable on content depth, schema, internal linking, and genuine differentiation**, not on domain age.

**What top-ranking pages consistently do (patterns to match or beat):**
1. **Exact head keyword leads the title**, then ONE differentiator, then brand. e.g. *"Custom Lip Balm Boxes - Wholesale Price - No Minimum Orders"*, *"Custom Mylar Bags – Low MOQ from 100 pcs | Wholesale Prices"*.
2. **Monetized differentiators in title/meta:** *no minimum / low MOQ 100*, *free design support*, *free shipping (US/Canada)*, *fast turnaround (quoted 8–10 biz days production + 3–4 shipping; rush 4–5)*. These exactly match Vital's globals — use them.
3. **Material + style + finishing lists** as body content: kraft / cardboard / rigid; tuck-end, pillow box, sleeve, two-piece, window; foil stamping, embossing, debossing, spot UV, soft-touch/matte/gloss lamination, die-cut windows, inserts.
4. **Use-case / sub-product coverage** on the category page (e.g. cosmetics page name-checks mascara, lip balm, eyelash, hair extension; candle page name-checks taper/scented/pillar/jar/tealight).
5. **FAQ blocks** ("MOQ?", "can you print my logo?", "is it eco-friendly?", "turnaround?", "design help?") — almost universal, and a direct FAQPage-schema opportunity.
6. **Regulated niches (CBD/vape/pre-roll):** competitors lead with **child-resistant / certified locking closures**, **tamper-evident**, **smell-proof**, and **state-compliance** language. Vital must phrase these as "options **designed to help** licensed brands meet requirements" (§7) — never as a guarantee, never with product-effect/health claims.

**Take-away:** the bar is low-quality, templated copy. Vital can win top-10 by shipping **unique, deeper copy per page + FAQPage schema + tight internal linking** — none of which most aggregators do well.

Sources:
- [CBM — Custom Cosmetic Boxes](https://customboxesmarket.com/custom-cosmetic-boxes/)
- [Limcy Packaging — Lip Balm Boxes, No Minimum](https://limcypackaging.com/product/custom-lip-balm-boxes/)
- [The Custom Boxes — CBD Boxes](https://www.thecustomboxes.com/cbd-boxes/)
- [BrandMyDispo — Child-Resistant Vape Packaging](https://www.brandmydispo.com/products/child-resistant-vape-packaging)
- [iCustomBoxes — Vape Boxes](https://www.icustomboxes.com/vape-boxes/)
- [PackagingBee — Candle Boxes](https://packagingbee.com/custom-candle-boxes/)
- [The Custom Boxes — Soap Boxes](https://www.thecustomboxes.com/soap-boxes/)
- [ShopRigidBoxes — Perfume Boxes](https://shoprigidboxes.com/rigid-perfume-box/)
- [OXO Packaging — Cannabis Pre Roll](https://oxopackaging.com/cannabis-pre-roll-packaging.html)

---

## 2. Keyword map (per category & flagship product)

Intent for all of these is **commercial / transactional** (buyer looking to source packaging). Long-tails skew transactional with qualifiers (wholesale, with logo, no minimum, bulk, near me, small business).

### 2.1 Cosmetics (category `custom-cosmetics-boxes`)
| Page | Primary kw | Secondary | Long-tail (intent) | KD |
|---|---|---|---|---|
| Cosmetics category | custom cosmetic boxes | cosmetic packaging boxes wholesale; custom cosmetic packaging | custom cosmetic boxes wholesale; cosmetic boxes with logo; custom beauty packaging for small business | 8 |
| `custom-lip-balm-boxes` | custom lip balm boxes | lip balm packaging boxes; lip balm boxes wholesale | custom lip balm boxes no minimum; lip balm boxes with logo; kraft lip balm boxes | 6 |
| `custom-lip-gloss-boxes` | custom lip gloss boxes | lip gloss packaging; lip gloss boxes wholesale | custom lip gloss boxes with window; lip gloss boxes bulk; lip gloss boxes for small business | 6 |
| `custom-mascara-boxes` | custom mascara boxes | mascara packaging boxes | custom mascara boxes wholesale; mascara boxes with logo; mascara packaging with insert | 5 |
| `custom-eyeliner-boxes` | custom eyeliner boxes | eyeliner packaging boxes | custom eyeliner boxes wholesale; eyeliner boxes with logo | 4 |
| `custom-eyeshadow-boxes` | custom eyeshadow boxes | eyeshadow packaging; eyeshadow palette boxes | custom eyeshadow palette boxes; eyeshadow boxes wholesale | 5 |
| `custom-lotion-boxes` | custom lotion boxes | lotion packaging boxes; lotion bottle boxes | custom lotion boxes wholesale; lotion boxes with logo; lotion packaging for small business | 5 |
| `custom-cream-boxes` | custom cream boxes | cream jar boxes; skincare cream packaging | custom cream boxes wholesale; cream jar packaging with insert | 5 |
| `custom-perfume-boxes` | custom perfume boxes | perfume packaging boxes; rigid perfume box | luxury perfume boxes wholesale; rigid perfume box with insert; perfume boxes with logo | 7 |
| `custom-press-on-nail-boxes` | custom press-on nail boxes | press on nail packaging | press on nail boxes with window; press on nail boxes for small business | 4 |
| `custom-makeup-boxes` | custom makeup boxes | makeup packaging boxes; makeup kit boxes | custom makeup boxes wholesale; makeup boxes with logo; makeup subscription boxes | 7 |
| `custom-lipstick-boxes` | custom lipstick boxes | lipstick packaging boxes | custom lipstick boxes wholesale; lipstick boxes with insert; lipstick boxes with logo | 6 |
| `custom-serum-boxes` | custom serum boxes | serum packaging; serum dropper boxes | custom serum boxes wholesale; serum boxes with insert | 5 |
| `custom-nail-polish-boxes` | custom nail polish boxes | nail polish packaging | nail polish boxes wholesale; nail polish boxes with insert | 4 |

### 2.2 Soap (products inside cosmetics category)
| Page | Primary kw | Secondary | Long-tail | KD |
|---|---|---|---|---|
| `custom-soap-boxes` ⭐(live FAQs) | custom soap boxes | soap packaging boxes; soap boxes wholesale | kraft soap boxes; soap boxes with window; handmade soap packaging; custom soap boxes no minimum | 7 |
| `custom-soap-sleeves` | custom soap sleeves | soap sleeve packaging; soap belly bands | kraft soap sleeves; printed soap sleeves wholesale; soap sleeves for handmade soap | 4 |

> **Soap insight:** strong long-tail around **handmade / artisan / cold-process / kraft / eco-friendly** soap. This is a high-conversion small-business niche — lean into it with copy & FAQs.

### 2.3 CBD ⚠ (category `custom-cbd-boxes`, `regulated: true`)
| Page | Primary kw | Secondary | Long-tail | KD |
|---|---|---|---|---|
| CBD category | custom cbd boxes | cbd packaging boxes wholesale; cbd box packaging | custom cbd boxes wholesale; cbd packaging with logo; child-resistant cbd boxes | 8 |
| `cbd-oil-boxes` | cbd oil boxes | cbd oil packaging; cbd tincture oil boxes | custom cbd oil boxes wholesale; cbd oil boxes with insert | 6 |
| `custom-cbd-gummies-boxes` | cbd gummies boxes | cbd gummy packaging | custom cbd gummies boxes wholesale; child-resistant cbd gummies boxes | 6 |
| `cbd-tincture-boxes` | cbd tincture boxes | tincture packaging boxes | custom cbd tincture boxes with insert; tincture boxes wholesale | 5 |
| `custom-hemp-boxes` | custom hemp boxes | hemp packaging boxes | hemp boxes wholesale; hemp product packaging with logo | 6 |
| `custom-delta-8-boxes` | custom delta-8 boxes | delta 8 packaging boxes | delta 8 boxes wholesale; child-resistant delta 8 boxes | 5 |
| `cbd-display-boxes` | cbd display boxes | cbd counter display boxes | cbd retail display boxes; cbd display boxes wholesale | 4 |
| `custom-pre-roll-cbd-boxes` | cbd pre-roll boxes | hemp pre-roll packaging | custom cbd pre-roll boxes wholesale; pre-roll boxes with insert | 6 |

### 2.4 Tobacco ⚠ (category `custom-tobacco-packaging`, `regulated: true`)
| Page | Primary kw | Secondary | Long-tail | KD |
|---|---|---|---|---|
| Tobacco category | custom tobacco packaging | tobacco boxes wholesale; tobacco packaging boxes | custom tobacco packaging with logo; child-resistant tobacco packaging | 6 |
| `custom-vape-boxes` | custom vape boxes | vape packaging boxes; vape cartridge boxes | custom vape boxes wholesale; child-resistant vape boxes; vape boxes with logo | 7 |
| `custom-vape-cartridge-boxes` | vape cartridge boxes | cartridge packaging; 510 cartridge boxes | child-resistant vape cartridge boxes; vape cartridge boxes with insert | 6 |
| `custom-pre-roll-boxes` | custom pre-roll boxes | pre-roll packaging; pre roll tube boxes | custom pre roll boxes wholesale; pre-roll boxes with insert; pre-roll display boxes | 7 |
| `custom-cigar-boxes` | custom cigar boxes | cigar packaging boxes | custom cigar boxes wholesale; cigar boxes with logo; rigid cigar boxes | 5 |
| `custom-cigarette-boxes` | custom cigarette boxes | cigarette packaging boxes | custom cigarette boxes wholesale; cigarette boxes with logo | 5 |
| `custom-e-cigarette-boxes` | e-cigarette boxes | e-cig packaging boxes | custom e-cigarette boxes wholesale | 4 |

### 2.5 Candle (category `custom-candle-boxes`)
| Page | Primary kw | Secondary | Long-tail | KD |
|---|---|---|---|---|
| Candle category ⭐(live FAQs) | custom candle boxes | candle boxes wholesale; candle packaging | custom candle boxes wholesale; candle boxes with logo; candle gift box packaging | 7 |
| `custom-cardboard-candle-boxes` | cardboard candle boxes | candle boxes cardboard | cardboard candle boxes wholesale; candle boxes with insert | 4 |
| `custom-luxury-candle-boxes` | luxury candle boxes | premium candle packaging; rigid candle boxes | luxury candle boxes wholesale; magnetic candle gift boxes | 5 |
| `custom-kraft-candle-boxes` | kraft candle boxes | eco candle packaging | kraft candle boxes wholesale; eco-friendly candle boxes | 4 |
| `rigid-candle-boxes` | rigid candle boxes | rigid candle packaging | rigid candle gift boxes; magnetic closure candle boxes | 4 |
| `window-candle-boxes` | window candle boxes | candle boxes with window | window candle boxes wholesale; candle boxes with clear window | 4 |

---

## 3. Paste-ready `<title>` + meta description (flagship pages)

All titles validated ≤60 chars; metas ≤160. Suffix ` | Vital Custom Boxes` = 21 chars. Where flagged `[short suffix]`, use ` | Vital Boxes` (14 chars) to fit the keyword.

### Categories
**custom-cosmetics-boxes**
- Title: `Custom Cosmetic Boxes Wholesale | Vital Custom Boxes` (52)
- Meta: `Custom cosmetic boxes printed to your exact size — soft-touch, foil & window options. Low MOQ 100 and free design support. Get a quote.` (134)

**custom-cbd-boxes** ⚠
- Title: `Custom CBD Boxes Wholesale | Vital Custom Boxes` (47)
- Meta: `Retail-ready custom CBD boxes for licensed hemp & CBD brands. Child-resistant options designed to help meet state requirements. MOQ 100.` (135)

**custom-tobacco-packaging** ⚠
- Title: `Custom Tobacco Packaging Boxes | Vital Custom Boxes` (51)
- Meta: `Custom tobacco packaging for licensed adult brands — vapes, pre-rolls, cigars. Warning-panel-ready, child-resistant options, low MOQ 100.` (136)

**custom-candle-boxes**
- Title: `Custom Candle Boxes Wholesale | Vital Custom Boxes` (50)
- Meta: `Custom candle boxes with logo — kraft, rigid, window & two-piece styles with inserts. Low MOQ 100 and free design support. Get a quote.` (133)

### Cosmetics products
**custom-lip-balm-boxes**
- Title: `Custom Lip Balm Boxes Wholesale | Vital Custom Boxes` (52)
- Meta: `Custom lip balm boxes printed to your size with kraft, window & foil options. Low MOQ 100, free design support, fast turnaround. Get a quote.` (140)

**custom-lip-gloss-boxes**
- Title: `Custom Lip Gloss Boxes Wholesale | Vital Custom Boxes` (53)
- Meta: `Custom lip gloss boxes with window cutouts, foil & soft-touch lamination, built to your exact tube size. Low MOQ 100 and free design support.` (140)

**custom-mascara-boxes**
- Title: `Custom Mascara Boxes Wholesale | Vital Custom Boxes` (51)
- Meta: `Custom mascara boxes with snug inserts, foil stamping & soft-touch finishes, made to your tube size. Low MOQ 100, free design support.` (133)

**custom-perfume-boxes**
- Title: `Custom Perfume Boxes Wholesale | Vital Custom Boxes` (51)
- Meta: `Luxury custom perfume boxes — rigid stock, foam inserts, foil & embossing to protect every bottle. Low MOQ 100 and free design support.` (134)

**custom-makeup-boxes**
- Title: `Custom Makeup Boxes Wholesale | Vital Custom Boxes` (50)
- Meta: `Custom makeup boxes & kit packaging in your exact sizes — foil, soft-touch, inserts & windows. Low MOQ 100, free design support, fast turnaround.` (144)

**custom-lipstick-boxes**
- Title: `Custom Lipstick Boxes Wholesale | Vital Custom Boxes` (52)
- Meta: `Custom lipstick boxes with secure inserts, foil & soft-touch finishes, die-cut to your tube. Low MOQ 100 and free design support. Get a quote.` (141)

**custom-press-on-nail-boxes**
- Title: `Custom Press-On Nail Boxes | Vital Custom Boxes` (47)
- Meta: `Custom press-on nail boxes with window cutouts & inserts that show off every set. Low MOQ 100, free design support, fast turnaround. Get a quote.` (143)

**custom-eyeshadow-boxes**
- Title: `Custom Eyeshadow Boxes Wholesale | Vital Boxes` (46) `[short suffix to fit "Wholesale"]`
- Meta: `Custom eyeshadow & palette boxes with inserts, foil stamping & soft-touch lamination in your exact size. Low MOQ 100 and free design support.` (140)

**custom-lotion-boxes**
- Title: `Custom Lotion Boxes Wholesale | Vital Custom Boxes` (50)
- Meta: `Custom lotion boxes sized to your bottle with inserts, foil & matte/gloss finishes. Low MOQ 100, free design support, fast turnaround.` (133)

**custom-cream-boxes**
- Title: `Custom Cream Boxes Wholesale | Vital Custom Boxes` (49)
- Meta: `Custom cream & jar boxes with snug inserts, foil stamping & soft-touch finishes, made to your size. Low MOQ 100 and free design support.` (135)

**custom-serum-boxes**
- Title: `Custom Serum Boxes Wholesale | Vital Custom Boxes` (49)
- Meta: `Custom serum boxes with dropper-bottle inserts, foil & soft-touch lamination, die-cut to size. Low MOQ 100, free design support. Get a quote.` (140)

**custom-nail-polish-boxes**
- Title: `Custom Nail Polish Boxes Wholesale | Vital Boxes` (48) `[short suffix]`
- Meta: `Custom nail polish boxes with secure inserts, foil & window options, made to your bottle size. Low MOQ 100 and free design support.` (130)

### Soap products
**custom-soap-boxes** ⭐ (already has 5 FAQs — keep them, expand copy)
- Title: `Custom Soap Boxes Wholesale | Vital Custom Boxes` (48)
- Meta: `Custom soap boxes & sleeves — kraft, window & eco-friendly stocks for handmade and retail soap. Low MOQ 100, free design support, fast turnaround.` (145)

**custom-soap-sleeves**
- Title: `Custom Soap Sleeves & Belly Bands | Vital Boxes` (47) `[short suffix]`
- Meta: `Custom printed soap sleeves & belly bands for handmade and artisan soap — kraft & eco stocks, full-color printing. Low MOQ 100, free design.` (139)

### CBD products ⚠
**cbd-oil-boxes**
- Title: `Custom CBD Oil Boxes Wholesale | Vital Custom Boxes` (51)
- Meta: `Retail-ready CBD oil boxes for licensed brands — dropper-bottle inserts, child-resistant options designed to help meet state requirements. MOQ 100.` (146)

**custom-cbd-gummies-boxes**
- Title: `Custom CBD Gummies Boxes | Vital Custom Boxes` (45)
- Meta: `CBD gummies boxes for licensed hemp & CBD brands — child-resistant options designed to help meet state packaging requirements. Low MOQ 100.` (138)

**custom-hemp-boxes**
- Title: `Custom Hemp Boxes Wholesale | Vital Custom Boxes` (48)
- Meta: `Retail-ready hemp boxes for licensed hemp & CBD brands — premium finishes and child-resistant options designed to help meet state requirements.` (142)

**custom-delta-8-boxes**
- Title: `Custom Delta-8 Boxes Wholesale | Vital Custom Boxes` (51)
- Meta: `Delta-8 boxes for licensed hemp & CBD brands — child-resistant options designed to help meet state requirements. Low MOQ 100, free design.` (137)

**cbd-tincture-boxes**
- Title: `Custom CBD Tincture Boxes | Vital Custom Boxes` (46)
- Meta: `CBD tincture boxes for licensed brands — snug dropper inserts and child-resistant options designed to help meet state requirements. MOQ 100.` (139)

### Tobacco products ⚠
**custom-vape-boxes**
- Title: `Custom Vape Boxes Wholesale | Vital Custom Boxes` (48)
- Meta: `Custom vape boxes for licensed adult brands — warning-panel-ready, child-resistant options designed to help meet packaging requirements. MOQ 100.` (144)

**custom-vape-cartridge-boxes**
- Title: `Custom Vape Cartridge Boxes | Vital Custom Boxes` (48)
- Meta: `Vape cartridge boxes for licensed adult brands — foam inserts, warning-panel-ready, child-resistant options designed to help meet requirements.` (142)

**custom-pre-roll-boxes**
- Title: `Custom Pre-Roll Boxes Wholesale | Vital Boxes` (45) `[short suffix]`
- Meta: `Custom pre-roll boxes for licensed adult brands — tube inserts, warning-panel-ready, child-resistant options designed to help meet requirements.` (143)

**custom-cigar-boxes**
- Title: `Custom Cigar Boxes Wholesale | Vital Custom Boxes` (49)
- Meta: `Custom cigar boxes for licensed adult brands — rigid construction, foil & embossing, warning-panel-ready. Low MOQ 100 and free design support.` (141)

**custom-cigarette-boxes**
- Title: `Custom Cigarette Boxes Wholesale | Vital Boxes` (46) `[short suffix]`
- Meta: `Custom cigarette boxes for licensed adult brands — full-color printing, warning-panel-ready construction. Low MOQ 100 and free design support.` (141)

### Candle products
**custom-luxury-candle-boxes**
- Title: `Custom Luxury Candle Boxes | Vital Custom Boxes` (47)
- Meta: `Luxury candle boxes — rigid two-piece & magnetic styles with foil, embossing & inserts that cradle jars and tins. Low MOQ 100, free design.` (138)

**custom-kraft-candle-boxes**
- Title: `Custom Kraft Candle Boxes | Vital Custom Boxes` (46)
- Meta: `Eco-friendly kraft candle boxes with inserts and full-color printing, sized to your jar or tin. Low MOQ 100, free design support, fast turnaround.` (145)

**window-candle-boxes**
- Title: `Window Candle Boxes Wholesale | Vital Custom Boxes` (50)
- Meta: `Window candle boxes that show off jars and tins — die-cut windows, inserts & foil options in your exact size. Low MOQ 100 and free design support.` (145)

**rigid-candle-boxes**
- Title: `Rigid Candle Boxes Wholesale | Vital Custom Boxes` (49)
- Meta: `Rigid candle boxes with magnetic closures, foil, embossing & inserts that protect premium candles. Low MOQ 100 and free design support.` (134)

**custom-cardboard-candle-boxes**
- Title: `Cardboard Candle Boxes Wholesale | Vital Boxes` (46) `[short suffix]`
- Meta: `Custom cardboard candle boxes with inserts and full-color printing, sized to your jar or tin. Low MOQ 100, free design support, fast turnaround.` (142)

> **Action for whoever implements:** kill the duplicated boilerplate descriptions in `content/products.json` (every cosmetics draft currently shares the same "Beauty-grade … genuine shelf appeal in your exact" sentence — Google treats this as templated/thin). Each meta above is unique.

---

## 4. On-page recommendations

### 4.1 Universal page skeleton (every product page in this segment)
- **One `<h1>`** = the entity name (e.g. "Custom Lip Balm Boxes"). The live-site "marketing H1" becomes an H2 (matches `CONTENT_GUIDELINES`).
- **H2 sections (recommended order):**
  1. `Custom [Product] Boxes Built to Your Spec` — intro paragraph (60–120 words, **unique per page**, naming the exact product the box holds + 2–3 use cases).
  2. `Box Styles & Sizes` — list relevant structures (tuck-end, sleeve, two-piece, rigid, window, hanging/peg) + "made to your exact dimensions."
  3. `Materials & Finishes` — stocks (kraft, SBS/cardboard, rigid, eco/recycled) + finishes (soft-touch / matte / gloss lamination, foil stamping, embossing, debossing, spot UV, die-cut windows, inserts).
  4. `Why Brands Choose Vital` — value props (low MOQ 100, free design support, free US shipping, fast turnaround). **No prices, no rating badges.**
  5. `How to Order` — quote → proof → production → ship (align to the global order-process copy; do not invent SLAs that conflict with globals).
  6. `Frequently Asked Questions` — see §4.3 (drives FAQPage schema).
  7. Related products block (see §6).
- **Word count target:** 400–600 words of unique copy per flagship product page. Long-tail/secondary products can run 250–400.

### 4.2 Category-page structure
- One H1 = category name. H2s: sub-product grid ("Shop by Product"), "Popular Styles & Finishes", "Industries We Serve" (cosmetics: indie beauty, skincare, salons, subscription boxes; candle: chandlers, gift/boutique, wholesale lines), category FAQ, internal links to flagship products.
- Cosmetics + Candle categories should **name-check their sub-products in body copy** (top competitors do this — it captures the "X boxes" long-tails and feeds internal links).

### 4.3 FAQ sets (3–5 Qs each → FAQPage schema)
Reuse the `custom-soap-boxes` pattern already live. **Do NOT repeat the identical Q on every page** (`CONTENT_GUIDELINES` §4) — each gets ≥2 product-specific Qs. Suggested sets:

**custom-lip-balm-boxes**
1. What sizes do you offer for lip balm tubes and pots? (made-to-size answer)
2. Can I get a window or kraft lip balm box?
3. What's the minimum order quantity? (MOQ 100, smaller pilot runs on request)
4. Can you print my logo and brand colors? (full-color CMYK + Pantone, foil)
5. Do you offer design help if I don't have a dieline? (yes, free design support)

**custom-perfume-boxes**
1. What inserts protect glass perfume bottles in transit? (foam/cardboard/molded inserts, custom-fitted)
2. Do you offer rigid (set-up) perfume boxes for luxury lines?
3. What luxury finishes are available? (foil, embossing, spot UV, soft-touch)
4. What's the MOQ for custom perfume boxes?
5. Can you match my brand's Pantone colors?

**custom-makeup-boxes**
1. Can you make multi-product makeup kit / palette boxes with inserts?
2. What box styles work best for makeup retail vs. subscription?
3. What's the MOQ and turnaround?
4. Do you offer eco-friendly stocks for clean-beauty brands?

**custom-soap-boxes** (already live — keep; optionally add) 
- Add: "Do you make boxes for handmade / cold-process soap odd sizes?" and "Do you offer soap sleeves / belly bands as a lower-cost option?" (cross-sells `custom-soap-sleeves`).

**custom-candle-boxes** (category already has 5 live FAQs — keep). For flagship candle products, give each its own 3–4:
- **luxury-candle-boxes:** rigid vs. cardboard? magnetic closure options? foil/embossing? MOQ?
- **window-candle-boxes:** window material/PVC-free options? does the window fit any jar size? MOQ?
- **kraft-candle-boxes:** are kraft boxes recyclable/eco-friendly? print options on kraft? MOQ?

**CBD / Tobacco ⚠ FAQs — compliance-safe templates only.** Allowed topics: box materials, child-resistant **closure options** ("designed to help meet state/packaging requirements"), warning-label **panel space**, tamper-evidence, inserts, MOQ, turnaround, design help. **Forbidden:** any product effect, dosage, health/medical/therapeutic claim, "smell-proof guarantee," anything implying the box itself ensures legal compliance, or youth-appealing framing.
- **custom-vape-boxes:** "Do you offer child-resistant closure options?" → "We offer child-resistant closure options **designed to help** licensed brands meet packaging requirements; final regulatory compliance, including labeling, remains the brand's responsibility." / "Is there room for required warning panels?" / "What's the MOQ?"
- **cbd-oil-boxes:** "Can the box include a dropper-bottle insert?" / "Do you offer child-resistant options?" (same hedged phrasing) / "Can I print my brand panel and required labeling area?"

### 4.4 Alt-text guidance
- Pattern: `"<Product name> — <key visual detail>"`, ≤125 chars, **no keyword stuffing**, one keyword max.
  - Good: `"Custom lip balm boxes with kraft finish and die-cut window"`, `"Rigid luxury candle box with gold foil logo and magnetic lid"`.
  - Bad: `"custom lip balm boxes wholesale cheap lip balm packaging buy lip balm boxes"`.
- Decorative/repeated thumbnails: empty alt (`alt=""`) so screen readers skip them.
- Hero image alt should include the entity once; gallery images describe the **specific finish/style shown**.
- ⚠ CBD/tobacco images: alt text describes the **box** only ("child-resistant cbd oil box with dropper insert"), never the product's effect.

---

## 5. Compliance guardrails (CBD + Tobacco) ⚠ — must-follow

Per `CONTENT_GUIDELINES.md` §7 and the segment brief. Applies to all `custom-cbd-boxes` and `custom-tobacco-packaging` pages.

**Required disclaimer line** in the footer of these 2 categories **and each of their product pages**:
> *Vital Custom Boxes supplies packaging exclusively to legally operating businesses. Regulatory compliance of the packaged product, including labeling and warnings, remains the responsibility of the brand.*

**Wording rules:**
| Avoid | Use instead |
|---|---|
| Health / medical / therapeutic claims ("relieves," "calming," "wellness benefits") | Describe the **box only** — materials, panels, inserts, finishes. Zero product-effect claims (FDA). |
| "Child-resistant" stated as a guarantee | "Child-resistant **options designed to help** licensed brands meet state/packaging requirements." |
| "Compliant packaging" (implies the box makes the brand legal) | "warning-panel-ready," "accommodates required warning labels"; compliance stays the brand's responsibility. |
| Consumer hype ("enhance your cannabis high," "best weed packaging") | "packaging for licensed cannabis/hemp brands in regulated markets." |
| Youth-appealing tobacco/vape copy or imagery | "for licensed **adult** tobacco brands." |
| Slang in titles/metas/H1s | Keep product slugs that are real search terms (e.g. `custom-delta-8-boxes`) but use clean, compliant body copy. |
| "Smell-proof" as a guarantee | Describe materials/closures factually; avoid absolute performance guarantees. |

**Schema note:** Product schema on these pages must **not** carry health-related properties; keep it to name/image/description/brand (and no aggregateRating/offers per global rule).

---

## 6. Internal-linking plan (topical authority within the segment)

Goal: build tight hub-and-spoke clusters so each category page is the authority hub and products interlink by relevance. The `related` field in `content/products.json` should be curated (today `custom-soap-boxes.related` is a sensible example: perfume, makeup, lipstick).

**Hubs (category → products):** each category page links down to all its products (already structural via `productSlugs`). Ensure the reverse — every product links **up** to its category in breadcrumb + a contextual in-copy link ("part of our [custom cosmetic boxes] range").

**Cosmetics cluster (intra-links via `related`, 3–4 each):**
- lip-balm ↔ lip-gloss ↔ lipstick (lip cluster)
- mascara ↔ eyeliner ↔ eyeshadow (eye cluster)
- lotion ↔ cream ↔ serum (skincare cluster)
- perfume ↔ makeup ↔ lipstick (luxury/retail cluster)
- press-on-nail ↔ nail-polish (nail cluster)
- soap-boxes ↔ soap-sleeves (cross-sell box↔sleeve; soap also → kraft candle for the eco/handmade audience)

**CBD cluster ⚠:** cbd-oil ↔ cbd-tincture ↔ cbd-gummies; hemp ↔ delta-8; pre-roll-cbd ↔ cbd-display. Keep links **within** the regulated cluster (avoid linking a CBD product into a non-regulated lifestyle page in a way that reads as consumer promotion).

**Tobacco cluster ⚠:** vape ↔ vape-cartridge ↔ e-cigarette; pre-roll ↔ pre-roll-display; cigar ↔ cigarette. CBD pre-roll and tobacco pre-roll may cross-link **only** with compliant, B2B framing.

**Candle cluster:** cardboard ↔ kraft ↔ window (everyday); luxury ↔ rigid ↔ two-piece (premium); window-candle ↔ luxury-candle (upsell).

**Cross-cluster (use sparingly, only where genuinely relevant):** soap (eco) → kraft candle (eco); perfume → luxury candle (both rigid/luxury gifting). Don't force links across unrelated regulated/non-regulated lines.

**Anchor text:** use descriptive, varied anchors ("kraft soap boxes," "rigid luxury candle boxes"), not repeated exact-match ("custom soap boxes" on every link).

---

## 7. Prioritized action checklist (highest ROI first)

1. **[P0] De-duplicate the boilerplate descriptions.** Every cosmetics `draft` product shares an identical sentence → thin/templated content risk. Write 400–600 unique words per flagship (lip-balm, lip-gloss, mascara, perfume, makeup, lipstick, soap, soap-sleeves) and 250–400 for the rest. **Biggest single ranking lever.**
2. **[P0] Add FAQ blocks (3–5 Qs) to every flagship product** using §4.3 sets → unlocks FAQPage schema sitewide (only soap + candle category have it today). Highest-impact rich-result + content-depth win.
3. **[P0] Apply the paste-ready titles + metas (§3).** Current titles are fine but metas are duplicated boilerplate; unique metas lift CTR. Verify all ≤60/≤160 after paste.
4. **[P1] Lock down CBD/Tobacco compliance (§5):** add the disclaimer line to all 17 regulated pages, scrub any health/guarantee wording, hedge all "child-resistant" mentions. Do this **before** pushing those pages for indexing — protects the whole domain.
5. **[P1] Curate `related` links per §6** so clusters interlink (most products' `related` are currently auto-derived or empty). Cheap, compounding topical-authority gain.
6. **[P1] Add `Wholesale` to titles where it fits** and lead body copy with the exact head keyword; ensure single H1 per page (live site historically shipped double H1s).
7. **[P2] Category-page sub-product name-checks + "Industries We Serve"** copy on Cosmetics, Candle, CBD, Tobacco categories to capture long-tails and feed internal links.
8. **[P2] Alt-text pass (§4.4)** across all segment images; empty alt on decorative thumbnails; compliant alts on regulated images.
9. **[P2] Soap handmade/artisan long-tail play:** dedicate copy + 2 FAQs to handmade/cold-process/kraft/eco soap on `custom-soap-boxes` and `custom-soap-sleeves` — softest, high-conversion niche in the segment.
10. **[P3] Verify sitemap + canonicals** include all new/updated product URLs (trailing-slash form) once copy ships; confirm Product schema carries no ratings/offers and regulated pages carry no health properties.

---

## Appendix — segment inventory snapshot (from `content/*.json`, 2026-06-14)

- **Cosmetics** (`custom-cosmetics-boxes`, 21 products): soap-boxes `live` w/5 FAQs; perfume/makeup/lipstick/serum/nail-polish `derived`; lip-balm, lip-gloss, mascara, eyeliner, eyeshadow, lotion, cream, press-on-nail, soap-sleeves `draft`. **All non-soap products: 0 FAQs, duplicated descriptions.**
- **CBD** ⚠ (`custom-cbd-boxes`, `regulated:true`, 10 products): all `draft`/`derived`, **0 product-level FAQs**, category has compliant `description`.
- **Tobacco** ⚠ (`custom-tobacco-packaging`, `regulated:true`, 9 products): all `draft`/`derived`, **0 product-level FAQs**.
- **Candle** (`custom-candle-boxes`, 9 products): category `live` w/5 FAQs; cardboard/luxury/kraft `live` but **0 product-level FAQs**; rigid/window `draft`.
- **No standalone soap category** — soap lives inside cosmetics (`custom-soap-boxes`, `custom-soap-sleeves`, plus `custom-soap-wrapping-paper`, `custom-soap-cigar-bands`).
- Existing teammate SEO docs to stay consistent with: `docs/seo/KEYWORD_META_MAP.md`, `CONTENT_GUIDELINES.md`, `TECH_SEO.md`, `SEO_VERIFICATION.md`. (Those predate the Vital rebrand and show the legacy suffix — use `| Vital Custom Boxes` here.)
