# SEO PLAYBOOK #1 — Rigid · Gift · Retail · Display · Apparel · Jewelry/PR/Blind/Ornament/Gift-Card

**Owner:** SEO Specialist #1 · **Date:** 2026-06-14 · **Brand:** Vital Custom Boxes (vitalcustomboxes.com)
**Scope:** 5 categories + 51 product pages = **56 pages** in this segment.
**Goal:** Implementation-ready plan to push these pages into the top 10 for their head and long-tail queries.
**Model:** Quote-only / lead-gen (no prices, no cart). MOQ 100. Free US shipping. 7–12 business-day production. Free design support.

> **Cross-doc alignment:** Conventions here match the existing `docs/seo/KEYWORD_META_MAP.md` (title pattern, value-prop set, single-H1 rule, FAQPage-only-where-rendered, Product schema **without** aggregateRating/offers). That doc still carries the old brand "HM Custom Packaging" and stops at the 22 **category** pages — this playbook (a) re-states every meta with the **Vital Custom Boxes** suffix, and (b) adds the **product-level** depth that doc does not cover. Where they overlap (the 5 category metas), treat the strings in **this** file as the corrected, on-brand version.

---

## 0. Pages in scope (audited from `content/products.json` + `content/categories.json`)

**Categories (5):** `custom-rigid-boxes`, `custom-gift-boxes`, `custom-retail-boxes`, `custom-display-boxes`, `custom-apparel-boxes`.

**Rigid (11 products):** custom-drawer-boxes, custom-two-piece-boxes, custom-slipcase-boxes, custom-neck-shoulder-boxes, custom-book-style-boxes, two-piece-rigid-boxes, custom-book-style-rigid-boxes, custom-rigid-drawer-boxes, shoulder-neck-rigid-boxes, magnetic-rigid-boxes, custom-collapsible-rigid-boxes.

**Gift / jewelry / PR / blind / ornament / gift-card (15):** custom-pillow-boxes, custom-jewelry-boxes, custom-corporate-gift-boxes, custom-magnetic-closure-gift-boxes, custom-mug-boxes, custom-pyramid-boxes, custom-anklet-boxes, custom-earring-cards, custom-gift-card-boxes, custom-ornament-boxes, custom-pr-boxes, custom-blind-boxes (+ category page custom-gift-boxes itself, and the rigid magnetic crossover).

**Retail (12):** custom-tuck-top-boxes, custom-tongue-lock-boxes, custom-roll-end-tuck-front-boxes, custom-reverse-tuck-boxes, custom-flip-top-boxes, custom-sleeves-boxes, custom-auto-bottom-boxes, custom-auto-lock-tuck-top-boxes, custom-window-boxes, custom-boxes-with-handles, custom-perforated-boxes, custom-holographic-boxes, custom-presentation-boxes, custom-invitation-boxes.

**Display (8):** custom-display-boxes, custom-retail-display-boxes, custom-gravity-dispenser-box, custom-hanging-tab-boxes, custom-corrugated-display-boxes, custom-cardboard-display-boxes, custom-counter-display-boxes.

**Apparel (9):** custom-garments-boxes, custom-clothing-boxes, custom-hat-boxes, custom-shoe-boxes, custom-t-shirt-boxes, custom-tie-boxes, custom-shirt-boxes, custom-sock-packaging, custom-hang-tags.

> **Data-quality flag (fix first — see §8):** PR, blind, ornament, and gift-card box descriptions in `products.json` are **near-identical boilerplate** ("Premium [x] boxes with magnetic closures, rigid structures, and luxe finishes that turn every unboxing into a memorable, share-worthy gifting moment for your brand."). Duplicate body copy across four URLs caps all four below the top 10. This is the single highest-leverage fix in the segment.

---

## 1. Competitive landscape (research 2026-06-14)

Queries sampled: *custom rigid boxes wholesale, custom gift boxes wholesale, custom retail boxes, custom display boxes countertop, custom jewelry boxes, custom PR boxes influencer, custom apparel boxes, luxury magnetic closure rigid boxes.*

**Who ranks:** Blue Box Packaging, OXO Packaging, Ibex Packaging, Custom Boxes Market, Premium Custom Boxes, The Custom Boxes, IMH Packaging, EmenacPackaging, WeCustomBoxes, ZenPack, Box Genie, PrintPlace, Packaging Bee. Almost all are quote-driven B2B packaging sites with the same value props we have (low MOQ, free design, free shipping, fast turnaround).

