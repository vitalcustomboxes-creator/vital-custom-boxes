# FE-1 report — UI primitives (`components/ui/*`) — 2026-06-12

## What was done
All 17 contracted primitives + the §0.4 `<Reveal>` hard-contract component, built exactly to
docs/DESIGN_SPEC.md §5 (classes, states, motion hooks, a11y) on TS strict. `"use client"` ONLY
where interactivity demands it; everything else is server-compatible (no handlers/hooks except
`useId`, which RSC allows). Import everything from the barrel: `@/components/ui`.

**Files** (kebab-case; deep imports must match casing — prefer the barrel):
`components/ui/`: button.tsx, input.tsx, textarea.tsx, select.tsx, checkbox.tsx,
radio-group.tsx, file-upload.tsx*, badge.tsx, rating.tsx, breadcrumbs.tsx, accordion.tsx*,
tabs.tsx*, tooltip.tsx*, modal.tsx*, drawer.tsx*, toast.tsx*, skeleton.tsx, reveal.tsx*,
index.ts (barrel) + internal: cn.ts (`cx`), field.tsx (label/hint/error + input chrome),
use-dialog.ts (focus trap / Esc / scroll lock / focus return / `useMounted`). `*` = client.
Plus `tests/ui.smoke.test.tsx` (4 tests, green).

