# DEVOPS report — 2026-06-12

## Status: DONE — lint PASS (0/0) · vitest 4 files / 35 tests PASS (node+dom) · scripts verified · CI + headers + assets shipped

## What was done (scope items 1-7)

### 1. ESLint flat config — ISSUES #16 ticked
- `eslint.config.mjs`: ESLint 9 flat config; FlatCompat bridges the (still
  eslintrc-style) `next/core-web-vitals` + `next/typescript` presets — same
  shape create-next-app generates for Next 15. Global ignores: `.next`,
  `node_modules`, `out`, `coverage`, `next-env.d.ts`, `public`, `data`.
- Policy: errors stay REAL (bugs/CWV); the presets keep style-level rules
  (`no-unused-vars`/`no-unused-expressions`) as warnings so parallel Wave-2
  work is not blocked by cosmetics. `no-console` intentionally off (ops
  scripts + devWarn log by design).
- Cross-file edits, both logged in ISSUES: `package.json` lint script
  `next lint` → `eslint .` (`next lint` is deprecated in 15.5, removed in 16)
  and `@eslint/eslintrc@^3.3.5` added to devDependencies via real
  `npm install` (lockfile synced — `npm ci` safe).
- Verified: `npm run lint` → **0 errors, 0 warnings** (removed one stale
  `eslint-disable no-console` directive in lib/seo.ts while editing it for #9).

### 2./3. Vitest config + setup — reconciled with BE-3 as owner
- BE-3 had landed a first `vitest.config.ts` (node-only env, `server-only`
  stub alias, `@` alias) with an explicit "DEVOPS owns long-term" note.
  Extended it in place to **two projects** (Vitest 4 removed
  `environmentMatchGlobs`):
  - **node**: `tests|lib|app|scripts/**/*.test.ts` (BE actions/lib) — BE-3's
    aliases + stub (`tests/stubs/server-only.ts`, theirs, kept) preserved.
  - **dom**: `**/*.test.tsx` + `tests/**/*.dom.test.ts` — jsdom +
    `tests/setup.ts` (imports `@testing-library/jest-dom/vitest`).
  `globals: true` (lets Testing Library auto-cleanup hook the global
  afterEach) but tsconfig does NOT load vitest/globals types → tests must
  import `describe/it/expect` from "vitest" (documented in the config header;
  BE-3's tests already do).
- Naming contract: `.test.ts` = node · `.test.tsx` = dom · `.dom.test.ts` =
  jsdom escape hatch for non-component DOM tests.
- `tests/infra/vitest-dom-wiring.test.tsx`: minimal self-test proving
  .tsx→jsdom routing, React 19 render via RTL, jest-dom matchers from setup.
  QA-AUTO may move/extend.
- Verified: 3 test files discovered in the right projects; my infra test +
  BE-3's actions suite PASS. **tests/search.test.ts is 2/8 RED against
  lib/search.ts — BE-3 mid-flight, not config** (ISSUES, S2): same env/alias
  as their original config.

### 4. Assets — ISSUES #9 ticked (with caveats)
- `public/og-default.svg`: hand-written 1200×630 card — ink-900 bg, terra-500
  accent bar + isometric box motif, Poppins/system wordmark, site URL.
- `public/logo.svg`: **recreation**, NOT the live file. Every channel to the
  raw `logo3.svg` failed from this sandbox: `web_fetch` returns empty for
  `image/svg+xml` (verified twice; sitemap XML works, SVG is image-typed),
  bash egress is proxy-allowlisted (only registry.npmjs.org + github.com;
  site → 403), allorigins/corsproxy wrappers come back empty, r.jina.ai
  returns an AI *description* ("shield cube logo with the letter H" — used to
  shape the recreation), web.archive.org is fetch-blocklisted, no
  Claude-in-Chrome browser connected, no local copy on the mounted Desktop.
  The SVG carries an embedded swap-note; replace 1:1 at cutover (S3 logged).
- `lib/seo.ts` (SEO-2's file, edit sanctioned by #9): `DEFAULT_OG_IMAGE` →
  `${SITE_URL}/og-default.svg`, `ORG_LOGO_URL` → `${SITE_URL}/logo.svg`,
  comment rewritten. Follow-up logged: og:image should be exported to PNG
  before launch (SVG og:image is ignored by several scrapers).

### 5. Ops scripts (both self-contained one-shots, repo-root-relative)
- `scripts/check-budgets.mjs`: post-build first-load-JS budget (≤150 kB/route,
  `BUDGET_KB` env override). Per app-manifest route: `rootMainFiles` ∪
  ancestor layout chunks ∪ page chunks, unique .js gzip-summed (matches
  `next build`'s column ~1-2%). Sorted table + shared-baseline line. Clear
  exit-1 messages for: no `.next`, missing manifests, and **empty manifests
  (dev-server output)** — all three paths tested.
- `scripts/smoke.mjs`: boots `next start` when a production build exists
  (BUILD_ID + prerender-manifest), else falls back to `next dev` (warned);
  `SMOKE_MODE`/`SMOKE_PORT` overrides. Fetches `/`, `/custom-bakery-boxes/`,
  `/products/custom-cake-boxes/`, `/get-custom-quote/`, `/reviews/`, `/blog/`
  + a deliberate 404 probe; asserts status, **exactly one `<h1`** and a
  non-empty `<title>` per 200 page; streams a pass/fail table row-by-row
  (sandbox 45s-cap friendly); prints server-output tail on 5xx; kills the
  whole detached process group (SIGTERM → grace → SIGKILL) in `finally`.
- Verified mechanically end-to-end (boot → table → teardown → exit code).
  Currently reports 7/7 FAIL because **`npm run build` is broken by an
  in-flight BE-1/FE-3 import-path mismatch** (TrustBar/RelatedProducts under
  `components/blocks/` but imported from `components/patterns/`) — logged S1
  mid-wave in ISSUES; dev mode 500s everything. Re-run after they reconcile.

### 6. CI + security headers
- `.github/workflows/ci.yml`: single job, `npm ci → lint → typecheck →
  vitest → build → check-budgets → smoke`; Node 20 + npm cache; concurrency
  cancel; 20-min timeout. Comments document that budgets/smoke consume the
  build stage's `.next/` and must stay in the same job after it.
- Headers: **chose `next.config.ts headers()` over vercel.json** (platform-
  agnostic, versioned with the app, works on any `next start` host; Vercel
  injects HSTS on HTTPS anyway). Additive, clearly-commented edit to the
  ARCHITECT-owned file: nosniff, X-Frame-Options DENY, Referrer-Policy
  strict-origin-when-cross-origin, minimal Permissions-Policy (camera/mic/
  geo/payment/usb/topics all denied), HSTS max-age=63072000 (no
  includeSubDomains yet — unknown client subdomains; SECURITY revisits
  +preload at cutover). CSP deliberately deferred to SECURITY (inline
  `data-js` snippet + JSON-LD scripts need an inventory). No vercel.json
  created — nothing else needed one.

### 7. README §Operations (appended; lint row in §Scripts updated)
Scripts table, CI stages, Vercel deploy notes (trailingSlash/redirects/
headers/images.unoptimized), lead-storage location + ephemeral-FS warning,
launch TODOs (email provider, analytics, real Turnstile, logo/OG swaps).

## Files created
`eslint.config.mjs` · `vitest.config.ts` (BE-3 base, extended) ·
`tests/setup.ts` · `tests/infra/vitest-dom-wiring.test.tsx` ·
`public/logo.svg` · `public/og-default.svg` · `scripts/check-budgets.mjs` ·
`scripts/smoke.mjs` · `.github/workflows/ci.yml`

## Cross-file edits (all sanctioned + logged)
- `package.json`: lint script + @eslint/eslintrc devDep (lockfile synced) — #16
- `lib/seo.ts`: 2 asset constants + comment, stale eslint-disable removed — #9
- `next.config.ts`: additive `headers()` block with in-file rationale
- `README.md`: §Operations appended; stale lint row fixed

## Verification summary (final re-run at hand-off)
- `npm run lint` → exit 0, 0 errors 0 warnings (fixed my own infra-test
  anchor that tripped @next/next/no-html-link-for-pages — good sign the rule
  set bites)
- `npm test` / `npx vitest run` → **4 files, 35 tests, ALL PASS** across both
  projects (dom: tests/infra + FE-1 ui smoke · node: BE-3 actions + search —
  BE-3's earlier 2 red search tests landed fixed mid-wave; ISSUE ticked)
- `npm run typecheck` → 13 errors remain, **none in DEVOPS files** (verified
  by grep) — all are the logged BE-1/FE-3 prop/path drift (S1 ISSUE, also
  enumerated by FE-1) + shim cleanup (BE-3/BE-2 ISSUE)
- `npm run build` → still red on `@/components/patterns/RelatedProducts`
  (S1 ISSUE) — when BE-1/FE-3 reconcile, budgets + smoke go live in CI
- `node scripts/check-budgets.mjs` → correct "dev output, run build" exit-1
  message (production-path logic written against the Next 15 manifest shape)
- `node scripts/smoke.mjs` → full boot → streamed table → process-group
  teardown → exit-code cycle verified (dev fallback; currently 500s from the
  S1 build break, with server-output tail printed for diagnosis)

## Handoffs
- **BE-1/FE-3**: fix the components path mismatch (S1) → build green → CI
  budgets/smoke meaningful.
- **BE-3**: 2 red search tests (S2).
- **QA-AUTO**: test conventions + setup are in the vitest.config.ts header;
  infra example in tests/infra/.
- **SECURITY**: headers baseline in next.config.ts — CSP + HSTS hardening yours.
- **Human at cutover**: swap public/logo.svg with the real logo3.svg; export
  og-default as PNG (both S3, embedded notes in the files).