**What the top-ranking page actually does** (teardown of Blue Box `/product/rigid-boxes/`, a consistent top-3 result for "custom rigid boxes"):
- **Title:** `Custom Rigid Boxes | Printed Rigid Packaging Wholesale` — head keyword first, one differentiator, no over-stuffing.
- **Meta:** `Elegant custom rigid boxes for premium brands. Strong, stylish & made to impress. Free design support.` (~100 chars).
- **Body depth ≈ 1,400–1,600 words**, structured as: definition ("rigid / setup boxes" + synonyms) → Benefits (Protection, Premium Branding, Customization, Unboxing, Reusable) → "A Must for Luxury Brands Across Industries" (10 industry bullets, each internally linked) → "How Rigid Boxes Strengthen Brand Identity" → "Features of Our Printed Rigid Boxes" → "Offset Printing" trust block → "Your Trusted Rigid Box Manufacturer."
- **Visual spec grids** (each item = image + 2-line caption): **Box Styles** (magnetic, two-piece, drawer, hinged-lid, collapsible, shoulder-neck, book-style, telescoping), **Materials** (SBS C1S, SBS C2S, white kraft, brown kraft, textured, black kraft, metallic, holographic), **Add-ons** (foiling, emboss, deboss, spot UV), **Finishes** (gloss, matte, soft-touch, pearlescent). These grids are *internal links to the individual style/product pages* and are a big part of why the hub ranks.
- **FAQ: 12 questions** (used for FAQPage schema). Covers: what they're used for, customization, finishes, inserts, MOQ, turnaround, samples, eco, pre-assembled vs flat, vs folding cartons, logo printing, shipping coverage.
- **Reviews block** with named reviewers + dates (social proof; they risk fabricated-rating schema — *we will NOT copy this*, per our no-fabricated-rating rule).
- **Dense internal linking:** mega-menu links every box style; in-body links to luxury-boxes category, gift boxes, magnetic closure boxes, jewelry boxes; "Related Products" row of 4.

**Intent read across the segment:** every head term is **commercial / transactional B2B** (a brand owner shopping suppliers). Informational intent only appears in *modifier* long-tails ("how to measure a box", "rigid vs folding carton", "what is a setup box", "minimum order"). Win commercial pages with depth + spec grids + internal links; capture informational long-tails inside FAQ blocks and a small set of supporting blog posts.

**The gap we exploit:** competitors win on content depth and internal linking, but their pages are generic and keyword-thin on *sub-styles*. Vital already has dedicated URLs for 51 individual box styles — most competitors fold these into one rigid/retail hub. If each of our style pages gets unique 600–900-word copy + its own FAQ + clean internal links up to the category hub, we can out-rank them on the long-tail style queries (e.g. "neck and shoulder rigid box", "auto-lock tuck top box", "gravity feed dispenser box") where competition is thin, and use that topical cluster to lift the category heads.

---

## 2. Keyword map

Difficulty is a rough relative read (Low / Med / High) for this niche B2B SERP, not a tool metric. Intent: **C** = commercial/transactional, **I** = informational.

### 2.1 Custom Rigid Boxes (`custom-rigid-boxes`)
- **Primary:** custom rigid boxes *(C, High)*
- **Secondary:** custom rigid boxes wholesale *(C, High)* · rigid setup boxes *(C, Med)* · luxury rigid boxes *(C, Med)*
- **Long-tail:** custom rigid boxes with magnetic lid *(C, Med)* · rigid boxes no minimum / low MOQ *(C, Low)* · what is a rigid setup box *(I, Low)* · rigid box vs folding carton *(I, Low)* · collapsible rigid boxes wholesale *(C, Low)*
- **Flagship product children:** **magnetic-rigid-boxes** → "magnetic rigid boxes / magnetic closure rigid box" *(C, Med)*; **custom-drawer-boxes / custom-rigid-drawer-boxes** → "rigid drawer box / sliding drawer box" *(C, Med)*; **shoulder-neck-rigid-boxes / custom-neck-shoulder-boxes** → "neck and shoulder box" *(C, Low)*; **custom-book-style-rigid-boxes** → "book style rigid box" *(C, Low)*; **two-piece-rigid-boxes** → "two piece rigid box / lid and base box" *(C, Low)*; **custom-slipcase-boxes** → "slipcase box / slipcover box" *(C, Low)*; **custom-collapsible-rigid-boxes** → "collapsible / foldable rigid box" *(C, Low)*.

> **Dedupe note:** the catalog contains two near-parallel sets — `custom-drawer-boxes`/`custom-rigid-drawer-boxes`, `custom-neck-shoulder-boxes`/`shoulder-neck-rigid-boxes`, `custom-two-piece-boxes`/`two-piece-rigid-boxes`, `custom-book-style-boxes`/`custom-book-style-rigid-boxes`. These are internal-cannibalization risks. **Recommendation:** keep ONE canonical URL per concept and 301 the weaker duplicate into it (see `docs/seo/REDIRECTS.md`), OR differentiate intent hard (e.g. `custom-drawer-boxes` = generic drawer/sliding boxes incl. cardboard; `custom-rigid-drawer-boxes` = rigid-only, premium). Do not leave both with thin near-identical copy.