## Verification
- `npx tsc --noEmit`: **0 errors in FE-1 scope** (components/ui/*, tests/ui.smoke.test.tsx).
  25 remaining errors are other agents' in-progress files — logged in ISSUES, not fixed
  (app/page, app/[category], app/products/*, app/layout: BE-1↔FE-2/FE-3 prop mismatches;
  tests/actions.test.ts: BE-3 action return types).
- `npx vitest run tests/ui.smoke.test.tsx`: **4/4 pass** (Button button/link/loading,
  Input label+hint+error aria wiring, Accordion aria-expanded single-open).
- vitest.config.ts: NOT created by me — DEVOPS/BE-3 landed a two-project config (node/dom)
  mid-wave; my `*.test.tsx` runs in its jsdom project with tests/setup.ts. No handoff needed.

## Props tables

### Button (`button.tsx`, server-compatible)
| Prop | Type | Default | Notes |
|---|---|---|---|
| variant | `primary\|secondary\|ghost\|link` | `primary` | spec §5.1 recipes |
| size | `sm\|md\|lg` | `md` | sm `h-9`, md `h-11`, lg `h-[52px]` |
| loading | `boolean` | `false` | LoaderCircle spin + `aria-busy` + label kept + disabled |
| href | `string?` | — | `/…` → next/link, else `<a>` (auto `rel` on `_blank`); anchor attrs accepted |
| asChild | `boolean` | `false` | merges classes onto single element child (FE-2 pattern usage) |
| onDark | `boolean` | `false` | `.dark-section` recipes for secondary/ghost |
| sheen | `boolean` | `false` | hero/CTABand primary ONLY (max 1/viewport) |
| fullWidth | `boolean` | `false` | `w-full` |
| iconLeft / iconRight | `ReactNode` | — | wrapped `aria-hidden`; pass lucide size 18 (16 sm) |
| …rest | button OR anchor attrs | — | `type` defaults to `"button"` |

CONTRAST GUARD: `primary` + `size="sm"` label is force-bumped to `text-base` (white on
terra-500 = 3.2:1, large-text AA only). Prefer md/lg for primary anyway.

### Input / Textarea (`input.tsx`, `textarea.tsx`, server-compatible)
| Prop | Type | Notes |
|---|---|---|
| label | `ReactNode` **required** | visible `<label for>` (audit) + `*` when `required` |
| error | `string?` | sets `aria-invalid` + `aria-describedby` + CircleAlert message |
| hint | `string?` | help text, in `aria-describedby` (error id first) |
| containerClassName | `string?` | wrapper div |
| …rest | native input/textarea attrs incl. `ref`, `id` (auto via useId) | Textarea: `min-h-[120px] resize-y` |

### Select (`select.tsx`, server-compatible)
As Input, plus: `options?: {value,label,disabled?}[]`, `placeholder?: string` (disabled
first option; auto `defaultValue=""` when uncontrolled), `children` (`<option>` passthrough),
native select attrs. Chevron overlay included.

### Checkbox (`checkbox.tsx`, server-compatible)
| Prop | Type | Notes |
|---|---|---|
| label | `ReactNode` **required** | |
| variant | `default\|chip` | chip = quote-form finish/material pill (§5.4): peer-checked terra tint + Check icon, 44px, press |
| containerClassName | `string?` | wrapping `<label>` |
| …rest | native input attrs (`name`, `value`, `checked`, `defaultChecked`, `onChange`…) | works uncontrolled in plain forms |

Chip groups: wrap in `<fieldset>` + visible `<legend>`, `flex flex-wrap gap-2`.

### RadioGroup (`radio-group.tsx`, server-compatible uncontrolled)
| Prop | Type | Notes |
|---|---|---|
| label | `ReactNode` **required** | rendered as `<legend>` |
| name | `string` **required** | groups radios → native arrow-key nav |
| options | `{value, label, disabled?}[]` | 44px rows, accent terra |
| value / defaultValue | `string?` | controlled use REQUIRES `onValueChange` |
| onValueChange | `(v: string) => void` | |
| required / disabled / error / hint / id / className | | fieldset-level wiring |
| orientation | `vertical\|horizontal` | default vertical |

### FileUpload (`file-upload.tsx`, client)
| Prop | Type | Default | Notes |
|---|---|---|---|
| label | `ReactNode` **required** | | visible label |
| files / onFilesChange | `File[]?` / `(f: File[]) => void?` | — | controlled; omit BOTH for uncontrolled (internal state) — hidden input FileList synced via DataTransfer either way, so native FormData posts carry merged drag+browse files |
| maxFiles | `number` | `5` | count "n of 5 files" INSIDE the zone, `aria-live` |
| accept | `string` | `image/*,.pdf,.ai,.eps` | drops validated against it |
| maxSizeMb | `number` | `25` | per file |
| hint / error | `string?` | hint has default | error wins over internal "Skipped: …" notice |
| required / disabled / id / name / prompt / containerClassName | | | `name` for server-action posts |

Zone is keyboard-operable via the sr-only input (Enter/Space opens picker); focus ring on the
zone (`has-[input:focus-visible]`); dragover state via `data-drag`; chips with remove buttons
(`aria-label="Remove <name>"`).

### Badge (`badge.tsx`, server-compatible)
`variant: neutral|kraft|accent|success|error|outline|gold` (+span attrs). `gold` auto-renders
the star icon (decorative "Popular").

### Rating (`rating.tsx`, server-compatible, display-only)
`value` (clamped), `max=5`, `count?`, `size: sm|md` (14/18px), `showValue?`, `ariaLabel?`
(default "Rated X out of 5[ from N reviews]"), `className?`. `role="img"`. AUDIT: real
reviews.json values only; never feeds JSON-LD.

### Breadcrumbs (`breadcrumbs.tsx`, server-compatible)
`items: ({label: string} | {name: string}) & {href?})[]` — **`label` is canonical** (task
contract); `name` accepted because BE crumbs/JSON-LD use schema.org `name` (one object feeds
both). `ariaLabel?`, `className?`. Renders `null` for <2 items; last item = `aria-current="page"`
span + `line-clamp-1`; >3 items collapse middle to "…" below 480px (CSS-only).

### Accordion (`accordion.tsx`, client)
| Prop | Type | Default |
|---|---|---|
| items | `{id, title, content}[]` **required** | DOM ids: `${id}-trigger` / `${id}-panel` (FAQPage JSON-LD pairing) |
| mode | `single\|multiple` | `single` (FAQ); `multiple` for drawer subgroups |
| defaultOpenIds | `string[]` | `[]` |
| headingLevel | `2\|3\|4` | `3` (`<h3 class="contents">` wraps trigger) |
| onOpenChange | `(ids: string[]) => void` | — |

`hidden` toggling (no height animation — motion rule), `.chevron` rotate, `.anim-fade-in`
content, `role="region"` + `aria-labelledby`.

### Tabs (`tabs.tsx`, client)
`items: {id, label, content, disabled?}[]`, `defaultTabId?`, `ariaLabel?`, `onTabChange?`,
`className?`, `panelClassName?`. Roving tabindex (←/→ wrap, Home/End, selection follows
focus), `aria-selected` styling, panel remounts with `.anim-fade-in`. DOM ids `${id}-tab/-panel`.

### Tooltip (`tooltip.tsx`, client)
`content`, `children` (SINGLE focusable element — gets `aria-describedby`), `side: top|bottom`
(default top, 8px offset), `delayMs=300` (hover; focus shows instantly), `id?`, `className?`.
Hides on leave/blur/Escape. Tip stays mounted (`hidden`) so the description always resolves.

### Modal (`modal.tsx`, client)
`open`, `onClose`, `title?` (h2 + `aria-labelledby`) or `ariaLabel` (required if no title),
`children`, `className?` (panel), `closeLabel?`. Focus trap + Esc + backdrop click + scroll
lock + focus return; portal to body; `.anim-fade-in` backdrop / `.anim-pop-in` panel; put
`data-autofocus` on a child to choose initial focus.

### Drawer (`drawer.tsx`, client)
`open`, `onClose`, `side: left|right|bottom` (default right), `title?`/`ariaLabel`, `id?`
(FE-2: pass `id="mobile-nav"` for burger `aria-controls`), `className?` (panel),
`contentClassName?` (scroll area, default `p-5`), `closeLabel?`, `children`. Panel stays
mounted + `[data-open]` (`.drawer-panel`/`--left`, `.overlay-fade`); `inert` while closed;
same dialog plumbing as Modal; built-in 44px close button header row. `bottom` slides via
utility classes (see ISSUES note for DESIGNER).

### Toast (`toast.tsx`, client)
- `<ToastProvider>` wrap once (BE-1 layout, inside body). Renders viewport portal
  (bottom-right, mobile offset clears StickyMobileCTA, `z-toast`).
- `useToast() → { toast({message, variant?, duration?}), success(msg), error(msg), dismiss(id) }`.
  Auto-dismiss 5s (0 = sticky), paused on hover/focus; `.toast-enter/.toast-exit` lifecycle;
  success `role="status"` + `aria-live="polite"`, error `role="alert"`. Max 4 stacked.
- `<Toast variant exiting onDismiss …>` also exported standalone (presentational card).

### Skeleton (`skeleton.tsx`, server-compatible)
`variant: text|title|image|button|card` (+div attrs). `card` = composed media+title+2 lines.
Uses design-layer `.skeleton` shimmer; `aria-hidden` (set `aria-busy` on the loading container).

### Reveal (`reveal.tsx`, client — DESIGN_SPEC §0.4 hard contract)
`as?: ElementType` (default div), `stagger?: boolean`, `className?`, +HTML attrs. IO threshold
0.2, rootMargin `0px 0px -10% 0px`, sets `data-inview` once, unobserves. `stagger` injects
`--stagger-i` per element child (covers grids >12 children). REMINDER: needs BE-1's
`html[data-js]` script (ISSUES #16) for hidden states; safe without it.

### cx (`cn.ts`) — tiny class joiner, exported for pattern authors.

## Decisions & integration notes
1. **lucide-react 1.18 renamed icons** — Loader2→LoaderCircle, AlertCircle→CircleAlert,
   UploadCloud→CloudUpload, CheckCircle2→CircleCheck. Spec §5 references old names; ISSUE filed.
2. **Adapted to parallel consumers after first tsc run** (their imports predate my files):
   added Button `asChild` (Hero/Header/CTABand/StickyMobileCTA), FileUpload
   uncontrolled mode + `containerClassName` (QuoteForm posts natively), Breadcrumbs `name`
   alias (PageHero/BE-1 pages + schema.org alignment).
3. **Cross-file fixes (one-liners in other roles' files, per ISSUES protocol):**
   `components/blocks/PageHero.tsx` + `app/contact/page.tsx` (BE-2) — PascalCase deep imports
   of ui files → TS1149 casing clash; switched to lowercase/barrel, commented in-file.
4. Dialog Esc handling is per-dialog at document level — stacked dialogs (drawer+modal open
   together) would both receive Esc; avoid stacking or close the drawer when opening a modal.
5. Modal/Drawer/Toast portal to `document.body` — Header's `backdrop-filter` creates a
   containing block that would break `fixed` panels rendered inline.

## Perf notes
- Zero dependencies added; no CSS-in-JS; all motion via DESIGNER's classes (reduced-motion
  safe); server-compatible primitives add no client JS unless imported into client trees.
- Tooltip/Accordion/Tabs hold no timers when idle; Toast caps at 4 cards.

## Handoff
- FE-2/FE-3/BE-*: import from `@/components/ui` (barrel). Deep imports = lowercase only.
- BE-1: wrap layout content in `<ToastProvider>`; add the `data-js` script (ISSUES #16).
- QA-AUTO: smoke test file is `tests/ui.smoke.test.tsx`; extend freely.
