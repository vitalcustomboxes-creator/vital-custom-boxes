# Local SEO & NAP Audit — Vital Custom Boxes

**Date:** 2026-06-18 · **Scope:** `lib/seo.ts` `orgSchema()`, `content/globals.json`, sitewide NAP
**Status:** Report only (no code changed). Owner to action.

Canonical NAP under audit:

- **Name:** Vital Custom Boxes
- **Address:** 3000 Shelby St, Indianapolis, IN 46227, USA
- **Phone:** +1 (828) 455-0798 (`tel:+18284550798`)
- **Email:** sales@vitalcustomboxes.com

---

## 0. What's already good

- NAP is **internally consistent** across `content/globals.json`, `lib/seo.ts` (`FALLBACK_GLOBALS` + `orgSchema` PostalAddress), `scripts/generate-content.mjs`, the `/contact` meta, the Footer, and the `tel:` validator (`qa-crawl.mjs` enforces `tel:+18284550798`). No address/phone/email drift found.
- `orgSchema()` already emits a single `Organization` + `LocalBusiness` node with `@id`, `name`, `url`, `logo`, `image`, `telephone`, `email`, a full `PostalAddress`, `priceRange: "$$"`, real `aggregateRating` (4.9/100 from `ratings.json`), and `sameAs` from socials. That is a solid base — the gaps below are additive.

---

## 1. JSON-LD fields to ADD to `orgSchema()`

Best practice (Google + Schema.org, 2026): name + full address + telephone are required; **geo, openingHours, areaServed, hasMap, contactPoint, and a specific business type unlock the rest of the local feature set and AI-search categorization.** Add the following to the object returned by `orgSchema()`. All values below are concrete and safe to ship.

### 1a. Tighten the `@type` (specificity is the #1 schema signal)
```jsonc
"@type": ["Organization", "LocalBusiness"]
```
LocalBusiness has no exact "packaging manufacturer" subtype, so keep `LocalBusiness` but make the GBP category carry the specificity (see §2). Optionally add `"@type": ["Organization", "LocalBusiness", "Store"]` only if a buyer can transact/visit; otherwise leave as-is.

### 1b. `geo` — GeoCoordinates (verify against the GBP pin before shipping)
```jsonc
"geo": {
  "@type": "GeoCoordinates",
  "latitude": 39.7050,
  "longitude": -86.1490
}
```
> ⚠ The lat/long above is an approximation for 3000 Shelby St, Indianapolis. Replace with the **exact coordinates of the verified Google Business Profile pin** so schema, GBP, and Maps agree.

### 1c. `hasMap` — link to the canonical Google Maps place
```jsonc
"hasMap": "https://www.google.com/maps?cid=<GBP_PLACE_CID>"
```
Use the real CID/place URL from the verified GBP listing (the `/contact` page already has a "map coming soon" placeholder — wire the same URL there).

### 1d. `openingHours` — required for hours-aware local results
```jsonc
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
]
```
Set the real business hours. Must match GBP exactly. (Shorthand `"openingHours": "Mo-Fr 09:00-18:00"` is also valid but the spec form is preferred.)

### 1e. `areaServed` — a US packaging supplier ships nationwide
```jsonc
"areaServed": [
  { "@type": "Country", "name": "United States" },
  { "@type": "Country", "name": "Canada" }
]
```
This matches the existing "Free shipping across the USA & Canada" promise in `globals.json` and signals a national service radius rather than a walk-in-only shop.

### 1f. `contactPoint` — structured sales line
```jsonc
"contactPoint": {
  "@type": "ContactPoint",
  "telephone": "+1-828-455-0798",
  "email": "sales@vitalcustomboxes.com",
  "contactType": "sales",
  "areaServed": ["US","CA"],
  "availableLanguage": ["English"]
}
```

### 1g. `priceRange` — already present (`"$$"`); leave as-is. Optionally add `paymentAccepted` / `currenciesAccepted: "USD"` if known.

### 1h. (Optional) `knowsAbout` / `makesOffer` for AI-search categorization
```jsonc
"knowsAbout": ["Custom packaging","Custom boxes","Mailer boxes","Rigid boxes","Mylar bags"]
```

**Implementation note:** these are static facts; hard-code them in `orgSchema()` (or extend `SiteGlobals` with `geo`, `hours`, `mapUrl`, `areaServed` so DATA-ENG owns them in `globals.json`). Re-run the JSON-LD through Google's Rich Results Test after adding.

---

## 2. GBP + Citation Alignment Checklist

Local-pack ranking weight (2026): **GBP signals ~32%, reviews ~16%, citation/NAP consistency ~7%.** Primary GBP **category is the single biggest local-pack factor** — get it right first.

