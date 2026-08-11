# DESIGN SPEC — HM Custom Packaging rebuild

Owner: DESIGNER · 2026-06-12 · Brand direction: **premium & minimal**
Binding contract for FE-1 / FE-2 / FE-3 / BE-1 / BE-2 / BE-3. Token values live in
`styles/tokens.css`; motion classes in `styles/animations.css`; base layer + helpers in
`styles/globals.css`. Tailwind mapping is already wired in `tailwind.config.ts`
(ARCHITECT, see `docs/ARCHITECTURE.md` §5).

Breakpoints used in this spec: **480** (`min-[480px]:`), **768** (`md:`), **1024** (`lg:`).
Mobile-first: the unprefixed style is the ≤479px style.

---

## 0. Hard contracts (read before building anything)

1. **Import order** (already in `styles/globals.css`): `tokens.css` → `animations.css` →
   Tailwind layers. Never import tokens elsewhere.
2. **Fonts (BE-1, root layout):** load next/font with these exact variable names —
   tokens.css aliases them to `--font-display`/`--font-body`:
   ```tsx
   const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins", display: "swap" });
   const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
   <html lang="en" className={`${poppins.variable} ${manrope.variable}`}>
   ```
   (If offline, next/font/google with fallback per brief — same `variable:` names.)
3. **JS marker (BE-1, root layout):** first thing inside `<head>`:
   ```tsx
   <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
   ```
   Scroll-reveal hidden states only exist under `html[data-js]` — without this script
   reveals never hide content (no-JS safe), but with it missing the site simply has no
   scroll animations. Required.
4. **`<Reveal>` client component (FE-1):** wraps/decorates `.reveal` / `.reveal-stagger`
   targets. IntersectionObserver, `threshold: 0.2`, `rootMargin: "0px 0px -10% 0px"`,
   sets `data-inview=""` once, then unobserves. Props: `as`, `stagger?: boolean`,
   `className`. Children of a stagger grid get `style={{ "--stagger-i": i }}`
   (nth-child fallback covers the first 12).
5. **Motion rules:** transform/opacity only (sole exception: SVG `stroke-dashoffset`
   for the hero dieline). Everything must look correct under
   `prefers-reduced-motion: reduce` — animations.css handles the kill switch globally;
   never add motion outside its classes without replicating the guard.
6. **No layout-property animation. No `transition: all`.** Use the provided classes or
   `transition-[specific-props] duration-200 ease-brand`.
7. **Translucency:** Tailwind `/opacity` modifiers do NOT work on brand colors. Use
   `--color-overlay`, `--scrim-tile`, `--header-bg-blur`, dark-section border tokens, or
   explicit `rgba(11,37,54,…)` arbitrary values. (`white/10` etc. still works — white is
   a Tailwind default.)
8. **Shared facts** (phone, email, SLA, MOQ, shipping, promo) always come from
   `content/globals.json` via props — never hardcoded in components (audit).

### Classes provided by the design layer (use, don't re-implement)

| Source | Classes |
|---|---|
| globals.css | `.h1 .h2 .h3 .h4` (visual level ≠ element level), `.eyebrow`, `.lead`, `.container-hm`, `.section`, `.section-compact`, `.skip-link` |
| tokens.css | `.dark-section` (re-maps semantic vars + sets bg/text), `.focus-ring` |
| animations.css | `.reveal`, `.reveal-stagger`, `.hero-enter`, `.hero-enter-visual`, `.draw-in`, `.card-lift`, `.card-media`, `.press`, `.sheen` (+`.is-paused`), `.chevron`, `.menu-pop`, `.drawer-panel`(`--left`), `.overlay-fade`, `.anim-fade-in`, `.anim-rise-in`, `.anim-pop-in`, `.toast-enter`, `.toast-exit`, `.skeleton` |

---

## 1. Foundations

### 1.1 Color roles

| Role | Token / class | Usage |
|---|---|---|
| Page bg | `paper-50` | `<body>` default (globals.css) |
| Alt section bg | `kraft-100` | every other section (§2) |
| Dark band / footer | `.dark-section` (ink-900) | max ONE dark band between hero and footer |
| Headings | `ink-900` (auto via `--color-heading`) | h1–h4 inherit from base layer |
| Body text | `slate-600` | default body color |
| Muted | `slate-400` | **decoration only**: placeholders, disabled, separators, decorative icons — 3.1:1 on white, NOT for real text |
| Primary CTA | `bg-terra-500` → hover `bg-terra-600` | white label ≥16px semibold ONLY |
| Accent text/links | `terra-600` | ≥14px semibold on light bg |
| Tints | `terra-100`, `ink-100`, `kraft-100` | chips, fills, borders, zebra |
| Decorative | `gold-500` | rating stars, flourishes — never text, never bg behind text |
| Feedback | `success` / `error` | text on white/paper only |

**Contrast constraints (palette is fixed — respect these):**
- White on terra-500 = 3.2:1 → passes WCAG **large-text** only. CTA labels must be
  ≥16px font-semibold; never set small white text on terra-500.
- terra-600 on paper-50 ≈ 4.3:1 → use at ≥14px font-semibold only.
- slate-400 on white ≈ 3.1:1 → never essential text (see table).
- slate-400 on ink-900 = 5.0:1 → fine as muted text **inside `.dark-section`**.

### 1.2 Type ramp

Poppins (display) 600/700 · Manrope (body). Sizes respond automatically — the
`--text-h*` aliases swap mobile→desktop at 768px. Base layer styles `h1–h4` already;
use `.h1–.h4` when visual level differs from semantic level (single-H1 audit rule).

