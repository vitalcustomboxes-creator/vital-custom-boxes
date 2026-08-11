# ARCHITECT report — 2026-06-12

## Status: DONE — `tsc --noEmit` PASS · `npm run build` PASS (17s) · `npm run test` exit 0

## What was done

1. Scaffolded the Next.js 15 App Router project manually at repo root (no create-next-app).
2. Created the directory skeleton with `.gitkeep`: `app`, `components/{ui,patterns,blocks}`,
   `content`, `lib`, `styles`, `tests`, `scripts`, `public`, `data` (+ `docs/team/reports`,
   `docs/seo`, `docs/qa`).
3. Installed and verified the full dependency set (see versions below); committed
   `package-lock.json`.
4. Wrote `docs/ARCHITECTURE.md` (structure, data flow, SSG strategy, token contract,
   decisions log, installed versions) and `README.md`.
5. Fixed/actioned ISSUES items in my scope (see below).

## Files created/owned

- `package.json` — scripts: `dev` / `build` / `start` / `lint` / `test` / `typecheck`
- `tsconfig.json` — strict, `@/*` → repo root, moduleResolution bundler
- `next.config.ts` — images remotePatterns (www.hmcustompackaging.com) + `unoptimized: true`;
  `redirects()` wired from `lib/redirects.ts`; `trailingSlash: true` (added by SEO-1, preserved
  and signed off — required for the 263 trailing-slash redirect sources)
- `postcss.config.mjs`, `tailwind.config.ts` — token-variable mapping (see ARCHITECTURE §5)
- `.gitignore`, `README.md`, `docs/ARCHITECTURE.md`, `next-env.d.ts` (Next regenerates)
- Placeholders for other roles (marked in-file): `app/layout.tsx` + `app/page.tsx`
  (`// PLACEHOLDER — BE-1 replaces`). My `lib/redirects.ts` + `styles/globals.css` +
  `styles/tokens.css` placeholders were already replaced by SEO-1/DESIGNER during this wave —
  their versions are authoritative; build verified against them.

## Key decisions (full log: ARCHITECTURE.md §6)

- **next.config.ts (TS) over .mjs** — Next 15 native TS config; can import typed
  `lib/redirects.ts` directly (an .mjs config cannot import TS modules).
- **Tokens as opaque CSS `var()` refs** in tailwind.config.ts — caveat: Tailwind `/opacity`
  modifiers don't work on brand colors; DESIGNER shipped rgba helper tokens for that.
- **Pinned `typescript@^5.9`** — npm resolved TS 6.0.3 first; Next 15.5 + typescript-eslint
  peer ranges target TS 5.x. Do NOT bump to TS 6. Also pinned `@types/node@^22` (Node 22
  runtime) and `eslint-config-next@15` (latest major targets newer Next).
- **zod resolved to v4 (4.4.3)** — BE-3: use the zod 4 API.
- **Added `server-only` package** and imported the guard in `lib/content.ts` and `lib/seo.ts`
  (cross-file edit per DATA-ENG/SEO-2 ISSUES invitations) — accidental `"use client"` imports
  of node:fs modules now fail at build time. Build re-verified after.
- `test` script = `vitest run --passWithNoTests` so the pipeline is green before QA-AUTO lands
  tests; typescript/@types/tailwind/etc. live in devDependencies (standard Next convention).

## Verification results

- `npx tsc --noEmit` — PASS (strict, includes teammates' lib/seo.ts, lib/content.ts,
  middleware.ts, redirects table)
- `npm run build` — PASS: 4 static pages, First Load JS **103 kB** (budget ≤150 kB),
  middleware 34.2 kB, 263 redirects + trailingSlash loaded from config without error
- `npm run test` — exit 0 (no tests yet, by design)
- One-time benign Tailwind warn on first build (“no utility classes detected”) — placeholders
  use no Tailwind classes yet; disappears as soon as FE code lands.

## Issues logged / handoffs

- **DEVOPS**: `npm run lint` needs an eslint config (eslint 9 = flat-config era; none created —
  config is yours). Logged S3. Also `.gitignore` is scaffold-level — extend as needed; note
  `/data/*.jsonl` and `next-env.d.ts` are ignored.
- **BE-1**: replace `app/layout.tsx` + `app/page.tsx`; include DESIGNER's `data-js` snippet and
  next/font variables (`--font-poppins`, `--font-manrope`) per DESIGN_SPEC §0.3 (already S2 in
  ISSUES).
- **All Wave-2 agents**: import content/seo helpers ONLY in server components (server-only guard
  now enforces this at build time).
- **Sandbox note for QA/DEVOPS**: bash calls cap at ~45 s and background processes do NOT
  survive between calls — run `npm install` in small batches on timeout; `npm run build`
  currently takes ~20 s so it fits in one call. File deletion on the mount required the cowork
  delete permission (now granted for this session).
- **Cutover (post-launch, with DEVOPS)**: lib/seo.ts DEFAULT_OG_IMAGE / ORG_LOGO_URL point at
  live wp-content URLs per brief; self-host at cutover (existing S3 issue). Consider flipping
  `images.unoptimized` off when a real image optimizer is available.