**Google Business Profile**
- [ ] **Primary category:** `Box manufacturer` (or `Packaging supply store` / `Packaging company` — pick the closest Google offers and keep it consistent everywhere).
- [ ] **Secondary categories:** add `Printing equipment supplier`, `Custom label printer`, `Corrugated box supplier` only where genuinely accurate.
- [ ] Business name on GBP = **exactly** "Vital Custom Boxes" (no keyword stuffing like "Vital Custom Boxes | Wholesale Packaging" — that risks suspension).
- [ ] Address on GBP = `3000 Shelby St, Indianapolis, IN 46227` — char-for-char identical to schema and site footer.
- [ ] Phone on GBP = `(828) 455-0798` — **see §3, the area-code concern.**
- [ ] Website = `https://www.vitalcustomboxes.com/` (trailing slash, www, matches canonical policy in `lib/seo.ts`).
- [ ] Service area set to **US (+ Canada)** to match `areaServed` and shipping promise.
- [ ] Hours populated and identical to `openingHoursSpecification`.
- [ ] Profile complete: photos, products, services, "from the business" description, Q&A seeded, posts active (dynamic profiles now rank better than static ones).

**Citations / directories (consistency > volume in 2026)**
- [ ] Identical NAP on the top high-authority US directories: **Apple Maps, Bing Places, Yelp, BBB, Manta, Yellow Pages, Foursquare, Trustpilot** (Trustpilot URL already in `globals.json`).
- [ ] Same NAP on social profiles already linked in `sameAs` (Facebook, Instagram, X, Pinterest) — these double as citations.
- [ ] Run a citation audit (e.g. BrightLocal) to find/fix any pre-existing HM-era listings that still carry the old brand/number.
- [ ] One canonical phone format per channel: display `(828) 455-0798`, link `tel:+18284550798`, schema `+1-828-455-0798`.

---

## 3. NAP / Area-Code Finding (the trust risk)

**Finding:** the phone number **+1 (828) 455-0798 uses the 828 area code, which is western North Carolina (Asheville region) — NOT Indiana.** Indianapolis numbers use **317** (and overlay **463**). So the structured-data address says Indianapolis while the phone is geographically a North Carolina number.

**Why it matters for local SEO/trust:**
- Google and citation aggregators cross-reference area code ↔ city as a soft trust/relevance signal. An out-of-region number on a local listing is a known **inconsistency flag** and can dampen local-pack confidence.
- Human trust: prospects who notice an NC number on an "Indianapolis" supplier may read it as a virtual/forwarding setup, which weakens local credibility.
- It is **not** an internal-consistency bug (the same 828 number is used everywhere in the repo, correctly). The mismatch is between the number's origin region and the stated city.

**Recommendation (in priority order):**
1. **Confirm the address is real and staffed.** If 3000 Shelby St, Indianapolis is the genuine, verifiable place of business, GBP can still be verified — but get a **local 317/463 number** (port or add one) as the public/GBP phone. This is the highest-trust fix and removes the area-code flag entirely.
2. If a local number isn't feasible short-term, **keep 828 consistent everywhere** (do not introduce a second number) and lean on GBP verification + reviews to carry trust. Accept the soft signal hit.
3. **Do NOT** list the Indianapolis address on GBP if no one actually operates from it — a non-genuine address risks GBP suspension, which is far worse than an area-code mismatch. Verify the address legitimacy before citation-building.

---

## 4. Prioritized Action List

| # | Priority | Action | Owner | Effort |
|---|----------|--------|-------|--------|
| 1 | P0 | Verify the Indianapolis address is a real, staffed location before any GBP/citation work | Business | — |
| 2 | P0 | Decide phone: get a local **317/463** number for GBP, or commit to 828 everywhere (§3) | Business | low |
| 3 | P0 | Create/claim & verify **Google Business Profile**; set primary category `Box manufacturer`, hours, service area, website | SEO | med |
| 4 | P1 | Add `geo`, `hasMap`, `openingHoursSpecification`, `areaServed`, `contactPoint` to `orgSchema()` with **real** values; validate in Rich Results Test (§1) | SEO-2 / DATA-ENG | low |
| 5 | P1 | Wire the real Google Maps URL into the `/contact` page (replace the "coming soon" placeholder) | FE | low |
| 6 | P2 | Build consistent citations on Apple/Bing/Yelp/BBB + audit for stale HM-era listings | SEO | med |
| 7 | P2 | Seed GBP photos, products, posts, Q&A; start review-generation flow (16% of local weight) | SEO/Marketing | ongoing |
| 8 | P3 | Optional: add `knowsAbout` / `paymentAccepted` to schema for AI-search richness | SEO-2 | low |

---

### Sources
- [Google — Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Schema.org — LocalBusiness](https://schema.org/LocalBusiness)
- [BrightLocal — Google Local Algorithm & Ranking Factors](https://www.brightlocal.com/learn/google-local-algorithm-and-ranking-factors/)
- [Search Engine Journal — Dynamic profiles as a local ranking factor](https://www.searchenginejournal.com/why-dynamic-profiles-are-the-new-local-ranking-factor/568200/)
- [Schema for Local Businesses in 2026 (LocalRank-SEO)](https://medium.com/@joosep_41274/schema-for-local-businesses-in-2026-what-to-implement-and-why-924a64fad212)
