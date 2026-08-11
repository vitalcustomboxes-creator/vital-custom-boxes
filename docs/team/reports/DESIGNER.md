# DESIGNER report — 2026-06-12

## What was done
Full design system layer for the rebuild (brand direction: premium & minimal), plus the
binding component/pattern contract for the FE/BE waves.

## Files created / replaced
| File | Status | Content |
|---|---|---|
| `styles/tokens.css` | replaced ARCHITECT stub | Complete `:root` token set: 13 brief colors + semantic roles + translucency helpers (`--color-overlay`, `--scrim-tile`, `--header-bg-blur`), type scale (desktop+mobile px sizes, line-heights, responsive `--text-h*` aliases swapping at 768px), 4px spacing grid (4–128), radius sm/md/lg/full, shadows e1/e2/e3 (warm navy rgba(11,37,54,…)), motion (`--dur-fast/base/slow/menu/hero`, `--ease-out` cubic-bezier(.16,1,.3,1), `--stagger-step` 70ms), z-index ladder, layout rhythm tokens, `.dark-section` scope (ink-900 bg + remapped light text vars + light focus ring), `.focus-ring` helper |
| `styles/animations.css` | new | Full motion spec: `.reveal` (fade-up 16px on `[data-inview]`), `.reveal-stagger > *` (70ms increments via `--stagger-i` + nth-child fallback ×12), hero entrance (`.hero-enter` child stagger, `.hero-enter-visual`, `@keyframes draw-stroke` + `.draw-in` for the dieline, one-time 1.2s), `.card-lift`/`.card-media` (−4px + e3 + img 1.04 @250ms, hover-capable pointers only), `.press` (.98), `.sheen` 6s loop (pausable via `.is-paused`/`[data-motion="paused"]`), `.chevron` rotate on `[aria-expanded]`, `.menu-pop` 200ms fade+slide, `.drawer-panel`/`.overlay-fade`, mount utils, toast lifecycle, `.skeleton`. ALL neutralised under `prefers-reduced-motion: reduce`. transform/opacity only (sole exception: SVG stroke-dashoffset, paint-level) |
| `styles/globals.css` | replaced placeholder (file was marked DESIGNER-owned) | Import order tokens→animations→Tailwind; base layer: body bg/text/font, h1–h4 + `.h1–.h4` aliases (auto-responsive, auto-flip in `.dark-section`), global `:focus-visible` ring, `::selection`, smooth scroll w/ `scroll-padding-top` for sticky header; components: `.container-hm`, `.section`, `.section-compact`, `.eyebrow`, `.lead`, `.skip-link` |
| `docs/DESIGN_SPEC.md` | new | The FE contract: hard contracts (§0), color/type/space foundations + contrast constraints (§1), page-section rhythm + T1–T4 template orders (§2), a11y requirements (§3), motion map (§4), 14 primitives with exact Tailwind classes/states/responsive 480-768-1024/motion (§5), 17 patterns incl. Header+MegaMenu 3-panel, MobileNavDrawer 44px rows, Footer 4-col, heroes, ProductCard equal-height + word-boundary truncation, QuoteForm 2-step w/ progress, StickyMobileCTA, SpecTable, ProcessSteps, ReviewWall, FAQAccordion, CTABand kraft, GalleryLightbox, BlogCard (§6), audit-finding hooks table (§7), asset notes (§8), per-PR definition of done (§9) |
| `public/dieline.svg` | new | Hero signature: tuck-end box dieline, strokes-only, `currentColor`, viewBox 480×360, named paths (`cut-outline`, `thumb-notch`, `fold-*`), `pathLength="100"` on drawables for normalized draw-in; dashed fold lines carry `class="fold"` (fade in late instead of drawing so their dasharray isn't hijacked). Validated XML |

## Key decisions
1. **Reveal mechanism is progressive-enhancement safe**: hidden pre-reveal states only
   exist under `html[data-js]`; one inline script in the root layout sets it (ISSUE filed
   for BE-1). No JS ⇒ no hidden content ever.
2. Reveals use **animations with `backwards` fill, not transitions**, so `transition`-based
   hover classes (card-lift) never fight stagger delays; plus a composition rule (stagger
   child wraps the card) documented in both files.
3. **Accordion/menus never animate height** (motion rule): chevron rotate + content fade;
   panels toggle `hidden`/`data-open` with visibility-delay trick for fade-outs.
4. Semantic color roles (`--color-heading/text/border/link…`) re-map inside `.dark-section`
   so components need no dark variants; headings/selection/focus ring adapt automatically.
5. Fonts: tokens alias `--font-display/--font-body` to `--font-poppins/--font-manrope`
   (exact `variable:` names BE-1 must use — spec §0.2), matching ARCHITECT's tailwind
   fontFamily wiring.
6. Kept ARCHITECT's `tailwind.config.ts` untouched — spec relies only on the existing
   mapping + core 3.4 utilities (`line-clamp`, `has-[]`, `peer-checked`, `min-[480px]:`)
   + my CSS classes. No config change required.

## Issues found (logged in ISSUES.md)
1. (S2) Root layout must set `data-js` on `<html>` — required by animations.css contract.
2. (S3) Palette contrast constraints: white-on-terra-500 = 3.2:1 (large-text AA only ⇒ CTA
   labels ≥16px semibold); terra-600 ≈ 4.3:1 (≥14px semibold); slate-400 ≈ 3.1:1 on white
   (decoration only, never essential text — slate-600 is the body/meta color).

## Perf notes
- Motion is transform/opacity only; no `transition: all`; one looping animation max per
  viewport (sheen), pausable; `backdrop-blur` used only on header + sticky CTA bars.
- Zero JS added by the design layer itself; the only required client pieces are the tiny
  `<Reveal>` observer (FE-1) and the inline `data-js` one-liner.
- Dieline is a single ~1.6KB inline SVG; draw-in is GPU-cheap (dashoffset paint).

## Handoff notes
- **BE-1**: §0.2 next/font variable names; §0.3 data-js script; skip link + `<main id="main">`;
  `<main class="pb-24 md:pb-0">` to clear StickyMobileCTA; render compliance disclaimer per
  SEO-2/DATA-ENG issue on regulated categories.
- **FE-1**: build primitives exactly per spec §5; `<Reveal>` contract §0.4.
- **FE-2/FE-3**: patterns §6; composition rule §0/§4 (stagger child wraps card); use
  `.container-hm/.section` rhythm §2; word-boundary truncation rules §6.7 (`truncate`
  forbidden for content text; add `truncateAtWord` in lib/format.ts).
- **QA**: definition-of-done checklist §9; reduced-motion must be tested ON.
- Re DATA-ENG issue on /business-card hero: no design constraint — CategoryTile (§6.8)
  works with any 4:3 crop; FE-3 may swap the image freely.
