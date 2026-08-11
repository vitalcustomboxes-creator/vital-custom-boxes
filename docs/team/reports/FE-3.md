# FE-3 REPORT — content patterns & forms UI
Author: FE-3 · 2026-06-12 · Scope: `components/patterns/*` (content set), `components/blocks/*`, `lib/utils.ts`, `lib/format.ts`
Verified: `npx tsc --noEmit` → **exit 0, zero errors repo-wide** (after cross-agent contract reconciliation, see §4).

## 1. Files created

| File | Type | Purpose |
|---|---|---|
| `lib/utils.ts` | shared (client-safe) | `cn()`, `truncateWords(text, n)`, `truncateAtWord(text, maxChars)`, `formatDate(iso)`, `readingTime(text)` — NO node/server imports |
| `lib/format.ts` | alias | re-exports the truncation/format helpers (DESIGN_SPEC §6.7 names lib/format.ts) |
| `components/patterns/ProductCard.tsx` | server | product card (§6.7) |
| `components/patterns/CategoryTile.tsx` | server | category tile (§6.8) |
| `components/patterns/QuoteForm.tsx` | client | 2-step quote form (§6.9) |
| `components/patterns/SpecTable.tsx` | server | spec table (§6.11) |
| `components/patterns/ProcessSteps.tsx` | server | numbered process rail (§6.12) |
| `components/patterns/ReviewWall.tsx` | server | masonry review wall (§6.13) |
| `components/patterns/FAQAccordion.tsx` | client | FAQ wrapper around ui Accordion (§6.14) |
| `components/patterns/GalleryLightbox.tsx` | client | gallery + lightbox dialog (§6.16) |
| `components/patterns/BlogCard.tsx` | server | blog card (§6.17) |
| `components/patterns/AuthorBox.tsx` | server | post byline panel (team default — no invented personas) |
| `components/patterns/TOC.tsx` | server | table of contents from `headings` prop |
| `components/blocks/ImageText.tsx` | server | split image/copy row |
| `components/blocks/StatsRow.tsx` | client | count-up stat band (THE dark band) |
| `components/blocks/ComparisonTable.tsx` | server | materials comparison matrix |
| `components/blocks/RelatedProducts.tsx` | server | related-products band (uses ProductCard) |
| `components/blocks/TrustBar.tsx` | server | trust strip + plain-text payment labels |

## 2. Props contracts (for BE wiring — all verified compiling against live BE pages)

**Section-owning components** (render their own `<section>` + `container-hm`; render them BARE, pass band bg via `className`): `ReviewWall`, `FAQAccordion`, `StatsRow`, `TrustBar`, `RelatedProducts`.
**Content-level components** (page owns section/container/grid): everything else.

```ts
// patterns
ProductCard      { product: Product; categoryName?: string; className?: string }
                 // → /products/<slug>/ stretched title link; "Get a Quote" secondary Button
                 //   → /get-custom-quote/?product=<slug> (relative z-10 above the stretched
                 //   link = stopPropagation-equivalent, zero JS, no nested <a>)
CategoryTile     { category: Pick<Category,'slug'|'name'|'imageUrl'>; count?: number; className? }
QuoteForm        { action: (data: FormData) => Promise<{ ok: boolean; error?: string }>;   // BE-3 submitQuote ✓
                   categories: { slug: string; name: string }[];                            // page maps getCategories()
                   defaultProduct?: { slug: string; name: string; categorySlug?: string };  // from ?product= (server-resolved)
                   moq?: string;                                                            // globals.moq → Quantity hint
                   className?: string }
                 // form posts hidden "product" + honeypot "website"; files under name "artwork"
SpecTable        { rows?: { label: string; value: ReactNode }[];
                   globals?: Pick<Globals,'moq'|'sla'|'shipping'>;   // appends MOQ/Turnaround/Shipping rows;
                   caption?: string; className? }                    // omit only if the page renders those rows from getGlobals()
ProcessSteps     { sla: string; shipping: string } | { steps: { title: string; body: string; icon?: LucideIcon }[] }
                 // canonical 4-step (globals strings) OR custom rail (/how-it-works 6-step ✓); + className?
ReviewWall       { reviews: Review[]; trustpilotUrl?: string; eyebrow?; title?; className? }  // section-owning
FAQAccordion     { faqs: Faq[]; eyebrow?; title?; className? }   // section-owning; ONE per page (audit)
GalleryLightbox  { images: Array<string | { src: string; alt?: string }>; alt?: string; className? }
BlogCard         { post: Post; className? }
AuthorBox        { name?; role?; bio?; className? }              // defaults to in-house team, monogram avatar
TOC              { headings: { id: string; text: string; level?: 2|3 }[]; title?; className? }

// blocks
ImageText        { image: {src, alt}; title: string; eyebrow?; body?; children?; cta?: {label, href};
                   reverse?: boolean; headingLevel?: 'h2'|'h3'; className? }
StatsRow         { stats: { value: number; suffix?; prefix?; label: string }[]; className? }
                 // section-owning dark band; NO default stats — values must be real (audit)
ComparisonTable  { caption: string; columns: string[]; rows: { label: string; values: (string|boolean)[] }[]; className? }
RelatedProducts  { products: Product[]; categoryName?: string; eyebrow?; title?; className? }  // section-owning
TrustBar         { shipping: string; moq: string; sla: string; paymentMethods?: string[]; className? }  // section-owning (compact)
```

