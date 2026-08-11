# FE-2 report — nav & layout patterns · 2026-06-12

## What was built (all in `components/patterns/`, FE-2 owned)

| File | Type | What it is |
|---|---|---|
| `nav-types.ts` | shared module (no directive) | `NavCategory`/`NavGroup` serializable shapes, `toNavCategories()`, `groupNavCategories()`, `DEFAULT_LOGO_URL`. Lets server pages project full `Category[]` down before crossing the client boundary (lib/content.ts is server-only — ISSUES #13/#15). |
| `PromoBar.tsx` | server | Whole-bar link to `promo.href` + code badge (audit). Renders `null` if promo missing. |
| `PromoBarDismissible.tsx` | client | Dismiss shell (X button, 44px) remembering in `sessionStorage` (`hm-promo-dismissed`); promo link itself stays server-rendered (children pattern). |
| `Header.tsx` | client | Sticky header: logo, new-IA nav, 3 mega panels, inline search popover, phone ghost, Get Free Quote CTA, burger; renders + controls `MobileNavDrawer`. |
| `MobileNavDrawer.tsx` | client | FE-1 `<Drawer>` shell + full-row ≥44px rows, slide-in sub-panels with Back (focus managed, off-screen panel `inert`), phone/quote/email foot. |
| `Footer.tsx` | server | `.dark-section` 4-col footer + compliance disclaimer + auto year + legal bar + Trustpilot link + plain-text payment row (no fake badges). |
| `Hero.tsx` | server | `Hero` (home, owns `<h1>`, dieline draw-in panel) + `InteriorHero` (kraft band, breadcrumb slot). |
| `Dieline.tsx` | server | `public/dieline.svg` inlined as JSX (`draw` prop toggles `.draw-in`); ids stripped (renders 2×/page legally). |
| `StickyMobileCTA.tsx` | client | <768px bottom bar: Call + Get a Quote; IO-hides over quote form/footer; `inert` while hidden; never renders on `/get-custom-quote`. |
| `CTABand.tsx` | server | Kraft band, static dieline corner, primary CTA (sheen) + "or call {phone}". `.reveal`. |
| `RevealProvider.tsx` | client | Global IO engine (threshold .2, rootMargin −10%, one-time `data-inview`, unobserve; reduced-motion = instant mark; rescans on route change + rAF-batched MutationObserver). Re-exports FE-1's `<Reveal>` (canonical one-off wrapper). |

`npx tsc --noEmit`: **0 errors in all FE-2 files** (verified 2026-06-12 ~17:45; remaining repo errors are other agents' in-flight files: `app/page.tsx` TrustBar, `components/patterns/SpecTable.tsx` — FE-3/BE-1 scope).

## Props contracts (BE-1/BE-2 wire pages with these)

```ts
// PromoBar — root layout
type PromoBarProps = { globals: Globals } | { promo: Promo };   // either works

// Header — root layout. Pass toNavCategories(getCategories()) to keep the
// client payload light (full Category[] also type-checks — superset).
interface HeaderProps { globals: Globals; categories: NavCategory[]; logoUrl?: string }

// MobileNavDrawer — rendered BY Header; do NOT render standalone (duplicate
// id="mobile-nav"). Controlled: { open, onClose, globals, categories, id? }.

// Footer — root layout
interface FooterProps { globals: Globals; categories: NavCategory[]; blurb?: string; logoUrl?: string }
// renders max 8 category links — pass a curated slice (layout already does).

// Hero (home) — app/page.tsx ONLY (owns the page <h1>, dieline signature)
interface HeroProps {
  eyebrow?: string; heading: string; sub: string;          // sub: compose SLA/shipping from globals
  primaryCta?: { label: string; href: string };            // default Get a Custom Quote → /get-custom-quote/
  secondaryCta?: { label: string; href: string };          // default Browse Products → /products/
  trustItems?: string[];                                    // e.g. [`MOQ ${g.moq}`, g.sla, g.shipping]
  rating?: { value: number; count: number; href?: string; label?: string }; // REAL data only — omit while reviews.json is placeholder
  image?: { src: string; alt: string };                    // optional photo layered over dieline
}

// InteriorHero (T2/T3/content) — breadcrumbs slot takes FE-1 <Breadcrumbs>
interface InteriorHeroProps { heading: string; sub?: string; breadcrumbs?: ReactNode; children?: ReactNode; animate?: boolean }

// CTABand — last section before footer on every page that has one
interface CTABandProps { heading?: string /* default claim-free generic */; sub?: string;
  cta?: { label: string; href: string }; phone?: string; phoneHref?: string }

// StickyMobileCTA — root layout
interface StickyMobileCTAProps { globals: Globals; quoteHref?: string; watchSelector?: string }
// default watchSelector: '[data-quote-form], #quote-form, footer'

// RevealProvider — once in root layout (<RevealProvider /> after children is fine)
```

## Key decisions & deviations (rationale)

1. **Header IA per PM brief**, not DESIGN_SPEC §6.1's example list: Home · By Industry ▾ · By Material ▾ · By Style ▾ · Portfolio · Contact (+ search, phone, quote CTA). **Locations is removed** (not in new IA; old URLs covered by SEO-1 redirects). Mega panels = category image tiles grouped by `navGroup` + "View all" tail (→ `/industries/`, `/materials/`, `/box-styles/`); the 2 `type:"General"` categories carry `navGroup:"By Industry"` so all 22 appear.
2. **Mega menu behavior:** hover with 150ms intent delay AND click/Enter/ArrowDown (ArrowDown focuses first link); Escape → focus returns to trigger; closes on outside click, focus leaving header, route change. `aria-haspopup/aria-expanded/aria-controls`, `.menu-pop` 200ms. **Panel contents mount on first open** so the 22 remote tile images never load eagerly on page load.
3. **Blur-in after 80px:** `data-scrolled` attr via rAF-throttled scroll hook; Tailwind `data-[scrolled]:` flips bg→`--header-bg-blur`, hairline border, shadow-e1 (transition on background/border/shadow only).
4. **Search** is a popover form with a VISIBLE label (audit), `role="search"`, GET `action="/products/"` `name="q"` (works without JS) + `router.push` interception with JS. BE-1's products page already reads `searchParams.q` — verified end-to-end.
5. **Hero needs no client anim wrapper:** `.hero-enter`/`.hero-enter-visual`/`.draw-in` are pure-CSS one-time animations (animations.css contract), so Hero ships zero JS. The brief's "client anim wrapper" would have been dead code; documented instead of built.
6. **Drawer UX per PM brief** (slide-in sub-panels with Back) instead of spec §6.2's accordion rows; whole row is ONE `<button>` (label + chevron both toggle); rows ≥44px; off-screen panel `inert`; Back-button ↔ group-row focus handoff. FE-1 `Drawer` supplies dialog semantics/trap/Esc/scroll-lock/focus-return + head/close.
7. **All claims/contact facts via props from globals.json** — zero hardcoded SLA/MOQ/shipping/phone/email/promo anywhere in my files; phone renders `globals.phone` verbatim ("+1 (213) 692-6437"), href = `globals.phoneHref`.
8. **Trailing-slash hrefs** everywhere (`/products/`, `/get-custom-quote/`, `/{slug}/`…) to match `trailingSlash: true` (SEO-1) — zero-hop internal links.
9. **lucide v1 has no brand icons** → Footer social glyphs are minimal inline SVGs (aria-hidden) inside labeled 36px round links; everything else uses lucide.
10. `globals.address` contains "(TODO client: street address)" — Footer strips the parenthetical for display (ISSUE logged for client).
11. Removed the FE-2 block from `types/fe-contracts.d.ts` (BE-2's shim): ambient `declare module` names SHADOW path-mapped real files (confirmed; BE-3 hit the same), so the stale shim was overriding real `CTABandProps`.
12. **No `components/patterns/index.ts` barrel** — FE-3 writes to the same directory in parallel; a shared barrel is a write-conflict magnet. Import files directly.

## Integration notes / asks

- **BE-1 (done already in layout):** PromoBar→Header(→drawer)→main→Footer→StickyMobileCTA→RevealProvider; `<main className="pb-24 md:pb-0">`; skip link; data-js script. ✔ verified in current app/layout.tsx.
- **FE-3:** add `data-quote-form` to the QuoteForm card/section root so StickyMobileCTA hides when an embedded quote form is in view on other pages (the /get-custom-quote route is already excluded by pathname, footer by tag).
- **FE-1:** `Drawer` content area default `p-5` + plain-join `cx` means I override with `!p-0` (contentClassName) for full-bleed rows — consider a `padded?: boolean` escape hatch (polish, S3).
- **BE-2:** `PageHero` in app pages duplicates `InteriorHero` — fine functionally; consider swapping to `InteriorHero` for one source of the kraft-band style (S3, optional).
- **Logo:** `DEFAULT_LOGO_URL = '/logo.svg'` (+ `LOGO_WIDTH/LOGO_HEIGHT` 170×32 matching the 340×64 asset) — DEVOPS' self-hosted recreation, swapped 1:1 with the live `logo3.svg` at cutover (their ISSUE). Matches lib/seo `ORG_LOGO_URL`. `logoUrl` prop overrides per instance; Footer applies `brightness-0 invert` for the dark band. (`globals.logoUrl` does not exist in content — constant lives in nav-types.)
- **Hero rating strip:** intentionally NOT rendered on home until real Trustpilot data exists (reviews.json is placeholder-flagged) — pass `rating` only with real values; never feeds JSON-LD.

## A11y / perf checklist (spec §3/§9)

- aria-expanded/controls/haspopup on mega triggers, search, burger, drawer group rows; `aria-current="page"` on active nav links; Escape paths return focus; visible labels on search; icons aria-hidden; icon-only buttons labeled; touch targets ≥44px below md (drawer rows, icon buttons, promo dismiss).
- Motion: only animations.css classes + sanctioned `transition-[props] ease-brand`; reduced-motion handled globally + RevealProvider marks in-view immediately; `inert` keeps off-screen sticky bar/drawer panels out of tab order.
- Perf: mega images lazy-mounted; header/sticky bars are the only backdrop-blur users; RevealProvider ≈1.3KB min; Hero/Footer/PromoBar/CTABand/Dieline ship no JS.
