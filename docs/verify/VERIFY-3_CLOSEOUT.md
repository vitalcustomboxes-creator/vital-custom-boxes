# VERIFY-3 CLOSEOUT — issues register + cross-report consistency
**Role:** VERIFY-3 (program-closeout verifier) · **Date:** 2026-06-12 · **Scope:** docs only (no code touched)
**Inputs read in full:** docs/team/ISSUES.md (66 lines / 65 issue rows) · docs/team/BOARD.md · all 13 reports in docs/team/reports/ · docs/qa/MANUAL_QA.md · docs/qa/SECURITY_REPORT.md · docs/seo/SEO_VERIFICATION.md · docs/verify/VERIFY-2_BUILD.md (landed mid-audit, see C5) · docs/PROJECT_BRIEF.md · README.md · spot-reads of lib/redirects.ts, next.config.ts, lib/seo.ts, lib/content.ts, package.json, public/, app/ (read-only evidence checks).

## 0. Verdict

**ISSUES log fully classified: 65/65 rows — 35 FIXED · 18 ACCEPTED · 12 DEFERRED-TO-DEPLOY. Nothing unclassified.**
No tick-washing found (independently corroborating QA-MANUAL's 15-item tick audit; I re-verified a further sample directly against the repo — see §3). No open S1. The only open S2s (#53 CSP, #54 durable leads/Turnstile/rate-limit) are deploy-time infra by design and sit on the launch checklist in docs/PROJECT_STATUS.md.

Issue IDs below = **line numbers in docs/team/ISSUES.md** (the convention wave-3 reports use: #21, #36, #42, #55, #65, #66 all resolve to those lines).

## 1. Issues register — all 65 rows classified

Status legend: **FIXED** = resolved with evidence · **ACCEPTED** = intentional/informational/optional, rationale recorded, no action owed · **DEFERRED** = DEFERRED-TO-DEPLOY, carried onto the launch checklist (PROJECT_STATUS.md).

| # | Owner(s) | Sev | Status | Evidence / rationale |
|---|---|---|---|---|
| 2 | PM→BE-2 | S3 | FIXED | `/locations/`→`/custom-pizza-boxes/` added (EXTRA group 5); lib/redirects.ts = exactly **264** entries (re-grepped by VERIFY-3: 264 × `, permanent: true },`; the 265th loose match is the type annotation, line 21); SEO-VERIFY live-tested the hub 308 (§1 sample 15). |
| 3 | PM→BE-2 | S3 | FIXED | app/sitemap/page.tsx serves HTML sitemap at `/sitemap/`; coexists with /sitemap.xml; QA-MANUAL D + SEO-VERIFY 200 spot. |
| 4 | SEO-1 | S2 | FIXED | `trailingSlash: true` re-confirmed by VERIFY-3 in next.config.ts:24; QA-MANUAL tick-audit TRUE; every canonical/internal link trailing-slash (SEO-VERIFY §3/§4). |
| 5 | SEO-1 | S3 | FIXED | Same fix as #2. |
| 6 | SEO-1 | S3 | FIXED | Route-name option: HTML sitemap AT `/sitemap/`; `/sitemap-page` does not exist (QA-MANUAL tick-audit TRUE). |
| 7 | SEO-1→BE-2 | S3 | FIXED | thank-you: noindex meta verified in build, 0 sitemap entries (211 locs), robots `Disallow: /thank-you/` (SEO-VERIFY §2, QA-MANUAL D). |
| 8 | SEO-2→DATA-ENG/FE-3/BE-1 | S2 | FIXED | All claims single-sourced from globals: validate-content §8 scan PASS; QA-AUTO whole-build sweep 0 banned-claim hits + 1001/1001 canonical tel:; SEO-VERIFY §5 zero hits across 212 pages. |
| 9 | SEO-2→DATA-ENG/BE-1 | S2 | FIXED | Compliance wording + `regulated` flags + disclaimer rendered on exactly 3 regulated categories + their 16 products (19 `role="note"` pages — QA-MANUAL site-wide count). |
| 10 | SEO-2/ARCHITECT/SEO-1 | S2 | FIXED | Trailing-slash convention aligned across redirects/canonicals/docs same-day (SEO-1+SEO-2 reports converge; SEO-VERIFY 212/212 trailing-slash canonicals). |
| 11 | SEO-2→DEVOPS | S3 | FIXED | Self-hosted public/og-default.svg + public/logo.svg (VERIFY-3 confirmed both exist) wired into lib/seo.ts constants. Two residuals split into #26/#27 (deferred). |
| 12 | SEO-2→BE-2 | S3 | FIXED | /case-studies canonical → /portfolio/ verified in built HTML (BE-2, QA-MANUAL E, SEO-VERIFY §3). |
| 13 | SEO-2 | S3 | ACCEPTED | Standing architectural rule (lib/seo.ts is server-only), mechanically enforced: `import "server-only"` present (lib/seo.ts:25, VERIFY-3-confirmed) — violations fail the build. No further action. |
| 14 | DATA-ENG | S3 | FIXED | /business-card in generated sitemap (1 exact `<loc>` of 211) + 200 live + 31 city doorways 308 (SEO-VERIFY §1–2). Residual hero-image choice was explicitly optional (DESIGNER: "no design constraint") — accepted as-is. |
| 15 | DATA-ENG→ARCHITECT | S3 | FIXED (**unticked — flagged §3.1**) | `import 'server-only'` present in lib/content.ts:9 (VERIFY-3-confirmed); ARCHITECT report + BOARD row confirm the guard was added per this issue. Row was never ticked in ISSUES — bookkeeping miss only. |
| 16 | DESIGNER→BE-1 | S2 | FIXED | data-js script first child of `<head>` in app/layout.tsx; verified in prerendered HTML (BE-1, QA-MANUAL A10, QA-AUTO spot). |
| 17 | DESIGNER | S3 | ACCEPTED | Fixed-palette contrast usage rules (not a defect): implemented in components (FE-1 Button force-bumps primary-sm label; FE-3 ProductCard uses secondary sm) and verified by QA-MANUAL. Remains a binding convention in DESIGN_SPEC §1.1 for future edits. |
| 18 | ARCHITECT→DEVOPS | S3 | FIXED | eslint.config.mjs flat config; `npm run lint` = 0 errors 0 warnings (DEVOPS + QA-AUTO final gate). |
| 19 | ARCHITECT | S3 | FIXED | typescript pinned ^5.9.3 + @types/node ^22 (VERIFY-3 re-confirmed in package.json); SECURITY pin review concurs. |
| 20 | BE-3/FE-3 | S3 | ACCEPTED | QuoteForm option/field drift is bridged server-side via test-pinned aliases — submissions validate today. Unification deliberately not done: importing @/lib/forms client-side would re-add zod to the route bundle (QA-AUTO caution); prerequisite zod-free constants split logged as #59. Optional refactor, not a defect. |
| 21 | BE-3→QA-AUTO | S3 | FIXED | `MIN_QUANTITY = 25` + `min={25}` in QuoteForm; carried into the final build (QA-MANUAL F-02 → resolved #62). |
| 22 | BE-3 | S3 | ACCEPTED | Informational: fetch `/api/search/?q=` with trailing slash. Documented in BE-3/FE-2 reports; QA-MANUAL verified the endpoint live (`count:8` for mylar). |
| 23 | BE-3/DATA-ENG | S3 | ACCEPTED | lib/search.ts declared canonical (API/UI use it; BE-1 hub filter uses it). lib/content.ts `search()` retained, unused by consumers; future-wave dedupe suggestion only. |
| 24 | DEVOPS→BE-1/FE-3 | **S1** | FIXED | Mid-wave import-path break resolved by BE-1 (blocks/ path); independently re-verified by BE-2 (build 219/219) and QA-AUTO final gates (build/budgets/smoke all green). Residual: first CI run on the real GitHub repo — launch checklist. |
| 25 | DEVOPS→BE-3 | S2 | FIXED | lib/search.ts landed; vitest 4 files/35 tests green at DEVOPS re-run; final suite 8 files/88 tests (QA-AUTO). |
| 26 | DEVOPS | S3 | DEFERRED | public/logo.svg is a token-faithful recreation (live SVG unfetchable from sandbox). Launch: download live logo3.svg and replace 1:1 (path stable; swap note embedded in the SVG). |
| 27 | DEVOPS/DESIGNER | S3 | DEFERRED | og:image is SVG; several scrapers ignore SVG og:image. Launch: export 1200×630 PNG + flip DEFAULT_OG_IMAGE in lib/seo.ts. |
| 28 | DEVOPS→PM/BE-3 | S3 | DEFERRED | Deploy stubs (per brief): email provider, analytics, real Turnstile keys. README §Operations documents; launch checklist items 5/8/16. |
| 29 | FE-1 | S2 | FIXED | Import-casing clashes fixed in PageHero.tsx + app/contact/page.tsx; barrel-import convention recorded; repo tsc 0. |
| 30 | FE-1 | S3 | ACCEPTED | Informational: lucide v1.18 icon renames; ui/* complies; lint/tsc/build all green (no stale aliases survived). |
| 31 | FE-1→DESIGNER | S3 | ACCEPTED | Optional polish: official `.drawer-panel--bottom` variant. Current transform-utility implementation honors motion tokens + reduced-motion kill switch — equivalent behavior. |
| 32 | FE-1→BE-1 | S2 | FIXED | ToastProvider wraps body content in app/layout.tsx (QA-MANUAL tick-audit TRUE). |
| 33 | FE-1→BE-1/FE-2/FE-3/BE-3 | S2 | FIXED | Mid-wave contract drift reconciled; repo-wide `tsc --noEmit` 0 + build PASS (BE-1 re-verified after ToastProvider wiring). |
| 34 | BE-3→BE-2 | S2 | FIXED | types/fe-contracts.d.ts shim DELETED (types/ dir removed); pages reconciled; tsc 0 + build 219/219 (QA-MANUAL tick-audit: types/ dir gone, repo greps clean). |
| 35 | FE-3 | S3 | FIXED | /faqs double `.section` wrap removed (one-line fix in BE-2's file, logged). |
| 36 | FE-3→QA-MANUAL | S3 | **ACCEPTED** | Spec deviation formally signed off (MANUAL_QA F-04): aria-live focus-managed error summary is equal-or-better than a Toast for SR users + keeps the route bundle lean. ToastProvider stays wired for future consumers. (Ticked in ISSUES, but the resolution is acceptance, not a change — classified ACCEPTED.) |
| 37 | FE-3 | S2→note | FIXED | FE-3 portion of #8: all claims via props, zero default numbers, badges gated on `verified===true`. Verified by the #8 sweeps. |
| 38 | FE-2 | S2 | FIXED | Stale FE-2 shim block removed (same shadowing find); CTABand/PromoBar contracts final; repo tsc 0 + eslint 0/0. |
| 39 | FE-2→client/PM | S3 | DEFERRED | globals.address still "(TODO client: street address)" — Footer strips the parenthetical so nothing fake ships, but the real street address must land in content/globals.json pre-launch (also feeds LocalBusiness schema). |
| 40 | FE-2 | S3 | ACCEPTED | Informational, handled: lucide v1 has no brand icons → Footer's inline `SocialGlyph` SVGs (aria-hidden, labeled links). Reuse the helper if brand icons are needed elsewhere. |
| 41 | FE-2 | S3 | ACCEPTED | Header IA intentionally follows the PM brief, not DESIGN_SPEC §6.1's example list (Locations removed; covered by redirects). QA instructed not to test against the example nav. |
| 42 | FE-2→QA-AUTO | S3 | FIXED | `data-quote-form=""` on QuoteForm form root; in final build (#62). |
| 43 | FE-2→FE-1 | S3 | ACCEPTED | Polish suggestion (Drawer `padded?` prop vs `!p-0` override). Current behavior correct; optional future enhancement. |
| 44 | BE-2 | S3 | ACCEPTED | /how-it-works renders its own 6-step rail with the identical §6.12 recipe (ProcessSteps stays canonical-4). Optional `steps` override only if another 6-step consumer appears. |
| 45 | BE-2 | S3 | ACCEPTED | /get-custom-quote is ƒ dynamic BY DESIGN (awaits searchParams for `?product=` preselect). Do not "fix" to static. |
| 46 | BE-2→client/PM | S3 | DEFERRED | /contact phone hours carry a TODO — client must confirm real hours pre-launch. |
| 47 | BE-2→client/PM | S3 | DEFERRED | 4 legal pages are short consistency rewrites with `TODO legal review` — counsel sign-off on defect window/liability cap/privacy jurisdiction pre-launch. (Food-grade contradiction already removed — verified 0 occurrences sitewide.) |
| 48 | BE-2→client | S3 | DEFERRED | Blog bodies are TODO-migrate placeholders; /blog/[slug] already supports `## ` headings → anchored h2s + TOC, so migrating the 16 live articles into posts.json needs no code change. |
| 49 | BE-2→SEO-2 | S3 | ACCEPTED | Cosmetic: HTML-sitemap meta lives under STATIC_PAGE_META key `"/sitemap-page"` while the route is /sitemap/. Lookup is by literal key; zero behavior impact. Optional rename. |
| 50 | BE-1→DEVOPS | S3 | DEFERRED | next/font/google cannot run in the sandbox (egress-blocked) — layout ships token fallback stacks; exact §0.2 snippet preserved verbatim in the app/layout.tsx header comment. Restore at cutover. |
| 51 | BE-1→BE-2/SEO-VERIFY | S3 | FIXED (**unticked — flagged §3.1**) | The requested confirmation happened: VERIFY-3 grep = **27/27** app route files export `metadata`/`generateMetadata` (every page.tsx + layout + not-found); SEO-VERIFY head audit 212/212 self-canonicals (sole intended exception /case-studies→/portfolio); the one real inheritance leak (404) was fixed under #66. Row never ticked — bookkeeping only. |
| 52 | BE-1 | S3 | ACCEPTED | /products is ƒ dynamic BY DESIGN (no-JS `?q=` filter, visible-label GET form). All 153+22 detail routes static. |
| 53 | SECURITY→DEVOPS | **S2** | DEFERRED | No CSP header (deliberately deferred to deploy). Full draft policy in SECURITY_REPORT §5; ship Report-Only → enforce; nonce-based later. Launch checklist item 9. |
| 54 | SECURITY→DEVOPS | **S2** | DEFERRED | Ephemeral leads.jsonl + per-instance rate limiter + stubbed Turnstile + (future) artwork-upload server-side validation + PII retention. All deploy-time infra; launch checklist items 5–8. |
| 55 | SECURITY→QA-AUTO | S3 | FIXED | `poweredByHeader: false` (VERIFY-3 re-confirmed next.config.ts:14); header absence verified on live `next start`; full gate suite re-run green. |
| 56 | SECURITY→DEVOPS | S3 | ACCEPTED | 2 moderate npm-audit advisories = postcss bundled inside next@15.5.19; transitive, non-exploitable (no untrusted CSS), only "fix" is a next downgrade. Risk accepted; re-check after each next bump (monitoring note on launch checklist). |
| 57 | SECURITY→DEVOPS | S3 | DEFERRED | HSTS ships without includeSubDomains/preload (intentional pre-cutover; subdomain inventory unknown). Harden at cutover. |
| 58 | QA-AUTO | S2 | FIXED | Budget gate red root-caused (client zod in QuoteForm, 151.3 kB) and fixed → 133.0 kB; budgets 26/26 PASS, max route 147.3 kB. |
| 59 | QA-AUTO→BE-3/FE-3 | S3 | ACCEPTED | Optimization suggestion: zod-free lib/forms-constants split (would trim /contact + /samples, the 147.3 kB heaviest routes — currently passing). Also the prerequisite for #20's unification. Optional. |
| 60 | QA-AUTO→DEVOPS | S3 | ACCEPTED | FYI: qa-crawl CI stage appended after smoke (sanctioned by brief); 24/24 green. Informational. |
| 61 | QA-MANUAL→QA-AUTO | S3 | FIXED | /reviews double-wrap removed + trustpilotUrl wired; rebuilt HTML verified (0 nested sections, link present). |
| 62 | QA-MANUAL→QA-AUTO | S3 | FIXED | Post-17:57 rebuilds carry the QuoteForm fixes (#21/#42) into client bundles; final gate pass confirms. |
| 63 | QA-MANUAL→DATA-ENG | S3 | FIXED | promo.href normalized to `"/get-custom-quote/"`; gates re-run green. Residual cosmetic noted in the tick itself: lib/seo.ts FALLBACK_GLOBALS keeps the slash-less form (applies only if globals.json is missing) — optional align, listed under launch-checklist optional polish. |
| 64 | QA-MANUAL→PM/client | S3 | DEFERRED | ReviewWall note implies Trustpilot provenance while reviews.json is placeholders — reinforces the existing launch blocker: import real Trustpilot reviews before cutover (no code change requested). |
| 65 | SEO-VERIFY→QA-AUTO | S3 | FIXED | 2 duplicate-title pairs killed (buildProductTitle Pattern-B fallback); verified in rebuilt HTML; locked by 2 new tests incl. dataset-wide no-collision scan. |
| 66 | SEO-VERIFY→QA-AUTO | S3 | FIXED | 404 metadata inheritance cleared (description/canonical/og/twitter nulled + robots noindex); rebuilt _not-found.html verified clean. |

### Register summary

| Status | Count | Of which S1 / S2 / S3 |
|---|---:|---|
| FIXED | **35** | 1 / 13 / 21 |
| ACCEPTED | **18** | 0 / 0 / 18 |
| DEFERRED-TO-DEPLOY | **12** | 0 / 2 / 10 |
| **Total** | **65** | 1 / 15 / 49 |

- The single S1 (#24, mid-wave build break) was fixed and triple-verified (BE-1, BE-2, QA-AUTO final gates).
- All 12 DEFERRED items appear on the LAUNCH CHECKLIST in docs/PROJECT_STATUS.md with owners.
- ISSUES tick-state vs this register: 34 rows ticked `[x]`; 33 of those are FIXED + 1 is ACCEPTED-by-signoff (#36). 2 FIXED rows were never ticked (#15, #51 — see §3.1). All 31 unticked rows are accounted for (2 fixed-unticked + 17 accepted + 12 deferred).

## 2. Cross-report consistency findings

**C1. Final build numbers AGREE across four independent runs.** QA-AUTO final gate pass (the latest full run): tsc 0 · lint 0/0 · vitest 8 files/88 tests · build ✓ 219/219 static pages, 26 routes · budgets 26/26 ≤150 kB (max 147.3, quote 133.0, shared baseline 102.7) · smoke 7/7 · qa-crawl 24/24. Corroborated by: BE-2 (219/219, first-load 103–143 kB), BE-1 (118–142 kB on core routes), SECURITY (independent fresh build in /tmp/qa-sec: exit 0, 219 routes, shared 102 kB), SEO-VERIFY (212 prerendered HTML, drift-checked across two BUILD_IDs). The 143-vs-147.3 spread is explained, not contradictory: check-budgets uses stricter per-file gzip accounting than the `next build` column (documented by QA-AUTO).

**C2. Test-count arithmetic checks out exactly.** DEVOPS handoff: 4 files/35 tests → QA-AUTO added 53 → final 8 files/88 (35+53=88 ✓).

**C3. Redirect totals are consistent; one wording nuance documented.** Canonical final figure: **264 static config entries** (222 /locations/ incl. hub + 31 /business-card/ + 4 merges + 7 utility) **+ 1 middleware rule** (/?page_id=3) = **265 redirect rules total**. The brief's "264 total" predates the PM-approved /locations/ hub addition (it counted 263 config + 1 middleware). lib/redirects.ts re-grepped by VERIFY-3 = exactly 264; SEO-VERIFY's routes-manifest count (266 = 264 + 2 Next-internal normalizers) and 15/15 live samples agree. PROJECT_STATUS.md states the figure unambiguously.

**C4. Sitemap + content counts identical everywhere.** sitemap.xml = 211 `<loc>` (BE-2 build output, QA-AUTO test-locked, QA-MANUAL D, SEO-VERIFY §2). Content = 22 categories / 153 products / 16 posts in DATA-ENG, BOARD, QA-AUTO integrity tests, SEO-VERIFY §6 — no disagreement anywhere.

**C5. VERIFY-2 landed mid-audit and RECONCILES EXACTLY.** docs/verify/VERIFY-2_BUILD.md (18:20–18:26 UTC) appeared while this closeout was being written. Its independent cold run (artifacts deleted first, zero fixes needed) reproduces QA-AUTO's final numbers exactly — tsc 0 · lint 0/0 · 8f/88t · build 219/219 (212 HTML, 0 warnings) · budgets 26/26 max 147.3 · smoke 7/7 · qa-crawl 24/24 — and adds content-integrity PASS, byte-identical redirect regeneration (sha256 match, 264 entries) and repo-hygiene GREEN. The PROJECT_STATUS.md gate table was updated to cite VERIFY-2 as canonical per mandate. Route-table counting nuance (not a conflict): VERIFY-2 reports a 29-entry route table (23 static + 3 SSG patterns + 3 ƒ dynamic incl. /api/search) while QA-AUTO said "26 routes in table" — check-budgets measures 26 *page* routes; both are correct under their own counting. **VERIFY-1's report was not yet present** at final writing time; if it lands with findings, PM should reconcile against this register.

## 3. Discrepancies found (all documentation-level; none code-relevant — nothing to assign to VERIFY-2)

**3.1 Two resolved ISSUES rows were never ticked** — #15 (server-only guard in lib/content.ts — guard confirmed present at lib/content.ts:9, done by ARCHITECT per their report + BOARD row) and #51 (per-route metadata confirmation — completed by BE-2 + SEO-VERIFY; VERIFY-3 re-grepped 27/27). Work verified done; the boxes were simply never checked. Recorded here as FIXED; no code action needed.

**3.2 README §Deploy still says "263 static 308 redirects"** (README.md line ~89, written by DEVOPS before the PM-approved EXTRA entry). Correct figure is 264. next.config.ts comments and docs/seo/REDIRECTS.md were updated by BE-2; README was missed. One-word doc fix for PM/DEVOPS at convenience; PROJECT_STATUS.md states the correct number.

**3.3 Stale mid-wave wording in two BOARD rows** — SEO-1's row says "263 static 308s" (pre-EXTRA; superseded by ISSUES #2 + BE-2's row) and DEVOPS' row says "build still red on BE-1/FE-3 path/prop drift (S1 logged)" (true at their handoff; resolved later the same day, #24). BOARD is an append-only live log, so these are historical snapshots, not errors — noted so nobody misreads the final state.

**3.4 Issue-number drift in the DEVOPS report** — it cites "ISSUES #16" for the eslint config (today line 18) and "#9" for the asset constants (today line 11); rows shifted as the log grew. All wave-3 reports use stable line numbers. Cosmetic; the referenced items are unambiguous from context.

**3.5 Known accepted residue (already logged inside ticks, repeated for completeness):** lib/seo.ts FALLBACK_GLOBALS retains the slash-less promo.href (fallback-only path, #63) and STATIC_PAGE_META keeps the `"/sitemap-page"` key for the /sitemap/ route's meta (#49). Both cosmetic, both optional.

## 4. Tick-evidence audit method note

QA-MANUAL already re-verified 15 ticked rows against rendered output (zero tick-washing). VERIFY-3 additionally re-verified, directly against the working tree: #2 (264 entries grep), #4 (trailingSlash:true), #55 (poweredByHeader:false), #11 (both SVGs exist), #19 (TS pin in package.json), #15/#51 (see §3.1), plus the README/BOARD cross-reads above. Every remaining tick cites a written verification in the owning or a verifying role's report (build-output greps, live curl probes, or test locks); no tick relies on assertion alone.

— VERIFY-3, 2026-06-12