| Style | Desktop / Mobile | LH | Weight | Class |
|---|---|---|---|---|
| H1 | 44 / 32 | 1.15 | 700, tracking −0.02em | `h1` element or `.h1` |
| H2 | 34 / 26 | 1.2 | 700, tracking −0.02em | `h2` / `.h2` |
| H3 | 26 / 21 | 1.25 | 600 | `h3` / `.h3` |
| H4 | 20 / 18 | 1.35 | 600 | `h4` / `.h4` |
| Body | 16 | 1.6 | 400–500 (Manrope) | default / `text-base` |
| Lead | 18 | 1.55 | 400 | `.lead` |
| Small | 14 | 1.5 | — | `text-sm` |
| Tiny | 12 | 1.4 | 600 | `text-xs font-semibold` |
| Eyebrow | 13, +0.08em, uppercase | — | 600 | `.eyebrow` |

Body copy max measure: `max-w-[65ch]`. Heroes/leads: `max-w-[52ch]`.

### 1.3 Space, radius, elevation, z

- Spacing = Tailwind 4px grid (= `--space-*`). Component gaps: 8/12/16/24; card padding
  20–24 (`p-5`/`p-6`); section padding via `.section` (64→96px) / `.section-compact`
  (40→56px); container `.container-hm` (max 1240, pad 20→32).
- Radius: `rounded-sm` 6 (chips/badges) · `rounded-md` 10 (buttons/inputs) ·
  `rounded-lg` 16 (cards/panels/modals/images) · `rounded-full`.
- Shadows (warm navy): `shadow-e1` resting cards · `shadow-e2` raised
  (header menus, form card) · `shadow-e3` floating (hover lift, modals, drawers). Never
  e3 at rest except modals.
- Z ladder (use arbitrary values): promo 30 · header/mega 40 · sticky CTA 45 · drawer 50
  · modal/lightbox 60 · toast 70 · tooltip 80 → `z-[var(--z-modal)]` etc.

---

## 2. Page-section rhythm

Backgrounds alternate `paper-50` → `kraft-100`; never two identical bands adjacent;
at most ONE `.dark-section` band per page between hero and footer; **CTABand is always
the last section before the footer**; FAQ (when present) sits directly above it.

| Template | Section order (bg) |
|---|---|
| T1 Home | PromoBar (ink-900) · Header · Hero (paper-50) · TrustStrip (paper-50, compact) · CategoryTiles (kraft-100) · FeaturedProducts (paper-50) · ProcessSteps (kraft-100) · Materials/Sustainability split (paper-50) · Stats band (`.dark-section`, compact) · ReviewWall (paper-50) · FAQAccordion (kraft-100) · CTABand (paper-50 wrapper, kraft card) · Footer (`.dark-section`) |
| T2 Category | Interior hero (kraft-100) · Product grid (paper-50) · SEO copy + SpecTable (kraft-100) · FAQAccordion (paper-50) · CTABand · Footer |
| T3 Product | Breadcrumb + Gallery/Info (paper-50) · SpecTable + description (kraft-100) · Related products (paper-50) · FAQAccordion (kraft-100) · CTABand · Footer |
| T4 Quote | Interior hero compact (kraft-100) · QuoteForm + trust sidebar (paper-50) · Footer (no CTABand, no StickyMobileCTA — the page IS the CTA) |
| Content pages | Interior hero (kraft-100) · prose sections alternating · FAQ where content has one (ONE block max — audit) · CTABand · Footer |

Every section: `<section class="section bg-…"><div class="container-hm">…</div></section>`.
Section header pattern (start of most sections): `.eyebrow` + `h2` + optional
`.lead text-slate-600 max-w-[52ch]`, `flex flex-col gap-3`, `mb-10 md:mb-12`; centered
variant for FAQ/CTA/Reviews (`items-center text-center mx-auto`).

---

## 3. Accessibility requirements (quality budget — QA enforces)

- **Focus ring:** global `:focus-visible { outline: 2px solid var(--focus-ring-color); outline-offset: 2px }`
  is already in globals.css. Don't remove it; components needing a custom indicator must
  be equal-or-stronger (inputs use border+halo, §5.2). Inside `.dark-section` the ring is
  paper-50 automatically. Tailwind recipe when needed explicitly:
  `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring-color)]`.
- **Skip link** (BE-1 layout, first child of `<body>`):
  `<a href="#main" class="skip-link">Skip to content</a>` + `<main id="main">`.
- **Disclosure triggers** (mega menu, drawer, accordion, mobile sub-nav): `<button>` with
  `aria-expanded` + `aria-controls`. Mega menu trigger also `aria-haspopup="true"`.
- **Drawer/Modal/Lightbox:** `role="dialog" aria-modal="true" aria-labelledby`, focus
  trap, Escape closes, focus returns to the trigger, body scroll-locked while open.
- **Accordion:** heading wraps button: `<h3><button aria-expanded aria-controls>`;
  panel `role="region" aria-labelledby`.
- **Tabs:** `tablist/tab/tabpanel` roles, arrow-key roving tabindex, `aria-selected`.
- **Forms:** visible `<label for>` ALWAYS (audit — placeholder is never the label),
  `aria-invalid` + `aria-describedby` for errors/help, error summary focus management
  (focus first invalid on submit).
- **Touch targets:** ≥44×44px for every interactive element below `md` (tokens
  `--space-11`; drawer rows, accordion triggers, sticky CTA buttons already specced).
- **Icons:** lucide-react, decorative icons `aria-hidden="true"`; icon-only buttons get
  `aria-label`.
- **aria-current:** `page` on active nav links + breadcrumb tail; `step` on quote
  progress.
- **Images:** product imagery uses live URLs with descriptive `alt` (product name); the
  dieline + decorative SVGs `aria-hidden="true"`.
- One `<h1>` per page (hero owns it) — everything else `h2+` or `.h1` visual class.

---

## 4. Motion map (classes from `styles/animations.css`)

