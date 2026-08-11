# TECH SEO — platform requirements (sitemap, robots, canonicals, URL policy, GSC)
**Owner:** SEO-1 · **Date:** 2026-06-12 · **Consumers:** ARCHITECT, BE-2 (sitemap.ts/robots.ts), SEO-2 (lib/seo.ts), DEVOPS (deployment), SEO-VERIFY.

Site origin everywhere: `https://www.hmcustompackaging.com` (https + www, no exceptions).

## 1. Trailing-slash policy — DECISION: `trailingSlash: true`

**Evidence (live fetches, 2026-06-12):** every URL in `page-sitemap.xml`, `products-sitemap.xml`, `locations-sitemap.xml`, `business-card-sitemap.xml` ends with `/`; spot-checked pages emit self-canonicals **with** trailing slash (e.g. `canonical: https://www.hmcustompackaging.com/locations/custom-detroit-pizza-boxes-in-chicago/`); all internal nav/footer links use trailing slashes.

**Decision:** Next defaults to no-trailing-slash, which would 308 every single indexed URL to a new form at launch. Instead we set `trailingSlash: true` in `next.config.ts` so every currently-indexed URL keeps resolving at its exact form, zero-hop. **Already applied by SEO-1** (logged in ISSUES; ARCHITECT please keep).

**Consequences (all roles):**
- `lib/redirects.ts` sources/destinations are generated WITH trailing slashes (Next requires this under `trailingSlash: true`). Slash-less requests like `/cart` take two hops (`/cart` → `/cart/` → `/get-custom-quote/`) — acceptable; canonical forms are one hop.
- Internal `<Link>`/`href` values should be written with trailing slashes (`/about-us/`) for zero-hop navigation and crawl efficiency (FE-2/FE-3/BE-1/BE-2). Next will fix slash-less hrefs with a redirect, but don't rely on it.
- sitemap.ts URLs, canonicals, JSON-LD `url`/`@id` fields, and OG urls must all use the trailing-slash form (BE-2, SEO-2).
- If this flag ever changes: flip `TRAILING_SLASH` in `scripts/gen-redirects.mjs` and regenerate, update lib/seo.ts helpers — but do NOT change it post-launch.

## 2. Canonical strategy (SEO-2 implements in lib/seo.ts; BE-1/BE-2 consume)

1. Set `metadataBase: new URL('https://www.hmcustompackaging.com')` once in root layout.
2. **Every indexable page emits exactly one self-referencing canonical** (`alternates.canonical`), absolute, https, www, trailing slash. Helper should normalize: lowercase path, ensure leading + trailing slash, strip query/fragment.
3. Canonicals never point at redirecting URLs; redirect destinations are always the canonical pages (verified — no chains in the map).
4. Query parameters (`?utm_*`, search, future filters) never change the canonical; canonical is always the bare path.
5. **`/portfolio` vs `/case-studies`** (same content per IA): canonical pair decision — `/portfolio/` is canonical (it exists on the live site and holds the equity); `/case-studies/` must set `alternates.canonical` to `/portfolio/` and stay OUT of the sitemap. If content later diverges, revisit.
6. `/thank-you` and any API/internal routes: `robots: { index: false, follow: false }` metadata; no canonical needed.
7. 404 (`not-found.tsx`) must return real HTTP 404 (no soft-404 redirect to home).
8. Doorway-page topics are consolidated BY THE REDIRECTS — do not recreate per-city pages or per-city canonical variants on the new site.

## 3. sitemap.ts requirements (BE-2 implements at `app/sitemap.ts` → `/sitemap.xml`)

Build from the typed content loaders (`lib/content.ts`) — never hand-maintain URL lists. Include **all** indexable routes; exclude nothing legitimate:

| Group | Source | Count |
|---|---|------:|
| Home `/` | static | 1 |
| Category pages | `content/categories.json` (22 slugs incl. `/business-card/`) | 22 |
| Products hub `/products/` | static | 1 |
| Product pages `/products/<slug>/` | `content/products.json` — **all 153** (merged 4 excluded from content by DATA-ENG) | 153 |
| Blog hub `/blog/` | static | 1 |
| Blog posts `/blog/<slug>/` | `content/posts.json` | 16 |
| Static pages | `/get-custom-quote/ /contact/ /about-us/ /faqs/ /reviews/ /materials/ /box-styles/ /industries/ /how-it-works/ /sustainability/ /samples/ /portfolio/ /terms-conditions/ /shipping-policy/ /return-policy/ /privacy-policy/ /sitemap-page/` | 17 |
| **Expected total** | | **211** |

**Excluded — with reasons (document in code comments):**
- `/case-studies/` — canonicalized to `/portfolio/` (§2.5). Sitemaps must list canonical URLs only. (If PM decides distinct content: add it, expected total 212.)
- `/thank-you/` — conversion-confirmation page, `noindex`. (The live WP sitemap wrongly includes it — do not copy that.)
- `/api/*`, `not-found` — not pages.
- All redirect sources (263) — never sitemap redirecting URLs.

**Format rules:** absolute `https://www.hmcustompackaging.com/...` with trailing slash; `lastModified` from content data where available (products/posts), build date otherwise; `changeFrequency`/`priority` optional (Google ignores them — fine to omit). Single file is fine (211 ≪ 50k limit). QA-AUTO: add an integrity test asserting 211 entries and that no entry matches a redirect source.