### 2.2 Custom Gift Boxes (`custom-gift-boxes`)
- **Primary:** custom gift boxes *(C, High)*
- **Secondary:** custom gift boxes wholesale *(C, High)* · custom gift boxes with logo *(C, Med)* · luxury gift packaging *(C, Med)*
- **Long-tail:** custom gift boxes for small business *(C, Low)* · custom gift boxes with magnetic lid *(C, Med)* · branded gift boxes bulk *(C, Low)* · custom gift boxes with ribbon and insert *(C, Low)* · how to package a gift for retail *(I, Low)*
- **Flagship children:**
  - **custom-jewelry-boxes** — primary "custom jewelry boxes"; secondary "jewelry boxes with logo / jewelry packaging wholesale"; long-tail "ring box / necklace box / earring box / velvet jewelry box wholesale". *(C, High)*
  - **custom-magnetic-closure-gift-boxes** — "magnetic closure gift boxes / magnetic gift box with lid". *(C, Med)*
  - **custom-corporate-gift-boxes** — "corporate gift boxes / custom branded corporate gift box / employee welcome box". *(C, Med)*
  - **custom-pr-boxes** — "custom PR boxes / influencer PR box / media kit box / product launch box". *(C, Med)* — high social/marketing intent.
  - **custom-blind-boxes** — "custom blind boxes / mystery box packaging / blind box mystery toy". *(C, Med, rising)*
  - **custom-ornament-boxes** — "custom ornament boxes / Christmas ornament packaging / glass ornament box". *(C, Low–Med, seasonal)*
  - **custom-gift-card-boxes** — "custom gift card boxes / gift card packaging / gift card holder box". *(C, Low)*
  - **custom-pillow-boxes** — "custom pillow boxes / pillow box packaging / favor pillow boxes". *(C, Med)*
  - **custom-mug-boxes** — "custom mug boxes / mug gift box with insert". *(C, Low)*
  - **custom-pyramid-boxes** — "pyramid boxes / triangle favor box". *(C, Low)*
  - **custom-anklet-boxes / custom-earring-cards** — "anklet box", "earring display cards / earring backer cards". *(C, Low — thin competition, easy wins)*

### 2.3 Custom Retail Boxes (`custom-retail-boxes`)
- **Primary:** custom retail boxes *(C, High)*
- **Secondary:** custom retail packaging *(C, Med)* · retail boxes with logo *(C, Med)* · shelf-ready retail boxes *(C, Low)*
- **Long-tail:** custom retail boxes wholesale *(C, Med)* · folding carton box styles *(I/C, Low)* · custom retail boxes small business *(C, Low)* · retail box with window *(C, Low)*
- **Flagship children (folding-carton style queries — mostly Low competition, fast wins):** custom-tuck-top-boxes ("tuck top box / straight tuck end box"), custom-reverse-tuck-boxes ("reverse tuck end box"), custom-auto-lock-tuck-top-boxes ("auto-lock bottom box / 1-2-3 bottom"), custom-auto-bottom-boxes ("auto bottom box"), custom-roll-end-tuck-front-boxes ("roll end tuck front / RETF mailer"), custom-tongue-lock-boxes, custom-flip-top-boxes, custom-sleeves-boxes ("sleeve box / packaging sleeves"), custom-window-boxes ("window boxes / die-cut window packaging" — *Med*), custom-boxes-with-handles ("boxes with handles / carry boxes"), custom-perforated-boxes ("perforated tear-away box"), custom-holographic-boxes ("holographic boxes" — *Med, visual-led*), custom-presentation-boxes ("presentation boxes" — *Med*), custom-invitation-boxes ("invitation boxes / wedding invitation packaging" — *Low–Med, seasonal*).

### 2.4 Custom Display Boxes (`custom-display-boxes`)
- **Primary:** custom display boxes *(C, High)*
- **Secondary:** countertop display boxes *(C, Med)* · counter display boxes wholesale *(C, Med)* · POS display boxes *(C, Low)*
- **Long-tail:** cardboard countertop display boxes *(C, Med)* · corrugated display boxes wholesale *(C, Low)* · custom display boxes for retail counter *(C, Low)* · gravity feed dispenser box *(C, Low)* · hang tab display boxes *(C, Low)*
- **Flagship children:** custom-counter-display-boxes ("counter display box / PDQ tray"), custom-corrugated-display-boxes, custom-cardboard-display-boxes, custom-retail-display-boxes, custom-gravity-dispenser-box ("gravity feed dispenser / gravity fed display box" — *Low, thin competition*), custom-hanging-tab-boxes ("hang tab boxes / euro-slot hang tab").

> **Dedupe note:** `custom-display-boxes` and `custom-retail-display-boxes` currently share **identical** descriptions in `products.json`. Differentiate (`custom-display-boxes` = the category hub / all display styles; `custom-retail-display-boxes` = retail/PDQ floor + counter standees) or 301 one into the other.