| Motion | Class(es) | Applies to |
|---|---|---|
| Scroll reveal (fade-up 16px, 350ms) | `.reveal` + `data-inview` | section headers, single blocks |
| Staggered reveal (70ms/child) | `.reveal-stagger` (+ `--stagger-i`) | card grids, steps, footer cols (children = grid cells, cards nested inside — composition rule) |
| Hero entrance (one-time, ~1.2s total) | `.hero-enter` (children), `.hero-enter-visual`, `.draw-in` on inlined dieline SVG | home hero ONLY |
| Card hover lift (-4px, e3, img 1.04) | `.card-lift` + `.card-media` | ProductCard, CategoryTile, BlogCard, case-study cards |
| Press | `.press` | all buttons + chips |
| CTA sheen (6s loop, pausable) | `.sheen` (+ `.is-paused` / `[data-motion="paused"]`) | hero primary CTA + CTABand primary — max ONE visible per viewport |
| Chevron rotate | `.chevron` on icon, `aria-expanded` on trigger | accordion, drawer subgroups, select-like triggers |
| Menu fade+slide 200ms | `.menu-pop` + `data-open` | mega menu, dropdowns, search popover |
| Drawer slide | `.drawer-panel` + `.overlay-fade` + `data-open` | mobile nav, filter drawer |
| Mount transitions | `.anim-fade-in` / `.anim-rise-in` / `.anim-pop-in` | accordion content, tab panels, modal, tooltip |
| Toast lifecycle | `.toast-enter` / `.toast-exit` | Toast |
| Loading pulse | `.skeleton` | Skeleton primitive |

Budget: per viewport at most one looping animation (sheen) and one reveal batch.
Accordion/dropdown panel **height is never animated** — chevron + content fade only.

---

## 5. Primitives (FE-1 — `components/ui/`)

### 5.1 Button
- Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap select-none font-display font-semibold rounded-md press transition-colors duration-200 ease-brand disabled:opacity-50 disabled:pointer-events-none`
  (global focus ring applies; add the explicit recipe if the default is suppressed).
- Sizes: `sm` `h-9 px-4 text-sm` · `md` (default) `h-11 px-6 text-base` · `lg` `h-[52px] px-8 text-base`.
- Variants:
  - `primary`: `bg-terra-500 text-white hover:bg-terra-600 shadow-e1 hover:shadow-e2` — label ≥16px (md/lg only for white-on-terra; sm primary uses `text-sm` → only with `text-white` on `bg-ink-900`? No: sm primary allowed only in dark sections or as icon+label ≥14 semibold — prefer md).
  - `secondary`: `border border-ink-700 text-ink-700 bg-transparent hover:bg-ink-700 hover:text-white`. In `.dark-section`: `border-[var(--color-border-strong)] text-white hover:bg-white hover:text-ink-900`.
  - `ghost`: `text-ink-700 hover:bg-ink-100`.
  - `link`: `h-auto px-0 rounded-none text-terra-600 underline underline-offset-4 hover:text-terra-500` (≥14px semibold).
- Icon: lucide 18px (16 at `sm`), `aria-hidden`; icon-only → square (`w-11`) + `aria-label`.
- States: hover (above) · active `.press` scale .98 · focus ring · disabled 50% + no events · loading: `Loader2` spinning + `aria-busy` + label kept.
- `.sheen` ONLY on hero / CTABand primary.
- `asChild`-style link support: render `<a>`/`next/link` with same classes for nav CTAs.

### 5.2 Input (+ Textarea) — visible label pattern (audit)
```
<div class="flex flex-col gap-1.5">
  <label for={id} class="text-sm font-semibold text-ink-700">Quantity <span class="text-terra-600" aria-hidden="true">*</span></label>
  <input id={id} class="h-11 w-full rounded-md border border-ink-100 bg-white px-4 text-base text-ink-900
    placeholder:text-slate-400 hover:border-slate-400
    focus:outline-none focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)]
    disabled:bg-kraft-100 disabled:text-slate-400 disabled:cursor-not-allowed
    transition-[border-color,box-shadow] duration-200 ease-brand" />
  <p class="text-sm text-slate-600">Help text (id referenced by aria-describedby)</p>