Grid recipe for card grids (composition rule — stagger child is the CELL):
`<Reveal as="div" stagger className="grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">` →
`<div className="h-full"><ProductCard/></div>` per cell (`Reveal` injects `--stagger-i`).

## 3. Decisions & audit hooks

- **Word-boundary truncation everywhere**: `truncateWords()` server-side + `line-clamp-*` CSS; the `truncate` utility is never used on content text. `truncateAtWord()` matches the §6.7 char-budget contract (lib/seo.ts keeps its own server-side copy — fine, both deterministic).
- **Equal-height cards**: `h-full flex-col` + `mt-auto`-pinned CTA (ProductCard, BlogCard).
- **ProductCard CTA**: secondary `sm` (NOT primary sm — white-on-terra <16px is forbidden, ISSUES contrast item; FE-1's Button also force-bumps primary-sm to text-base).
- **QuoteForm**: both steps stay mounted in ONE `<form>` (hidden fieldset ⇒ values persist + full FormData incl. files); zod v4 per-field validation client-side; `aria-live="assertive"` error summary + focus to first invalid; step headings receive focus on transition (`aria-current="step"` progress); honeypot `website` (BE-3 drops silently ✓); Enter on step 1 advances instead of submitting; `router.push('/thank-you')` on `{ok:true}`.
- **Server failure UX (spec deviation, intentional)**: errors render in the existing aria-live summary instead of a Toast — keeps focus management in one place and avoids a Toast dependency in the form. Logged S3 for QA sign-off.
- **ReviewWall anti-fabrication**: per-card "Trustpilot" + "Verified" badges ONLY when `verified === true && source === 'trustpilot'`; while all entries are placeholders a visible note renders ("Reviews collected via Trustpilot — verification in progress.", linked to `globals.social.trustpilot` when provided); NO aggregate numbers, no schema.
- **All SLA/MOQ/shipping/phone strings flow in via props** (fed from `getGlobals()` by pages — my client components never import lib/content/lib/seo, which are server-only).
- **StatsRow**: ships with no default numbers; animated digits `aria-hidden` with sr-only final value; count-up disabled under `prefers-reduced-motion`/no-IO; self-observes (same IO thresholds as `<Reveal>`).
- **GalleryLightbox**: dialog semantics, focus trap + return, Esc/←/→, scroll-lock; accepts string or `{src, alt}` images (BE-1 uses both forms).
- Internal links emitted WITH trailing slash (`/products/<slug>/`, `/get-custom-quote/?product=…`) to match `trailingSlash: true` zero-hop.
- ui primitives imported from concrete modules (`@/components/ui/button` etc.) — works with and without FE-1's barrel.

## 4. Cross-agent reconciliation (parallel wave 2)

FE-1/FE-2/BE-1/BE-2/BE-3 landed while I built; contracts converged with zero remaining type errors:
- Adapted to FE-1's real APIs: `hint` (not help), `containerClassName`, `variant="chip"` Checkbox, Button `iconLeft/iconRight/fullWidth/loading`, Select `placeholder`/`options`.
- Adopted BE usage where reasonable: ReviewWall `trustpilotUrl`, ProcessSteps custom `steps` (BE-2 /how-it-works), SpecTable `globals` now optional (BE-1 renders the rows from getGlobals directly), section-owning wrappers for the 5 band components (BE-1 home renders them bare), RelatedProducts `categoryName`.
- Fixed in BE-2's `app/faqs/page.tsx` (noted, one-shot): removed a double `<section class="section">` wrapper around the now section-owning FAQAccordion (would have doubled padding).
- BE-3's `submitQuote: (FormData) => Promise<ActionResult>` with `ActionResult = { ok: boolean; error?: string }` matches the QuoteForm `action` prop exactly; wired in `app/get-custom-quote/page.tsx` ✓.

## 5. Handoff notes

- BE pages: render `ReviewWall / FAQAccordion / StatsRow / TrustBar / RelatedProducts` BARE (no extra `.section` wrapper) — they own their band; pass bg via `className`.
- `/thank-you` route must exist (QuoteForm redirects there) — BE-2.
- ProcessSteps custom-steps mode intentionally drops the lg connector hairline (single-row 4-up only).
- QA: keyboard pass done by inspection (focus trap, Esc, arrows, aria-current/aria-live); please verify in browser (wave 3).