### 2.5 Custom Apparel Boxes (`custom-apparel-boxes`)
- **Primary:** custom apparel boxes *(C, Med–High)*
- **Secondary:** custom clothing boxes *(C, Med)* · apparel packaging wholesale *(C, Med)* · garment boxes with logo *(C, Low)*
- **Long-tail:** custom shirt boxes wholesale *(C, Med)* · custom shoe boxes with logo *(C, Med)* · custom t-shirt boxes *(C, Med)* · custom hat boxes wholesale *(C, Low)* · custom sock packaging *(C, Low)* · custom tie boxes *(C, Low)*
- **Flagship children:** custom-shirt-boxes / custom-clothing-boxes / custom-garments-boxes (consolidate — three near-synonyms; see dedupe), custom-shoe-boxes, custom-t-shirt-boxes, custom-hat-boxes, custom-tie-boxes, custom-sock-packaging, custom-hang-tags ("custom hang tags / clothing tags / swing tags" — *Med, strong cross-sell magnet*).

---

## 3. Flagship titles + meta descriptions (ready to paste)

Pattern: `<Head Keyword> [Wholesale] | Vital Custom Boxes` (suffix " | Vital Custom Boxes" = 21 chars; keep the lead ≤39 chars). Each meta ≤160 chars, weaves ≥2 value props (free US shipping · low 100-box MOQ · free design support), and reflects the page's true intent.

### Category pages
| Slug | Title (≤60) | Meta (≤160) |
|---|---|---|
| custom-rigid-boxes | Custom Rigid Boxes Wholesale \| Vital Custom Boxes | Luxury custom rigid setup boxes with magnetic lids, foil and soft-touch finishes for premium brands. Free design support, 100-box MOQ, free US shipping. |
| custom-gift-boxes | Custom Gift Boxes Wholesale \| Vital Custom Boxes | Custom gift boxes with logo, ribbon and inserts that make every order feel like a gift. Free design support, low 100-box MOQ and free US shipping. |
| custom-retail-boxes | Custom Retail Boxes Wholesale \| Vital Custom Boxes | Shelf-ready custom retail boxes in every folding-carton style, printed to your brand. Free US shipping, low 100-box MOQ and free design support. |
| custom-display-boxes | Custom Display Boxes Wholesale \| Vital Custom Boxes | Counter and POS custom display boxes that sell your product at the shelf. Free design support, low 100-box MOQ and free US shipping. |
| custom-apparel-boxes | Custom Apparel Boxes Wholesale \| Vital Custom Boxes | Pack shirts, shoes and streetwear in custom apparel boxes with your logo. Free US shipping, low 100-box MOQ and free design support. |

### Flagship product pages
| Slug | Title (≤60) | Meta (≤160) |
|---|---|---|
| magnetic-rigid-boxes | Magnetic Rigid Boxes \| Vital Custom Boxes | Luxury magnetic-closure rigid boxes in thick wrapped chipboard for jewelry, tech and gifting. Free design support, 100-box MOQ, free US shipping. |
| custom-jewelry-boxes | Custom Jewelry Boxes Wholesale \| Vital Custom Boxes | Custom jewelry boxes with inserts and luxe finishes for rings, necklaces and earrings. Free design support, low 100-box MOQ and free US shipping. |
| custom-pr-boxes | Custom PR Boxes for Brands \| Vital Custom Boxes | Custom PR and influencer boxes built for share-worthy unboxings and product launches. Free design support, low 100-box MOQ and free US shipping. |
| custom-corporate-gift-boxes | Custom Corporate Gift Boxes \| Vital Custom Boxes | Branded corporate gift boxes for clients, onboarding and events. Magnetic and rigid builds, free design support, 100-box MOQ, free US shipping. |
| custom-magnetic-closure-gift-boxes | Magnetic Closure Gift Boxes \| Vital Custom Boxes | Custom magnetic-closure gift boxes with a satisfying snap-shut lid and luxe finishes. Free design support, low 100-box MOQ and free US shipping. |
| custom-blind-boxes | Custom Blind Boxes Wholesale \| Vital Custom Boxes | Custom blind and mystery boxes that drive collectible hype and repeat buys. Free design support, low 100-box MOQ and free US shipping. |
| custom-ornament-boxes | Custom Ornament Boxes \| Vital Custom Boxes | Custom ornament boxes that protect delicate glass and lift holiday gifting. Free design support, low 100-box MOQ and free US shipping. |
| custom-gift-card-boxes | Custom Gift Card Boxes \| Vital Custom Boxes | Custom gift card boxes and holders with magnetic lids and foil branding. Free design support, low 100-box MOQ and free US shipping. |
| custom-counter-display-boxes | Counter Display Boxes Wholesale \| Vital Custom Boxes | Custom counter display boxes and PDQ trays that win impulse buys at checkout. Free design support, low 100-box MOQ and free US shipping. |
| custom-gravity-dispenser-box | Gravity Feed Dispenser Boxes \| Vital Custom Boxes | Custom gravity-feed dispenser boxes that auto-advance stock and keep shelves full. Free design support, 100-box MOQ and free US shipping. |
| custom-window-boxes | Custom Window Boxes Wholesale \| Vital Custom Boxes | Custom window boxes with die-cut PVC panels that show off your product on shelf. Free design support, low 100-box MOQ and free US shipping. |
| custom-tuck-top-boxes | Custom Tuck Top Boxes Wholesale \| Vital Custom Boxes | Custom tuck-top folding cartons in any size, ship-flat and assemble fast. Free design support, low 100-box MOQ and free US shipping. |
| custom-shirt-boxes | Custom Shirt Boxes Wholesale \| Vital Custom Boxes | Retail-ready custom shirt boxes from kraft-minimal to foil-stamped luxury. Free design support, low 100-box MOQ and free US shipping. |
| custom-shoe-boxes | Custom Shoe Boxes Wholesale \| Vital Custom Boxes | Custom shoe boxes printed to your brand with sturdy retail-ready builds. Free design support, low 100-box MOQ and free US shipping. |
| custom-hang-tags | Custom Hang Tags Wholesale \| Vital Custom Boxes | Custom hang tags and swing tags with foil, string and die-cut shapes for apparel. Free design support, low minimums and free US shipping. |
| custom-pillow-boxes | Custom Pillow Boxes Wholesale \| Vital Custom Boxes | Custom pillow boxes for favors, retail and gifting in any size and finish. Free design support, low 100-box MOQ and free US shipping. |
| custom-slipcase-boxes | Custom Slipcase Boxes \| Vital Custom Boxes | Custom slipcase and slipcover boxes that sheath rigid trays in a premium sleeve. Free design support, low 100-box MOQ and free US shipping. |