</div>
```
- Error state: `border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(179,64,42,0.12)]` +
  `aria-invalid="true" aria-describedby={errorId}`; message:
  `<p id={errorId} class="flex items-center gap-1.5 text-sm text-error"><CircleAlert size={16} aria-hidden /> …</p>`.
- Textarea: same chrome, `min-h-[120px] py-3 resize-y`.
- Never placeholder-as-label; placeholder is example text only.

### 5.3 Select
Native `<select>` (zero-JS): input chrome + `appearance-none pr-10 cursor-pointer`, wrapper
`relative` with `<ChevronDown size={18} class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />`.
Same label/error/disabled patterns as Input.

### 5.4 Checkbox + Checkbox chip
- Plain checkbox: native input `h-5 w-5 shrink-0 accent-[var(--color-terra-500)]`, label
  `flex min-h-[44px] items-center gap-3 text-base text-slate-600 cursor-pointer`.
- **Chip** (quote-form multi-select): `<label>` wraps `input.peer.sr-only` + span:
  `inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink-100 bg-white px-5 text-sm font-semibold text-ink-700 cursor-pointer transition-colors duration-200 ease-brand hover:border-slate-400 peer-checked:bg-terra-100 peer-checked:border-terra-500 peer-checked:text-terra-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring-color)]`
  + `<Check size={16} class="hidden peer-checked:inline" aria-hidden />` (place icon span inside the same peer scope). Group: `flex flex-wrap gap-2` inside `<fieldset>` with visible `<legend>` styled as field label.

### 5.5 FileUpload dropzone
Zone: `flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-400 bg-white px-6 py-10 text-center cursor-pointer transition-colors duration-200 ease-brand` (+ hidden `<input type="file">`; zone is a `<button type="button">` or label — keyboard operable).
- idle: `UploadCloud size={28} class="text-slate-400"` · `<span class="text-base font-semibold text-ink-700">Drag artwork here or <span class="text-terra-600 underline underline-offset-4">browse</span></span>` · hint `text-sm text-slate-600` "PDF, AI, EPS, PNG — max 25 MB".
- hover/focus: `hover:border-terra-500 hover:bg-terra-100` + focus ring.
- dragover (`data-drag` via JS): `border-terra-500 bg-terra-100`.
- uploading: progress rail `h-1.5 w-full max-w-[280px] rounded-full bg-ink-100 overflow-hidden` + bar `h-full w-full origin-left bg-terra-500` scaled via `style={{transform: scaleX(p)}}` (transform, not width) + `aria-live="polite"` percent text.
- success: zone collapses to file chip `flex items-center gap-3 rounded-md border border-ink-100 bg-paper-50 px-4 py-3` → `FileText size={18} class="text-terra-600"` + `text-sm font-semibold text-ink-900 truncate` filename + size `text-sm text-slate-600` + remove ghost icon-button 36px (`aria-label="Remove file"`).
- error: `border-error bg-[rgba(179,64,42,0.06)]` + standard error message below.

### 5.6 Badge
Base: `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold leading-none`.
Variants: `neutral` `bg-ink-100 text-ink-700` · `kraft` `bg-kraft-100 text-slate-600` ·
`accent` `bg-terra-100 text-terra-600` · `success` `bg-[rgba(46,125,79,0.12)] text-success` ·
`error` `bg-[rgba(179,64,42,0.12)] text-error` · `outline` `border border-ink-100 text-slate-600` ·
`gold` (decorative "Popular"): `bg-[rgba(201,162,39,0.18)] text-ink-900` + `<Star size={12} class="text-gold-500 fill-gold-500" aria-hidden />`.

### 5.7 Rating
`<div role="img" aria-label="Rated 4.8 out of 5 from 132 reviews" class="flex items-center gap-0.5">`
stars: `Star` lucide, filled `text-gold-500 fill-gold-500`, empty `text-ink-100 fill-ink-100`;
sizes sm 14 / md 18; optional text `ml-1.5 text-sm text-slate-600`. **Audit:** render only
from real `content/reviews.json` data; never fabricate values; never feed JSON-LD.

### 5.8 Breadcrumbs
`<nav aria-label="Breadcrumb">` > `<ol class="flex flex-wrap items-center gap-1.5 text-sm">`;
item links `text-slate-600 hover:text-terra-600 transition-colors duration-150 ease-brand`;
separator `<ChevronRight size={14} class="text-slate-400" aria-hidden />`; current
`text-ink-900 font-semibold` + `aria-current="page"` (line-clamp-1 on long product names).
≤480: keep first + last two crumbs, collapse middle to `…`. Placement: top of interior
hero, `mb-4`. BreadcrumbList JSON-LD comes from `lib/seo.ts` (SEO-2) — component renders
visual only.

### 5.9 Accordion
Container `divide-y divide-ink-100 border-y border-ink-100` (minimal hairline style).
Trigger: `<h3 class="contents"><button class="flex min-h-[44px] w-full items-center justify-between gap-4 py-5 text-left font-display text-[17px] font-semibold text-ink-900 hover:text-terra-600 transition-colors duration-150 ease-brand" aria-expanded aria-controls>` + `<ChevronDown size={20} class="chevron shrink-0 text-slate-600" aria-hidden />`.
Panel: `role="region" aria-labelledby`, toggled with `hidden` (height change instant —
motion rule); inner `<div class="anim-fade-in pb-5 pr-10 text-slate-600">`.
Behavior: single-open (opening one closes others). Used by FAQAccordion + drawer subgroups
(drawer variant allows multi-open).

### 5.10 Tabs
List `role="tablist"` `flex gap-1 overflow-x-auto border-b border-ink-100`; tab
`relative h-11 px-4 text-sm font-semibold text-slate-600 hover:text-ink-900 transition-colors duration-150 ease-brand aria-selected:text-ink-900 after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-terra-500 after:opacity-0 after:transition-opacity after:duration-200 aria-selected:after:opacity-100`
(`aria-selected:` via `data-[state=active]:` or class toggle if variant unavailable).
Arrow-key roving tabindex; panel `role="tabpanel"` `anim-fade-in pt-6`.

### 5.11 Tooltip
Trigger gets `aria-describedby`; tip: `z-[var(--z-tooltip)] max-w-[240px] rounded-md bg-ink-900 px-3 py-2 text-xs leading-normal text-white shadow-e2 anim-fade-in`,
8px offset from trigger. Show on hover (300ms delay) AND `:focus-visible`; hide instantly
on leave/blur/Escape. Never put essential content only in tooltips.

### 5.12 Modal / Drawer
- Modal: wrapper `fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4`; backdrop
  `absolute inset-0 bg-[var(--color-overlay)] anim-fade-in`; panel
  `relative w-full max-w-[560px] rounded-lg bg-white p-6 md:p-8 shadow-e3 anim-pop-in`
  (centering via grid, NOT translate — `.anim-pop-in` owns transform). Close: ghost
  icon-button 44px top-right.
- Drawer (filters / utility): panel `fixed inset-y-0 right-0 z-[var(--z-drawer)] w-[min(88vw,360px)] bg-white shadow-e3 drawer-panel` + `.overlay-fade` backdrop, both toggled
  with `data-open`.
- Both: dialog semantics per §3, scroll lock, Esc, focus trap + return.

### 5.13 Toast
Viewport: `fixed z-[var(--z-toast)] bottom-[calc(72px+env(safe-area-inset-bottom))] inset-x-4 md:inset-x-auto md:bottom-6 md:right-6 flex flex-col gap-2`
(mobile offset clears StickyMobileCTA). Toast:
`flex items-start gap-3 rounded-md border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 shadow-e3 toast-enter` →
icon `CheckCircle2 text-success` / `CircleAlert text-error` (20, `aria-hidden`), message,
close X ghost 36px. `role="status"` (success/info), `role="alert"` (error). Auto-dismiss
5s, paused on hover/focus; apply `.toast-exit` then unmount on animationend.

### 5.14 Skeleton
`.skeleton` + shape: text `h-4 w-4/5` · title `h-6 w-3/5` · media `aspect-[4/3] w-full rounded-lg` · button `h-11 w-32 rounded-md`. Container `aria-busy="true"`, skeletons
`aria-hidden="true"`. Use for search results / quote-form async bits only (site is SSG).

---

## 6. Patterns (FE-2 nav/layout · FE-3 content)

### 6.1 Header + MegaMenu (FE-2)
- Bar: `sticky top-0 z-[var(--z-header)] h-[var(--header-h)] border-b border-ink-100 bg-[var(--header-bg-blur)] backdrop-blur-md`; inner `container-hm flex h-full items-center gap-6`.
- Logo: live asset, `h-9 md:h-10 w-auto`, links home, `alt="HM Custom Packaging"`.
- Desktop nav (`hidden lg:flex items-center gap-1`): Products (mega), Industries,
  Materials, Box Styles, How It Works, Blog, Contact. Link:
  `flex h-11 items-center rounded-md px-3 text-[15px] font-semibold text-ink-700 hover:text-terra-600 transition-colors duration-150 ease-brand`,
  active route `text-terra-600` + `aria-current="page"`.
- Right cluster: phone ghost (`hidden md:inline-flex`, `Phone` 18 + number from globals) +
  `Get a Quote` primary `sm`→`md` at lg. Burger ghost icon-button 44px `lg:hidden`
  (`aria-label="Open menu"`, `aria-expanded`, `aria-controls="mobile-nav"`).
- **MegaMenu (3-panel):** trigger button (`aria-haspopup="true" aria-expanded aria-controls`),
  opens on hover with 150ms intent delay AND on click/Enter/ArrowDown. Panel:
  `menu-pop absolute inset-x-0 top-full border-t border-ink-100 bg-white shadow-e3` +
  inner `container-hm grid grid-cols-[240px_1fr_280px] gap-8 py-8`:
  1. **Rail** (group nav): vertical list — e.g. *By Industry*, *By Style*, *Bags & Mylar*,
     *Business Essentials*. Item: `flex h-11 w-full items-center justify-between rounded-md px-4 text-sm font-semibold text-ink-700 hover:bg-kraft-100 data-[active=true]:bg-kraft-100 data-[active=true]:text-terra-600` + `ChevronRight` 16. Hover/focus switches panel 2.
  2. **Links panel**: heading `.eyebrow mb-2` + `grid grid-cols-2 gap-x-8 content-start`;
     link row `flex h-10 items-center rounded-md px-3 text-sm text-slate-600 hover:bg-paper-50 hover:text-terra-600 transition-colors duration-150` — the 22 category slugs grouped under the rail items + "All products →" tail link.
  3. **Promo card**: `rounded-lg bg-kraft-100 p-6 flex flex-col gap-3` — product image
     `rounded-md aspect-[4/3] object-cover`, `h4` title, promo from `globals.json`
     ("Get 10% off — code WELCOME10") + primary `sm` → `/get-custom-quote`.
- Close on: Escape (focus → trigger), focus leaving panel, outside click, route change.
- Responsive: mega only ≥1024; 768–1023 keeps logo + phone + CTA + burger; ≤480 hides
  phone ghost (lives in drawer + sticky CTA).

### 6.2 MobileNavDrawer (FE-2)
- `id="mobile-nav"`, overlay `.overlay-fade fixed inset-0 z-[var(--z-drawer)] bg-[var(--color-overlay)]` + panel `.drawer-panel fixed inset-y-0 right-0 z-[var(--z-drawer)] flex w-[min(88vw,360px)] flex-col bg-white`.
- Head: `flex h-[var(--header-h)] items-center justify-between border-b border-ink-100 px-5` — logo small + close 44px (`aria-label="Close menu"`).
- Nav (`flex-1 overflow-y-auto py-2`): **every row full-width, min-h 44px** —
  top-level: `flex min-h-[44px] w-full items-center justify-between px-5 text-base font-semibold text-ink-900 active:bg-paper-50`;
  Products row is an accordion trigger (`.chevron`, `aria-expanded`) revealing grouped
  category links: `flex min-h-[44px] items-center pl-8 pr-5 text-[15px] text-slate-600 active:bg-paper-50` (multi-open allowed). Hairlines `divide-y divide-ink-100` between top-level rows.
- Foot (`border-t border-ink-100 p-5 flex flex-col gap-3`): Call secondary `md` full-width
  (tel from globals) + Get a Quote primary `md` full-width + email link `text-sm text-slate-600 text-center`.
- Dialog semantics, focus trap, Esc, scroll lock, focus returns to burger. Closes on route
  change. 350ms slide (`--dur-slow`).

### 6.3 Footer (FE-2)
- `<footer class="dark-section">` → main `container-hm py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]`:
  1. Logo (white/inverted treatment), blurb `text-sm max-w-[36ch] text-[var(--color-text)]`,
     social icon-buttons 36px (`rounded-full border border-[var(--color-border)] hover:border-[var(--color-border-strong)]`, lucide, aria-labels) from `globals.json.social`.
  2. "Popular categories" — 7±2 links.
  3. "Company" — About, How It Works, Materials, Sustainability, Case Studies, Reviews, Blog, FAQs, Contact, Samples.
  4. "Get in touch" — address, `tel:` link, `mailto:` link (all from globals), then payment
     methods as PLAIN TEXT (audit — no fake badges): `text-xs text-[var(--color-text-muted)]` "We accept: Visa · Mastercard · Amex · Discover · PayPal".
  - Column heading: `font-display text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-heading)] mb-4`. Links: `block py-1.5 text-sm text-[var(--color-text)] hover:text-[var(--color-link)] transition-colors duration-150 ease-brand`.
- Bottom bar: `border-t border-[var(--color-border)]` → `container-hm py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-[var(--color-text-muted)]`:
  `© {new Date().getFullYear()} HM Custom Packaging. All rights reserved.` (audit: auto year)
  + legal links (Terms, Shipping, Returns, Privacy, Sitemap).
- Responsive: 4-col ≥1024 · 2-col 768 · 1-col below (gap-10). Footer cols may use
  `.reveal-stagger`.

### 6.4 PromoBar (FE-2)
`bg-ink-900` strip ABOVE the header (scrolls away, not sticky):
`<a href={promo.href} class="flex min-h-10 items-center justify-center gap-2 px-4 text-center text-[13px] font-semibold text-ink-100 hover:text-white transition-colors duration-150 ease-brand">`
→ "{promo.text} — code" + `<span class="rounded-sm bg-[rgba(255,255,255,0.12)] px-2 py-0.5 tracking-wider">{promo.code}</span>`.
Audit: whole bar is the link; text+code from `globals.json.promo`.

### 6.5 Hero — home (FE-2)
- Section: `relative overflow-hidden bg-paper-50`; decorative wash:
  `absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(242,236,227,0.95),transparent)] pointer-events-none` `aria-hidden`.
- Inner: `container-hm relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]`.
- Text col `hero-enter flex flex-col items-start gap-5`:
  1. `.eyebrow` "Premium custom packaging"
  2. `<h1>` — THE page h1, `max-w-[16ch]`
  3. `.lead text-slate-600 max-w-[52ch]` (mentions SLA/free shipping — text from globals via props)
  4. CTA row `flex flex-wrap gap-3`: primary `lg` `.sheen` "Get a Custom Quote" → `/get-custom-quote` + secondary `lg` "Browse Products" → `/products`
  5. trust row `flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600` — 3 items
     (MOQ / SLA / free US shipping from globals), each `flex items-center gap-2` + `Check size={16} class="text-terra-600"`.
- Visual col: `hero-enter-visual` → panel `rounded-lg bg-kraft-100 p-8 md:p-12` containing
  the INLINED `public/dieline.svg` with `class="draw-in w-full max-w-[520px] text-ink-700"`
  (`aria-hidden="true"`). One-time draw ~1.2s; fold lines fade at ~0.85s.
- Responsive: 1-col below 1024 (visual after text, `max-w-[420px]` self-center); ≤480
  CTAs full-width (`w-full min-[480px]:w-auto`).

### 6.6 Hero — interior (FE-2, used by T2/T3/content pages)
`bg-kraft-100 border-b border-ink-100` → `container-hm py-10 md:py-14`:
Breadcrumbs (`mb-4`) → `<h1 class="max-w-[24ch]">` → optional `.lead text-slate-600 max-w-[60ch] mt-3`.
May use `.hero-enter` (≤3 children). NO dieline, NO sheen — the draw-in signature is
home-exclusive.

### 6.7 ProductCard (FE-3) — equal height + word-boundary truncation (audit)
- Grid (parent): `grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3` (products hub may add
  `xl:grid-cols-4`), wrapped in `.reveal-stagger` — **grid cell is the stagger child; card
  nested inside** (composition rule).
- Card: `group card-lift relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-e1`
  (equal height: `h-full` + grid stretch; CTA pinned with `mt-auto`).
- Media: `card-media relative aspect-[4/3] bg-kraft-100` + `next/image fill object-cover`
  `sizes="(min-width:1024px) 33vw, (min-width:480px) 50vw, 100vw"`.
- Body `flex flex-1 flex-col gap-2 p-5`:
  - category `text-xs font-semibold uppercase tracking-[0.08em] text-slate-600`
  - title `<h3 class="h4 line-clamp-2">` wrapped in the card link:
    `<Link class="after:absolute after:inset-0">{name}</Link>` (stretched link — one tab
    stop, accessible name = product name). `line-clamp-*` = word-boundary truncation; the
    single-line `truncate` utility is FORBIDDEN for content text (mid-word cuts).
  - optional excerpt `text-sm text-slate-600 line-clamp-2`.
- Footer `mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-terra-600 group-hover:text-terra-500`:
  "Get a quote" + `ArrowRight size={16}` (visual affordance inside the stretched link area).
- Keyboard: `has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--focus-ring-color)]` on the card; lift mirrors via `:focus-within`.
- For JS-side string truncation (meta descriptions, search snippets) use the shared
  word-boundary helper (FE-3 owns `lib/format.ts`):
  `truncateAtWord(s, max)` → if `s.length <= max` return `s`; else cut at `max`, backtrack
  to last space, trim trailing punctuation, append `…`. Never cuts mid-word.

### 6.8 CategoryTile (FE-3)
`<Link class="group card-lift relative block aspect-[4/3] overflow-hidden rounded-lg" aria-label={name}>`
→ `.card-media absolute inset-0` with image fill cover → scrim
`absolute inset-0 bg-[image:var(--scrim-tile)]` `aria-hidden` → content
`absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5`:
`<span class="h4 text-white">{name}</span>` + arrow chip
`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors duration-200 ease-brand group-hover:bg-terra-500` + `ArrowRight size={18}`.
Grid: `grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4` + `.reveal-stagger`.

### 6.9 QuoteForm — 2-step with progress (FE-3 + BE-3 server action)
- Page layout (T4): `container-hm section grid gap-10 lg:grid-cols-[1fr_360px]`.
  - Form card: `rounded-lg border border-ink-100 bg-white p-6 md:p-10 shadow-e2`.
  - Sidebar (`hidden lg:flex flex-col gap-6`): kraft trust panel `rounded-lg bg-kraft-100 p-6`
    — SLA, MOQ, free shipping rows (globals, `Check` icons), divider, "Prefer to talk?"
    + phone secondary button; mini "What happens next" 3-step list.
- **Progress** (`<ol class="mb-8 flex items-center gap-3">`, item `aria-current="step"`):
  dot `flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold` —
  active `bg-terra-500 text-white` · done `bg-terra-100 text-terra-600` (+`Check` 16) ·
  upcoming `bg-ink-100 text-slate-600`; label `text-sm font-semibold` (active `text-ink-900`,
  else `text-slate-600`, hidden ≤480 except active); connector `h-px flex-1 bg-ink-100`,
  done → `bg-terra-500`.
- **Step 1 — "Your packaging"** (`<h2 class="h3" tabIndex={-1}>` receives focus on step change):
  fields `grid gap-5 md:grid-cols-2` — Product type (Select, from categories) · Box style
  (Select) · Dimensions `grid grid-cols-3 gap-3` L/W/H Inputs + unit Select (in/cm) spanning
  one cell · Quantity (Input number, help text = MOQ from globals) · Material (Checkbox
  chips: Kraft, Corrugated, Rigid, Cardstock) · Finish (chips: Matte, Gloss, Soft-touch,
  Foil, Embossing, Window) — chip fieldsets span 2 cols. Footer `mt-8 flex justify-end`:
  Continue primary `md` + `ArrowRight`.
- **Step 2 — "Your details"**: Name* · Company · Email* · Phone · Notes (Textarea) ·
  Artwork (FileUpload, optional) · small privacy note `text-sm text-slate-600` with link.
  Footer `mt-8 flex flex-col-reverse gap-3 min-[480px]:flex-row min-[480px]:justify-between`:
  Back ghost `md` + Submit primary `md` (pending: disabled + `Loader2` spin + "Sending…").
- Validation: zod in server action (BE-3); inline errors per §5.2; on invalid submit focus
  first errored field; step 1 state preserved on Back. Success → redirect `/thank-you`;
  server failure → error Toast.
- Step transition: new step panel gets `.anim-rise-in`. No StickyMobileCTA on this route.

### 6.10 StickyMobileCTA (FE-2)
`<nav aria-label="Quick actions" class="fixed inset-x-0 bottom-0 z-[var(--z-sticky-cta)] border-t border-ink-100 bg-[var(--header-bg-blur)] px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-md md:hidden">`
→ `flex gap-3`: Call secondary `flex-1 h-11` (`Phone` 18 + "Call us", tel from globals) +
Get a Quote primary `flex-1 h-11`.
Hidden on `/get-custom-quote`; hides while footer is in view (IO toggles
`translate-y-full` on the bar, paired with `transition-transform duration-300 ease-brand`).
BE-1: `<main>` gets `pb-24 md:pb-0` so content clears the bar; Toast viewport already
offsets (§5.13).

### 6.11 SpecTable (FE-3)
`<div class="overflow-hidden rounded-lg border border-ink-100">` →
`<table class="w-full border-collapse text-sm">` + sr-only `<caption>`:
row `border-b border-ink-100 last:border-0`; `<th scope="row" class="w-2/5 md:w-[260px] bg-kraft-100 px-4 py-3.5 text-left align-top font-semibold text-ink-700">` ·
`<td class="bg-white px-4 py-3.5 text-slate-600">`. No zebra needed (th column carries the
rhythm). Mobile: th narrows to 40% — no horizontal scroll. Typical rows: Material,
Style, Sizes, Printing, Finishes, MOQ (globals), Turnaround (globals), Shipping (globals).

### 6.12 ProcessSteps (FE-3)
`<ol class="reveal-stagger grid gap-8 md:grid-cols-2 lg:grid-cols-4">`; step (li > div per
composition rule): `relative flex flex-col items-start gap-3` —
number chip `flex h-12 w-12 items-center justify-center rounded-full bg-terra-100 font-display text-lg font-bold text-terra-600` ·
overline `text-xs font-bold uppercase tracking-[0.08em] text-slate-600` "Step 1" ·
`h3.h4` title · `text-sm text-slate-600` body.
Connector ≥1024: `lg:after:absolute lg:after:left-[64px] lg:after:right-[-16px] lg:after:top-6 lg:after:h-px lg:after:bg-ink-100 lg:last:after:hidden` `aria-hidden`.
Canonical 4 steps: Get a Quote → Free Design Support → Production (SLA from globals) →
Delivery (free US shipping).

### 6.13 ReviewWall (FE-3)
Section header centered + note `text-sm text-slate-600` "Reviews imported from Trustpilot —
verification in progress." (audit: placeholder data `source:"trustpilot",
verified:false`; TODO client swap; NO fabricated content, NO aggregate-rating schema).
Wall: `columns-1 gap-6 min-[480px]:columns-2 lg:columns-3` (masonry); card
`mb-6 break-inside-avoid rounded-lg border border-ink-100 bg-white p-6 shadow-e1 flex flex-col gap-3`:
Rating sm (real values only) · quote `text-[15px] leading-relaxed text-slate-600` ·
footer `flex items-center justify-between`: name `text-sm font-semibold text-ink-900` +
Badge outline "Trustpilot". No card-lift (cards aren't links). Section uses `.reveal`.

### 6.14 FAQAccordion (FE-3)
`container-hm section` → `mx-auto max-w-[800px]`: centered header (`.eyebrow` "FAQs" + h2)
→ `mt-10` Accordion (§5.9, single-open). **Exactly ONE FAQ block per page** (audit).
FAQPage JSON-LD emitted by the page via `lib/seo.ts` from the same items (SEO-2) — the
component itself renders no schema.

### 6.15 CTABand (FE-2) — kraft background (audit/brief)
Wrapper section `section-compact` (paper-50 page bg) → `container-hm` → band
`relative overflow-hidden rounded-lg bg-kraft-100 px-6 py-12 text-center md:px-16 md:py-16`:
decorative dieline `absolute -bottom-24 -right-16 w-[320px] text-ink-700 opacity-[0.08] pointer-events-none` (static inline SVG, `aria-hidden`, NO `.draw-in`) →
content `relative flex flex-col items-center gap-5`: h2 (`max-w-[22ch]`) · sub
`text-slate-600 max-w-[48ch]` · row `flex flex-col min-[480px]:flex-row items-center gap-3`:
primary `lg` `.sheen` "Get a Custom Quote" + tel link `text-sm font-semibold text-ink-700 hover:text-terra-600 transition-colors duration-150` "or call {phone}".
Band gets `.reveal`.

### 6.16 GalleryLightbox (FE-3, T3 product)
- Inline gallery: main `relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-100 bg-white` (click/Enter opens lightbox — it's a `<button>` with
  `aria-label="Open image viewer"`); thumbs `mt-4 grid grid-cols-5 gap-3`, thumb
  `<button class="relative aspect-square overflow-hidden rounded-md border border-ink-100 transition-colors duration-150 ease-brand hover:border-slate-400 data-[active=true]:border-terra-500 data-[active=true]:shadow-[0_0_0_1px_var(--color-terra-500)]">`.
- Lightbox (z modal): backdrop `bg-[rgba(11,37,54,0.85)] anim-fade-in`; stage
  `fixed inset-0 grid place-items-center p-4`; `next/image` `max-h-[85vh] w-auto rounded-md anim-fade-in` (alt = product name + index); controls: prev/next
  `flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20` (`ChevronLeft/Right` 24, aria-labels), sides on
  ≥768, bottom-center row ≤767; counter `text-sm text-white/70`; close 44px top-right.
- Keyboard: ←/→ navigate, Esc closes, focus trap, return focus to opener. Dialog
  semantics per §3.

### 6.17 BlogCard (FE-3)
`group card-lift relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-e1`:
media `card-media relative aspect-[16/9] bg-kraft-100` (image fill cover) → body
`flex flex-1 flex-col gap-2 p-5`: meta `flex items-center gap-2 text-xs text-slate-600`
(date `<time>` · "·" · read time) → title `<h3 class="h4 line-clamp-2">` with stretched
link (as §6.7) → excerpt `text-sm text-slate-600 line-clamp-3` → footer
`mt-auto pt-3 text-sm font-semibold text-terra-600 group-hover:text-terra-500 flex items-center gap-1` "Read article" + `ArrowRight` 16.
Grid: `grid gap-6 md:grid-cols-2 lg:grid-cols-3` + `.reveal-stagger`. Equal height as §6.7.

---

## 7. Audit-finding hooks (build-time checklist)

| Finding | Where it's enforced |
|---|---|
| Single H1/page | Hero owns `<h1>`; everything else h2+/visual classes (§1.2, §6.5/6.6) |
| One FAQ block/page | §6.14; page templates include at most one |
| Correct tel link | All phone UI uses `globals.json.phoneHref` (Header, Drawer, StickyCTA, Footer, CTABand, Quote sidebar) |
| Single SLA/MOQ/shipping source | globals.json via props (§0.8); SpecTable/Hero/sidebar all read it |
| Linked promo bar w/ code | §6.4 PromoBar — whole bar links `promo.href`, shows `promo.code` |
| No fake badges | Footer payment methods = plain text list (§6.3) |
| No fabricated testimonials | §6.13 — reviews.json placeholders marked trustpilot/unverified + visible note; no rating schema |
| Real 404 | BE-2 `not-found.tsx`: interior-hero style, h1 "Page not found", search/category links, primary CTA home |
| Visible form labels | §5.2 — label element always rendered |
| Word-boundary truncation | `line-clamp-*` only + `truncateAtWord()` helper; `truncate` forbidden for content (§6.7) |
| Equal-height cards | `h-full flex-col` + `mt-auto` footer in grids (§6.7/6.17) |
| Footer year auto | `new Date().getFullYear()` (§6.3) |
| Focus-visible / skip link / aria-expanded | §3 + globals.css |

---

## 8. Assets

- `public/dieline.svg` — hero signature line drawing (strokes, `currentColor`,
  `pathLength="100"`, named ids: `cut-outline`, `thumb-notch`, `fold-*`). MUST be inlined
  as JSX to animate (`.draw-in`); as decoration elsewhere render static (CTABand corner).
  Color via wrapper text color: `text-ink-700` on light, `text-terra-100`/`text-ink-100`
  in dark sections.
- Logo + product images: live URLs from `www.hmcustompackaging.com` (next/image
  remotePatterns — already configured). Footer logo on ink-900: use the white/light
  variant if available, else wrap with `brightness-0 invert` filter classes.
- Payment "icons": text list only (audit).

## 9. Definition of done (every FE PR)

- [ ] Tokens/classes from this spec — no raw hex, no invented shades/sizes
- [ ] States implemented: hover / focus-visible / active / disabled / error where relevant
- [ ] 480 / 768 / 1024 behavior matches the component spec
- [ ] Motion only via animations.css classes; checked with prefers-reduced-motion ON
- [ ] Keyboard pass: tab order, Esc, arrows where specced, focus return
- [ ] Touch targets ≥44px below md; `aria-*` per §3
- [ ] No layout-property animation, no `transition: all`, no console errors