## 4. robots.ts requirements (BE-2 implements at `app/robots.ts` → `/robots.txt`)

Live state for reference (fetched 2026-06-12): disallows `/wp-admin/`, `/wp-login.php`, `/sign-in/`, `/register/`; allows `admin-ajax.php`; sitemap `sitemap_index.xml`. None of the WP paths exist on the new site.

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/thank-you/'] }],
    sitemap: 'https://www.hmcustompackaging.com/sitemap.xml',
  };
}
```

- **Do NOT disallow `/sign-in/`, `/register/`, `/cart/`, `/checkout/`** (unlike live): they are now 308 redirects and must stay crawlable so Google can see and process the redirects. Disallowing them would freeze the old URLs in the index.
- Do not disallow `/locations/` or `/business-card/` paths for the same reason.
- `/thank-you/` is belt-and-braces: it also carries `noindex` meta (§2.6).
- No `crawlDelay`; no UA-specific rules unless SECURITY requests bot rules later.

## 5. www + https enforcement (DEVOPS — deployment layer, not app code)

- **Canonical host:** `www.hmcustompackaging.com`. Configure at the platform/DNS edge (Vercel: add both domains, set www as primary → apex `hmcustompackaging.com` gets an automatic 308 to www; HTTP→HTTPS is automatic). Do NOT implement host redirects in middleware — edge-level is faster and avoids double handling.
- Result must be: `http://hmcustompackaging.com/x` → ONE 308 → `https://www.hmcustompackaging.com/x` (combined scheme+host hop), then any path redirect. Verify post-deploy with `curl -sIL http://hmcustompackaging.com/cart/`.
- **HSTS** (`strict-transport-security: max-age=31536000; includeSubDomains`) via headers config — SECURITY's hardening pass; preload only after a stable month.
- All absolute URLs in code/content use `https://www.` (audit finding "https links only"). `metadataBase` enforces this for metadata.

## 6. Redirect implementation (cross-reference)

263 static 308s in `lib/redirects.ts` (generated, validated) + 1 query-string case (`/?page_id=3` → `/privacy-policy/`) in `middleware.ts`. Full counts, mapping tables, and the 6-layer verification method: `docs/seo/REDIRECTS.md`. Known gaps logged in ISSUES: live `/locations/` hub and live `/sitemap/` page.

## 7. GSC migration checklist — same-domain replatform, 90-day watch

Domain does NOT change → no "Change of Address" tool. This is a platform swap on the same host; the risk window is the first 90 days.

**Pre-launch (T−7…T0):**
- [ ] Confirm GSC access: Domain property `hmcustompackaging.com` (covers www + apex + http/https). Create if missing.
- [ ] Export baselines from GSC: top 500 queries, top pages by clicks (90 days), Coverage/Indexing counts, average position — store with PM (comparison baseline).
- [ ] Crawl the live site URL inventory (the 4 sitemaps) → archive as the launch-day URL set.
- [ ] Run the redirect verification suite (REDIRECTS.md §5 A–D) on the staging build; spot-check E on a preview deploy.
- [ ] Verify staging is NOT indexable (preview deployments: `X-Robots-Tag: noindex` — Vercel does this for previews automatically; double-check).

**Launch day (T0):**
- [ ] Deploy; run REDIRECTS.md §5E smoke (all 4 groups + page_id=3 + host/scheme hops).
- [ ] Confirm `/robots.txt` and `/sitemap.xml` respond correctly in production.
- [ ] Submit `https://www.hmcustompackaging.com/sitemap.xml` in GSC (remove/forget the old `sitemap_index.xml` reference — it will 404; that is fine and expected).
- [ ] URL-Inspect + "Request indexing" for: home, top 5 categories, top 10 products (by baseline clicks), `/get-custom-quote/`.

**Weeks 1–2 (check every 1–2 days):**
- [ ] GSC Pages report: watch "Not found (404)" — every entry that was a real live URL gets a redirect added (via `scripts/gen-redirects.mjs` matrices or BE-2 for one-offs).
- [ ] Watch "Page with redirect" climb as the 252 doorways get recrawled — this is the SUCCESS signal, not an error.
- [ ] Watch "Duplicate without user-selected canonical" — should trend to zero (single-canonical strategy).
- [ ] Crawl stats: no spike in 5xx; middleware errors would surface here.

**Weeks 3–12 (weekly):**
- [ ] Performance report vs baseline: clicks/impressions/position for the top-500 query set. Expect ±10% noise; investigate any sustained −20% query cluster (usually a missed redirect or canonical mismatch).
- [ ] Indexing: new-product coverage (153 products indexed), sitemap "discovered vs indexed" delta shrinking.
- [ ] Core Web Vitals report: new build must hold "Good" (perf budget ≤150KB/route helps).
- [ ] Doorway memorial check: `site:hmcustompackaging.com/locations/` shrinking week-over-week.
- [ ] Keep ALL redirects live for ≥12 months minimum (308s are cheap; never prune within the first year).

**Day 90:** write comparison report vs baseline (SEO-VERIFY/PM): traffic delta, index coverage delta, remaining 404s, decision on pruning nothing / adding stragglers.