*(Apply the same pattern to remaining product children: lead with the exact style keyword, one qualifier, brand suffix; meta states the use-case + 2 value props.)*

---

## 4. On-page blueprint (per page)

This mirrors the depth that out-ranks us today, adapted to our quote-only model (no prices, no fabricated ratings).

### 4.1 Heading structure (single H1)
- **H1 (exactly one):** the entity name (e.g. `Custom Rigid Boxes`). The live site's second "marketing H1" must become an H2 — confirmed pattern in `KEYWORD_META_MAP.md`.
- **H2 sections (recommended order):**
  1. `What Are [Product]?` — definition + synonyms (e.g. "rigid boxes, also called setup boxes"). 60–120 words. Front-loads the keyword + semantic variants.
  2. `Why Choose Custom [Product]?` / `Benefits` — 4–6 bullets (Protection, Premium Branding, Customization, Unboxing Experience, Reusable/Durable, Shelf Appeal).
  3. `[Product] Styles` *(category hubs)* OR `Customization Options` *(product pages)* — visual spec grid (image + 2-line caption), each tile linking to the child style page.
  4. `Materials & Stocks` — SBS C1S/C2S, kraft (white/brown/black), corrugated/E-flute (display/retail), rigid chipboard (rigid/gift), textured, metallic, holographic. Grid format.
  5. `Finishes & Add-ons` — matte, gloss, soft-touch, spot UV, foil stamping, emboss, deboss, ribbon, magnetic closure, inserts (foam/velvet/molded pulp).
  6. `Industries We Serve` *(rigid/gift/display)* — 6–10 linked bullets (beauty, jewelry, watches, electronics, gourmet food, corporate gifts, fashion/apparel, toys/collectibles, wellness).
  7. `How It Works` — Get Free Quote → Material Selection → Artwork/Free Design → Production (matches site's existing order-process module).
  8. `Why Choose Vital Custom Boxes` — free design support · MOQ from 100 · 7–12 business-day turnaround · free US shipping. (No fabricated review counts.)
  9. `Frequently Asked Questions` — renders the FAQ block that powers FAQPage schema (see §5).
- **Word-count target:** category hubs **1,200–1,600 words**; product/style pages **600–900 words** of *unique* copy (the dedupe fix in §8 makes this real, not boilerplate).

### 4.2 Content sections to ADD (gaps vs competitors)
- A **definition/synonym paragraph** on every page (we are thin here; competitors all open with "also known as…").
- **Spec grids as internal links** — currently styles are listed but under-linked; turn each material/style/finish tile into a link to its dedicated page.
- A **comparison block** on 2–3 hub pages to capture informational long-tails: "Rigid Box vs Folding Carton", "Tuck-Top vs Auto-Lock Bottom", "Counter Display vs Floor Display". Each ~120 words; great for featured snippets.
- **Use-case / industry bullets** with internal links (rigid → jewelry, corporate-gift, magnetic; retail → window, sleeve; display → counter, gravity-dispenser).
- A short **"How to measure your box"** helper link (sitewide resource) — competitors all have one; supports the "box size" long-tails.

### 4.3 Per-product FAQ questions (3–5 each) for FAPPage schema
Answers must use the global SLA: **MOQ 100 · 7–12 business days · free US shipping · free design support** (do NOT reintroduce the old "2–3 weeks" / "no minimum" conflicts the audit flagged). Render the FAQ visibly — FAQPage schema only where it renders.

**custom-rigid-boxes (hub):**
1. What are rigid boxes used for? 2. Can I customize the size, style and closure? 3. What finishes are available (foil, soft-touch, magnetic)? 4. Do you provide inserts (foam/velvet)? 5. What is the MOQ and turnaround? *(100 boxes; 7–12 business days; free US shipping.)*

**magnetic-rigid-boxes:**
1. How does the magnetic closure work and how strong is it? 2. What products suit magnetic rigid boxes (jewelry, tech, gifting)? 3. Can magnetic rigid boxes ship flat/collapsible? 4. What finishes pair best (soft-touch, foil)? 5. What's the MOQ and lead time?

**custom-jewelry-boxes:**
1. What insert options protect rings, necklaces and earrings? 2. Can I get velvet or foam linings? 3. Do you make two-piece, drawer and flip-top jewelry boxes? 4. Can you foil-stamp or emboss my logo? 5. What's the MOQ and turnaround?

**custom-pr-boxes:**
1. What makes a PR box "unboxing-worthy" for influencers? 2. Can you add inserts, tissue, cards and stickers? 3. What's the smallest run for a launch/seeding campaign? *(MOQ 100.)* 4. Do you offer magnetic or rigid builds? 5. How fast can a launch box ship?

**custom-corporate-gift-boxes:**
1. Can you produce branded onboarding/client gift boxes at volume? 2. Do you offer magnetic and rigid options? 3. Can you match exact brand Pantone colors? 4. What inserts hold multiple items? 5. What's the MOQ and lead time?

**custom-blind-boxes:**
1. What is a blind/mystery box and how is it printed? 2. Can the contents stay concealed until opening? 3. Do you do series/numbered runs? 4. What sizes and materials work for collectibles? 5. What's the MOQ?

**custom-display-boxes / custom-counter-display-boxes:**
1. What's the difference between counter and floor display boxes? 2. Do display boxes ship flat and assemble in-store? 3. Can you add dividers to merchandise multiple SKUs? 4. What material holds product weight (corrugated/E-flute)? 5. MOQ and turnaround?

**custom-gravity-dispenser-box:**
1. How does a gravity-feed dispenser advance stock? 2. What product sizes/weights does it suit? 3. Can it sit on a counter or shelf? 4. Material and durability? 5. MOQ and lead time?

**custom-window-boxes:**
1. What window materials are available (PVC/PET/none)? 2. Can the window be custom-shaped/die-cut? 3. Are window boxes food-safe? 4. What box styles take a window (tuck-top, sleeve)? 5. MOQ and turnaround?

**custom-tuck-top-boxes (and retail folding-carton children):**
1. What's the difference between tuck-top, reverse-tuck and auto-lock bottom? 2. Do they ship flat? 3. What's the lightest stock that still protects? 4. Can I add a window or foil? 5. MOQ and turnaround?

**custom-apparel-boxes / custom-shirt-boxes / custom-shoe-boxes:**
1. What sizes fit shirts/shoes/accessories? 2. Rigid vs folding-carton for apparel — which to choose? 3. Can you add magnetic closure and ribbon? 4. Do you also make matching hang tags? *(cross-sell link.)* 5. MOQ and turnaround?

**custom-hang-tags:**
1. What shapes, sizes and string options are available? 2. Can you foil-stamp and die-cut tags? 3. What's the minimum order? 4. Do tags ship pre-strung? 5. Turnaround?

*(Replicate the pattern for the remaining children — anchor each FAQ to that style's distinct concern: closure for magnetic/drawer, concealment for blind, seasonality for ornament/invitation, dispensing for display, material weight for retail/display.)*

### 4.4 Image alt-text guidance
- **Pattern:** `[finish/color] [box style] for [use-case]` — descriptive, keyword-aware, never stuffed. One alt per image, unique.
- Examples: `black soft-touch magnetic rigid box for jewelry`; `kraft two-piece rigid box with foam insert`; `corrugated counter display box with dividers at checkout`; `die-cut window box showing product inside`; `foil-stamped custom shirt box, open with tissue`.
- **Fix from competitor teardown:** Blue Box repeats the same generic alts ("luxury-box", "rigid-box") across 20+ images — an opportunity. Give each Vital product image a unique, specific alt naming style + material + use-case.
- File names should mirror alts (`black-magnetic-rigid-jewelry-box.png`), hyphenated, lowercase.
- The hero/product image doubles as `ogImage` (per `buildMetadata()`); make sure it's the on-brand Vital asset, not a leftover `hmcustompackaging.com` URL. **Flag:** `custom-rigid-boxes` category `imageUrl` still points to `hmcustompackaging.com/.../Custom-Rigid-Boxes.png` — migrate to the Vital asset host.

---

## 5. JSON-LD / schema notes (segment-specific)
- **Product schema:** keep `name`, `description`, `image`, `brand` — **no** `aggregateRating`, `review`, or `offers` (quote-only; no fabricated ratings/prices). This is already the house rule; do not let the competitor review-block pattern tempt a change.
- **FAQPage:** emit ONLY on pages where the FAQ block visibly renders (every flagship gets one per §4.3). Question/answer text in schema must match on-page text verbatim.
- **BreadcrumbList:** Home → Category → Product. Ensure rigid children breadcrumb under `custom-rigid-boxes`, gift/jewelry/PR/blind/ornament/gift-card under `custom-gift-boxes`, retail children under `custom-retail-boxes`, etc. (matches `category` field in `products.json`).
- **Canonical:** trailing-slash, `www`, https — already wired. Verify the duplicate-style pages (§2.1, §2.4 dedupe) don't self-canonical-compete.

---

## 6. Internal-linking plan (topical authority)

**Principle:** build tight category→child→sibling clusters, plus a few high-value cross-category bridges. Each category hub should link DOWN to all its children (via the spec grid) and each child should link UP to its hub + ACROSS to 3 siblings (the `related` array already does this — audit and improve it).

### 6.1 Category hub → children (down-links — via styles/materials grids)
- **custom-rigid-boxes** → magnetic-rigid-boxes, two-piece-rigid-boxes, custom-rigid-drawer-boxes, shoulder-neck-rigid-boxes, custom-book-style-rigid-boxes, custom-slipcase-boxes, custom-collapsible-rigid-boxes (+ resolve the drawer/two-piece/neck-shoulder/book-style duplicates first).
- **custom-gift-boxes** → custom-jewelry-boxes, custom-magnetic-closure-gift-boxes, custom-corporate-gift-boxes, custom-pr-boxes, custom-blind-boxes, custom-ornament-boxes, custom-gift-card-boxes, custom-pillow-boxes, custom-mug-boxes, custom-pyramid-boxes, custom-anklet-boxes, custom-earring-cards.
- **custom-retail-boxes** → the 14 folding-carton/style children (tuck-top, reverse-tuck, auto-lock, auto-bottom, RETF, tongue-lock, flip-top, sleeves, window, handles, perforated, holographic, presentation, invitation).
- **custom-display-boxes** → custom-counter-display-boxes, custom-corrugated-display-boxes, custom-cardboard-display-boxes, custom-retail-display-boxes, custom-gravity-dispenser-box, custom-hanging-tab-boxes.
- **custom-apparel-boxes** → custom-shirt-boxes, custom-clothing-boxes/garments (consolidate), custom-shoe-boxes, custom-t-shirt-boxes, custom-hat-boxes, custom-tie-boxes, custom-sock-packaging, custom-hang-tags.

### 6.2 High-value cross-category bridges (the topical glue)
- **magnetic-rigid-boxes ↔ custom-magnetic-closure-gift-boxes** — same closure, different category; cross-link both ways and disambiguate intent (rigid = material page; magnetic-closure-gift = use-case page) to avoid cannibalization.
- **custom-rigid-boxes → custom-jewelry-boxes / custom-corporate-gift-boxes / custom-pr-boxes** — "premium use-cases for rigid construction."
- **custom-jewelry-boxes → custom-anklet-boxes, custom-earring-cards** — jewelry sub-cluster.
- **custom-apparel-boxes ↔ custom-hang-tags** — apparel brands buying boxes also buy tags (strong cross-sell; put hang-tags in every apparel page's `related`).
- **custom-shirt-boxes / custom-t-shirt-boxes → custom-rigid-boxes** — "upgrade to a rigid presentation box" up-sell link.
- **custom-window-boxes (retail) ↔ custom-display-boxes** — window + display both serve shelf visibility.
- **custom-presentation-boxes (retail) → custom-rigid-boxes** — presentation buyers often want rigid; bridge for the premium up-sell.

### 6.3 `related` array audit (from current data)
- Current rigid `related` are reasonable (magnetic-rigid → drawer/two-piece/slipcase).
- **Fix:** PR/blind/ornament/gift-card all share the identical `related` `[pillow, jewelry, corporate-gift]`. Differentiate: blind → [pyramid, mug, corporate-gift]; ornament → [pillow, gift-card, gift-boxes]; gift-card → [pillow, jewelry, corporate-gift]; pr → [corporate-gift, magnetic-closure-gift, blind]. Identical related-sets reinforce the duplicate-content signal.
- **Add up-links:** ensure every product's `related`/breadcrumb path surfaces its category hub.

### 6.4 Supporting blog/content (informational capture)
Add 4–6 cluster posts that link DOWN into the money pages (captures I-intent long-tails competitors own via their blogs):
1. "Rigid Box vs Folding Carton: Which Packaging Is Right for Your Product?" → links rigid + retail hubs.
2. "Box Style Guide: Tuck-Top vs Auto-Lock vs Reverse Tuck" → links all retail children.
3. "How to Design a PR / Influencer Box That Gets Posted" → links custom-pr-boxes + corporate-gift.
4. "Counter Display vs Floor Display: Choosing POS Packaging" → links display children.
5. "How to Measure a Box for Custom Packaging" → links every product (sitewide resource).
6. "Luxury Packaging Finishes Explained: Foil, Soft-Touch, Spot UV, Emboss" → links rigid + gift + jewelry.

---

## 7. Tracking targets (which page → which query)
Map for the verifier / analytics:
- custom-rigid-boxes → "custom rigid boxes", "rigid setup boxes", "luxury rigid boxes"
- magnetic-rigid-boxes → "magnetic rigid boxes", "magnetic closure rigid box"
- custom-gift-boxes → "custom gift boxes", "custom gift boxes wholesale", "luxury gift packaging"
- custom-jewelry-boxes → "custom jewelry boxes", "jewelry packaging wholesale"
- custom-pr-boxes → "custom PR boxes", "influencer box", "media kit box"
- custom-retail-boxes → "custom retail boxes", "custom retail packaging"
- custom-display-boxes → "custom display boxes", "counter display boxes"
- custom-gravity-dispenser-box → "gravity feed dispenser box" (low-competition fast win)
- custom-apparel-boxes → "custom apparel boxes", "custom clothing boxes"
- custom-hang-tags → "custom hang tags", "swing tags"

---

## 8. Prioritized action checklist (highest ROI first)

1. **[CRITICAL] Kill duplicate body copy.** Rewrite unique 600–900-word copy + unique meta for the four boilerplate twins (custom-pr-boxes, custom-blind-boxes, custom-ornament-boxes, custom-gift-card-boxes) and the display twin (custom-display-boxes vs custom-retail-display-boxes). Duplicate descriptions currently block all of them from the top 10. *(Biggest, cheapest lift.)*
2. **[CRITICAL] Resolve internal cannibalization.** Pick one canonical URL for each duplicate pair (drawer/rigid-drawer, two-piece/two-piece-rigid, neck-shoulder/shoulder-neck-rigid, book-style/book-style-rigid, shirt/clothing/garments) → 301 the weaker into the winner (log in `REDIRECTS.md`), or hard-differentiate intent. Stops the pages from splitting their own ranking.
3. **[HIGH] Ship the on-page blueprint to the 5 category hubs** (§4.1): single H1, definition paragraph, benefits, **spec grids as internal links**, materials, finishes, industries, FAQ block. These hubs carry the head terms and feed authority to children.
4. **[HIGH] Add FAQ blocks (3–5 Qs) + FAQPage schema** to all flagship pages using §4.3, with the correct MOQ-100 / 7–12-day / free-shipping answers. Eliminate any lingering "2–3 weeks" / "no minimum" copy from the old site.
5. **[HIGH] Paste the §3 titles/metas** (Vital-branded) over the current ones; verify each ≤60 / ≤160 and unique. Fixes the brand-mismatch + length issues inherited from the HM build.
6. **[HIGH] Internal-linking pass** (§6): wire every category→child down-link via grids, every child→hub up-link, fix the identical `related` arrays, add the magnetic ↔ magnetic-gift and apparel ↔ hang-tags bridges.
7. **[MED] Win the easy long-tails first.** Build out the thin-competition children — custom-gravity-dispenser-box, custom-anklet-boxes, custom-earring-cards, custom-sock-packaging, the retail folding-carton styles — with unique copy + FAQ. These can reach top 10 fastest and build cluster authority.
8. **[MED] Fix image alts + file names + OG/host** (§4.4): unique descriptive alts, migrate `custom-rigid-boxes` (and any other) `imageUrl` off `hmcustompackaging.com` to the Vital asset host.
9. **[MED] Publish the 4–6 supporting blog posts** (§6.4) and link them down into the money pages to capture informational long-tails and pass internal authority.
10. **[LOW] Seasonal scheduling.** Pre-publish/refresh custom-ornament-boxes and custom-invitation-boxes ahead of Q4/wedding season; add seasonal modifiers to their FAQs and internal links.

---

### Appendix — sources (research 2026-06-14)
- Blue Box Packaging — Custom Rigid Boxes: https://www.blueboxpackaging.com/product/rigid-boxes/
- Blue Box Packaging — Magnetic Closure Boxes: https://www.blueboxpackaging.com/product/magnet-closure-boxes/
- ZenPack — Influencer/PR Packaging: https://www.zenpack.us/industries/influencer-packaging/
- Box Genie — PR & Influencer Packaging: https://www.boxgenie.com/pages/pr-influencer-packaging-solutions
- OXO Packaging — Retail / Counter Display / Apparel: https://oxopackaging.com/retail-boxes.html · https://oxopackaging.com/counter-display-boxes.html · https://oxopackaging.com/apparel-boxes.html
- Ibex Packaging — Rigid / Gift / Jewelry / Display: https://ibexpackaging.com/custom-rigid-boxes/ · https://ibexpackaging.com/custom-gift-boxes/
- Westpack — Custom Jewelry Boxes: https://www.westpack.com/usd_us_eng/jewellery-boxes.html
- Emenac Packaging — Shirt / Jewelry Boxes: https://www.emenacpackaging.com/product-description/shirt-boxes/
