# VERIFY-2 — Independent Build Verification (Wave 4)

**Role:** VERIFY-2 (independent build verifier) · **Date:** 2026-06-12 (18:20–18:26 UTC)
**Tree verified:** `/Users/applefoce/Desktop/hm-rebuild` (= `/sessions/clever-gallant-ritchie/mnt/Desktop/hm-rebuild` in the sandbox), current Wave-3 final state.
**Method:** full gate suite from scratch — `.next/` and all `*.tsbuildinfo` deleted before the first gate; every gate run cold on the current tree in CI order (typecheck → lint → test → build → budgets → smoke → qa-crawl → content/redirects → hygiene).

## Final gate table (last run of every gate = this run = all green)

| # | Gate | Command | Result | Evidence (exact numbers) |
|---|------|---------|--------|--------------------------|
| 1 | Typecheck | `npx tsc --noEmit` (after `rm -rf .next *.tsbuildinfo`) | **GREEN** | exit 0, **0 errors**, 4.9 s; re-confirmed 0 errors on the final tree after all other gates |
| 2 | Lint | `npm run lint` (`eslint .`) | **GREEN** | exit 0, **0 errors / 0 warnings**, 5.0 s |
| 3 | Tests | `npx vitest run` | **GREEN** | **8/8 test files, 88/88 tests passed**, 0 failed/skipped, 5.02 s (node project: actions 21 · search 8 · content.integrity 16 · seo 17 · utils 10 · redirects; dom project: vitest-dom-wiring 2 · ui.smoke 4) |
| 4 | Production build | `npm run build` (fresh — `.next` removed first) | **GREEN** | exit 0 on the **first cold pass** (~39 s wall, within one 45 s sandbox window); `✓ Compiled successfully in 15.8s`; `✓ Generating static pages (219/219)`; **212 prerendered HTML files** in `.next/server/app`; route table = 29 entries: 23 ○ static + 3 ● SSG patterns (`/[category]` 22 paths, `/blog/[slug]` 16, `/products/[slug]` 153) + 3 ƒ dynamic by design (`/api/search`, `/get-custom-quote`, `/products` — searchParams, per ISSUES); shared first-load 102 kB; middleware 34.2 kB; **0 warnings/errors in the build log**; BUILD_ID `QmdF6XwLfUiz6zBkcCy5O` |
| 5 | JS budgets | `node scripts/check-budgets.mjs` | **GREEN** | exit 0 — `PASS — all 26 route(s) within 150 kB` (gzip); **max first-load = 147.3 kB** (`/samples` and `/contact`, tied); next heaviest `/get-custom-quote` 133.0 kB; shared baseline 102.7 kB |
| 6 | Smoke | `node scripts/smoke.mjs` | **GREEN** | exit 0 — **7/7 routes PASS** (mode=start against the fresh build): 6×200 each with exactly one `<h1>` + non-empty `<title>`, plus deliberate 404 probe → 404 |
| 7 | QA crawl | `node scripts/qa-crawl.mjs` | **GREEN** | exit 0 — **24/24 pages clean** (home, 5 categories incl. regulated, 10 products, quote, contact, reviews, blog index+post, HTML sitemap, 2 legal; 9 assertions/page: status, single h1, ≤1 FAQPage LD, BreadcrumbList, no undefined/NaN literals, no banned claims, canonical tel:, https-only own-domain, img alt) |
| 8 | Content integrity | `node scripts/validate-content.mjs` | **GREEN** | exit 0 — `PASS — content integrity verified`: **22 categories / 153 products** (5 live copy, 148 derived, 13 with SKU) / **16 posts / 8 faqs / 6 reviews (placeholder-flagged) / 3 case studies** |
| 9 | Redirects determinism | `node scripts/gen-redirects.mjs` re-run + byte-compare | **GREEN** | script has **no `--check` mode** (argv ignored), so verified by cp-before/diff-after: sha256 `f4d002b417651333ff6940fc8fec50dca437f111dcf5d68f0010407a842c23e3` **identical before and after** regeneration, `diff` empty → `lib/redirects.ts` deterministic; **264 entries** (221 locations + 31 business-card + 4 merges + 7 utility + 1 PM-approved `/locations/` hub), post-write count self-check passed |
| 10 | Repo hygiene | manual inspection | **GREEN** | `/data/*.jsonl` in `.gitignore` (line 38) and **no leads.jsonl exists** (`data/` contains only `.gitkeep`, 0 bytes); **zero `.env*` files** anywhere outside node_modules (`.env*` gitignored, `!.env.example` allowance unused); **package-lock.json present** (lockfileVersion 3, 284,843 bytes, in sync — lint/test/build all ran off it); docs contain **no machine-specific node_modules paths** (only descriptive mentions in QA/security methodology, e.g. the bundled-postcss audit finding); `*.tsbuildinfo`, `/.next/`, `/out/` gitignored |

## Fixes made

**None.** Every gate was green on its first execution of this verification pass — zero source files were modified by VERIFY-2. The only writes to the tree from this run are build artifacts (`.next/`, regenerated `tsconfig.tsbuildinfo` — both gitignored) and `lib/redirects.ts` rewritten **byte-identically** by the determinism check (sha256-verified above).

Verification-infrastructure note (no code impact): the nohup+poll background-runner approach does not work in this sandbox — `/tmp` is mounted noexec and child processes are killed when each bash call exits (bwrap `--die-with-parent --unshare-pid`; matches QA-AUTO's Wave-3 note). All gates were therefore run as individual foreground calls; every gate, including the cold production build (~39 s), fit inside the 45 s per-call cap.

## Machine specs

- Sandbox: Linux 6.8.0-124-generic (Ubuntu 22.04), **aarch64**, 4 vCPU, 3.8 GiB RAM (≈3.4 GiB available), 9.6 GB disk (3.9 GB free at run time)
- Toolchain: node **v22.22.3** (engines requires ≥20 — satisfied), npm 10.9.8, Next.js **15.5.19**, TypeScript 5.9.3, vitest 4.1.8, eslint 9.x flat config
- Constraint: 45 s per shell call, no surviving background processes; network egress npm-only (hence next/font fallback stacks per ISSUES — cutover item, not a build defect)

## Reproducible-build statement

From a clean checkout state (`rm -rf .next *.tsbuildinfo`) with the committed `package-lock.json` (lockfileVersion 3, `npm ci`-compatible) and node ≥20, this tree builds **reproducibly and deterministically**: typecheck, lint and the 88-test suite pass with zero errors; `next build` compiles clean and prerenders 219/219 static pages (212 HTML documents) with every route's gzipped first-load JS ≤ 150 kB (max 147.3 kB); the generated redirect map (`lib/redirects.ts`, 264 entries) regenerates byte-identically from `scripts/gen-redirects.mjs`; and the built site passes the 7-route smoke test and the 24-page QA crawl against a live `next start`. This run independently reproduces QA-AUTO's Wave-3 final numbers exactly (tsc 0 · lint 0/0 · 8f/88t · 219/219 · 26/26 max 147.3 · 7/7 · 24/24). The known launch-time TODOs (real fonts at cutover, CSP header, email provider/durable lead storage, real Trustpilot reviews, client address/hours/legal review) are tracked in docs/team/ISSUES.md and do not affect build reproducibility.

**VERIFY-2 verdict: ALL GATES GREEN — build verified reproducible.**
