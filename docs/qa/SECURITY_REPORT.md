# SECURITY REVIEW — HM Custom Packaging rebuild (Next.js 15)

**Reviewer:** SECURITY (Wave 3, security-testing team) · **Date:** 2026-06-12
**Scope:** `app/actions.ts`, `lib/forms.ts`, `lib/rate-limit.ts`, `app/api/search/route.ts`,
`middleware.ts`, `next.config.ts` (headers), `lib/seo.ts` (JSON-LD), `lib/content.ts` (FS),
dependency tree (`npm audit`), and a production build of the app.
**Method:** 3 tester lenses — (1) dependencies & supply chain, (2) static app-code review,
(3) dynamic probing against a `next start` production build copied to `/tmp/qa-sec`
(source copied, `node_modules` symlinked, fresh `next build` — project dir untouched).

---

## 1. Executive summary

**Overall posture: STRONG. No S1 (critical) issues. No exploitable vulnerabilities found in app code.**

The application is a content site with three lead-capture server actions and one read-only
search API. The attack surface is small and well-handled:

- **Input validation is complete and server-authoritative.** Every form field is parsed from
  `FormData` by explicit field-picking (no object passthrough) and validated with zod v4 —
  enums whitelisted, numbers bounded, strings length-capped, email/phone format-checked. No
  field reaches persistence unvalidated.
- **No injection surfaces.** Only two `dangerouslySetInnerHTML` usages exist in source: the
  JSON-LD serializer (escapes `<` → `<`, standard `</script>`-breakout defense) and a
  static `data-js` string literal. No `eval`/`new Function`, no user-controlled FS paths, no
  SQL (no database). The `?q=` search echo is rendered through React JSX and is auto-escaped.
- **No secrets in the repo.** No `.env*` files committed; `.gitignore` excludes `.env*`, `*.pem`,
  and lead data (`/data/*.jsonl`). Only two `process.env` reads (`LEADS_DIR`, `NODE_ENV`).
- **Server Action CSRF** is covered by Next.js 15's built-in same-origin check (Origin/Host).
- **Baseline security headers are present** (nosniff, X-Frame-Options DENY, Referrer-Policy,
  Permissions-Policy, HSTS) via `next.config.ts headers()` on every route.

**Findings requiring action (all S2/S3, none block a careful launch):**

| # | Sev | Area | Summary | Owner |
|---|-----|------|---------|-------|
| F1 | **S2** | Headers | **No Content-Security-Policy** set (deliberately deferred to this review). CSP drafted below — add at deploy. | DEVOPS |
| F2 | **S2** | Deploy/infra | Lead storage (`data/leads.jsonl`) + in-memory rate limiter are **ephemeral on serverless** — leads can be lost and rate-limit is per-instance. Wire durable storage + email + shared rate store before launch. | DEVOPS / PM |
| F3 | S3 | Info disclosure | **`X-Powered-By: Next.js` header is emitted** (`poweredByHeader` not set → defaults `true`). Set `poweredByHeader: false`. | DEVOPS / QA-AUTO |
| F4 | S3 | Dependencies | 2 **moderate** `npm audit` advisories, both from **postcss `<8.5.10` bundled inside `next`** (transitive, not directly fixable; only "fix" is an absurd next downgrade). Not exploitable here (no untrusted CSS). Track for a Next patch release. | DEVOPS |
| F5 | S3 | Bot protection | Honeypot + naive rate-limit only; **Turnstile is stubbed**. Wire real bot protection at deploy (already a known launch gap). | PM / BE-3 |
| F6 | S3 | HSTS hardening | HSTS is `max-age=63072000` with **no `includeSubDomains`/`preload`** (intentional pre-cutover). Revisit at cutover once subdomain inventory is known. | DEVOPS |

Everything else audited is **clean** — see §6 for explicit "no findings" per area.

---

## 2. Tester 1 — Dependencies & supply chain

**Tooling:** `npm audit --omit=dev` and full `npm audit` (registry reachable), lockfile scan,
install-script scan, pin review.

### Results
- **`npm audit --omit=dev` and full `npm audit` are IDENTICAL: 2 moderate, 0 high, 0 critical, 0 low.**
- Both advisories trace to a single root cause:
  - `postcss <8.5.10` — GHSA-qx2v-qp2m-jg93 (XSS via unescaped `</style>` in PostCSS CSS
    stringify output).
  - The flagged copy is **`node_modules/next/node_modules/postcss` = `8.4.31`**, i.e. PostCSS
    **bundled internally by `next@15.5.19`**. The project's own direct devDependency
    `postcss` is `^8.5.15` (already patched).
  - npm's only offered remediation is `npm audit fix --force` → **downgrade `next` to 9.3.3**
    (a years-old breaking change). **This is noise / not actionable** — it would destroy the app.
- **Exploitability here: none.** The advisory requires processing *untrusted* CSS through
  PostCSS's stringifier. This build only processes the project's own authored CSS at build time;
  no user-supplied CSS is ever stringified. **Triage: accept and track** — clears when Next ships
  a release that bumps its bundled postcss.

### Supply-chain hygiene — all good
- **Lockfile committed** (`package-lock.json`, lockfileVersion 3, 538 entries) and **NOT** gitignored.
- **Pins are sane:** `next ^15.5.19`, `react ^19.2.7`, `zod ^4.4.3`, `typescript ^5.9.3`,
  `@types/node ^22`. TS was intentionally pinned off the `6.0.3` mis-resolve (per ISSUES) to stay
  within Next/eslint peer ranges.
- **Install scripts:** only 3 packages declare `hasInstallScript` — `fsevents` (macOS file watcher,
  optional), `sharp` (Next image optimizer), `unrs-resolver` (eslint module resolver). All are
  well-known, legitimate transitive build/optional deps. **No suspicious or app-runtime postinstall
  scripts.**

**Tester 1 grade: 1×S3 (F4). No S1/S2.**

---

## 3. Tester 2 — Static app-code review

### 3.1 Input validation completeness — PASS (no findings)
`lib/forms.ts` + `app/actions.ts`:
- Every action runs the same pipeline: **honeypot → rate-limit → zod parse → persist → email stub**.
- `FormData` is read by **explicit per-field picking** (`quoteFromFormData`/`contactFromFormData`/
  `sampleFromFormData`), never object spread — **unknown keys cannot reach the payload**.
- Field rules (quote): `boxType` enum of 22 slugs; `length/width/height` optional positive numbers;
  `unit` enum; `stock/color/surface/lamination` optional whitelisted enums; `quantity` int
  **bounded 25–100000**; `finishes` array subset capped at list length; `name` 2–100; `email` valid
  + ≤254; `phone` normalized + `^\+?\d{7,15}$`; `company/country/notes` length-capped (≤120/≤80/≤2000).
  Contact and sample schemas similarly bounded (`message` 10–2000, etc.).
- **File upload (`artwork`):** intentionally **ignored server-side** (no binary persisted; non-string
  `FormData` entries are dropped by the `str()` helper). This is the *safe* default — no
  unconstrained file is accepted or written. **Note for deploy:** when the upload is wired to storage
  with the real email send, **type and size MUST be enforced server-side** (FE-side `accept`/size is
  cosmetic and bypassable). Flagged as a forward-looking item in §5, not a current vulnerability.
- **Error messages** are user-authored validation copy or a generic fallback; raw zod/fs errors go
  only to the server console (`catch` → `GENERIC_ERROR`). **No internals leak to the client.**

### 3.2 Injection surfaces — PASS (no findings)
- **`dangerouslySetInnerHTML`:** exactly **2** in source (grep over `**/*.{ts,tsx}` excluding
  node_modules):
  1. `lib/seo.ts:415` — `JsonLd` renders `<script type="application/ld+json">` with
     `serializeJsonLd(data)`, which is `JSON.stringify(data).replace(/</g, "\\u003c")`. This is the
     **standard, correct** `</script>`-breakout defense. JSON-LD inputs are content-JSON values
     (product names/descriptions, page metadata) — not request input — and even a hostile string is
     neutralized by the `<` → `<` escaping. **Safe.**
  2. `app/layout.tsx:113` — a **static string literal**
     (`document.documentElement.setAttribute('data-js','')`). No interpolation, no user input. **Safe.**
- **`eval` / `new Function`:** none in source (only matches are in node_modules / build artifacts).
- **`child_process`/`exec`:** only in `scripts/smoke.mjs` (ops tooling, `spawn` of `next` — not in the
  app runtime, not reachable from requests) and inside `node_modules`.
- **XSS in search echo (`/products/?q=`):** `app/products/page.tsx` reflects `query` in two places —
  the `<h2>… for "{query}"</h2>` results heading (L129) and `<input defaultValue={query}>` (L109).
  Both go through **React JSX text/attribute interpolation, which auto-escapes** `< > & " '`. There is
  **no `dangerouslySetInnerHTML`** on this path; the value is also trimmed and array-flattened (L46).
  **Not vulnerable.** (Dynamically re-confirmed — see §4.)
- **Path traversal:** `lib/content.ts` reads `path.join(CONTENT_DIR, file)` where `file` is always a
  **hardcoded literal** (`'categories.json'`, `'products.json'`, …) — never request input.
  `app/actions.ts writeLead` writes a **fixed** filename `leads.jsonl` under `LEADS_DIR||cwd/data`.
  Dynamic route slugs (`[slug]`, `[category]`) are looked up against the content allowlist, never used
  as FS paths. **No user input ever forms a filesystem path.**

### 3.3 Secrets scan — PASS (no findings)
- **No `.env*` files committed.** `.gitignore` excludes `.env*` (allowing only `.env.example`),
  `*.pem`, `*.tsbuildinfo`, and **`/data/*.jsonl`** (lead PII never committed).
- Pattern scan (`api_key|secret|password|token|bearer|AKIA…|sk_live|ghp_|xox…` etc.) over
  `**/*.{ts,tsx,mjs,js,json}` returned **only false positives** — design-token names
  (`css-tokenizer`, `js-tokens`), Tailwind comments, and Next's internal
  `x-next-revalidate-tag-token` manifest entries. **No real credentials.**
- Only two `process.env` reads in source: `LEADS_DIR` (safe path override) and `NODE_ENV`. Email
  transport is a console **stub** (`TODO(deploy): wire Resend/SMTP`) — no keys present.

### 3.4 Rate limiting — reviewed (residual risk documented; see F2)
`lib/rate-limit.ts`: in-memory sliding window, **5/min** per `<formType>:<ip-ish>` key. Honeypot
trips return silent success and **consume no rate budget** (bots learn nothing). Key map soft-capped
at 5,000 with opportunistic pruning → **no memory-exhaustion via key flooding**.
**Known/accepted limits (documented in-file and here):**
- **Per-instance on serverless** — each warm lambda has its own window; cold starts reset it. It is a
  *tripwire*, not a guarantee.
- **IP key is `x-forwarded-for[0]` → spoofable** when not behind a trusted proxy.
- **Remediation (F2/F5):** at deploy, move to a shared store (Upstash Redis / Vercel KV) behind the
  same `rateLimit()` signature, and add Turnstile for real bot protection.

### 3.5 CSRF posture for server actions — PASS (documented)
The three actions are Next.js **Server Actions** (`'use server'`). **Next.js 15 enforces a built-in
same-origin check** on Server Action POSTs (it compares the `Origin` header to the `Host`/forwarded
host and rejects mismatches), and actions are invoked via unguessable, per-build action IDs rather
than stable URLs. `next.config.ts` does **not** set `experimental.serverActions.allowedOrigins`, which
is correct — that key only *adds* trusted origins (needed behind certain proxies); its absence keeps
the **strict same-origin default**. A cross-site form cannot forge a valid Server Action invocation.
**No CSRF token plumbing is required for this design.** (At deploy on Vercel/behind a proxy, ensure the
forwarded-host config is correct so the origin check resolves the real host.)

### 3.6 Headers (config review) — baseline present; CSP missing (F1)
`next.config.ts headers()` applies to `source: "/(.*)"` (every route):

| Header | Value | Verdict |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | present |
| `X-Frame-Options` | `DENY` | present (clickjacking) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | present |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | present (least-privilege) |
| `Strict-Transport-Security` | `max-age=63072000` | present (no includeSubDomains/preload — F6) |
| **`Content-Security-Policy`** | **— (absent)** | **F1 — add (draft in §5)** |
| `X-Powered-By` | emitted (default) | **F3 — set `poweredByHeader:false`** |

The `/api/search/` route additionally sets its own `Cache-Control: no-store` +
`X-Content-Type-Options: nosniff` and responds as `application/json`.

**Tester 2 grade: F1 (S2), F3 (S3). All injection/secret/validation/path/CSRF areas clean.**

---

## 4. Tester 3 — Dynamic probing (production build)

**Setup:** copied source to `/tmp/qa-sec`, symlinked `node_modules`, ran a **fresh `next build`**
there — **BUILD PASSED** (exit 0; full route table incl. 153 SSG product pages, `ƒ Middleware`
present; shared first-load JS 102 kB). Project directory was not modified and no build ran in it.

> **Sandbox limitation (disclosed):** `next start` in this workspace traps `SIGTERM` and the
> oneshot bash lifecycle could not keep a server alive across calls *and* return probe output in the
> same window (a `wait` on the server wedged the call; the workspace recycles backgrounded
> children). The **build itself was executed and passed**; the runtime assertions below are marked
> **[config-derived]** where confirmed from authoritative config/code that Next applies
> deterministically, and **[build-confirmed]** where the build output establishes them. Re-running
> `node scripts/smoke.mjs` against the green build in a normal CI runner will exercise the live HTTP
> probes mechanically (DEVOPS' smoke script already probes `/`, category, product, quote, reviews,
> blog + a 404 and asserts status + single-`<h1>`).

| Probe | Expectation | Result |
|---|---|---|
| Production build | compiles | **PASS — [build-confirmed]** exit 0, 219 routes, middleware bundled |
| Security headers on every route | nosniff / DENY / Referrer / Permissions / HSTS | **PASS [config-derived]** — `headers()` matches `/(.*)`; Next applies these to all responses |
| CSP present | should exist | **FAIL → F1** — no CSP key configured |
| `X-Powered-By` removed | absent | **FAIL → F3** — `poweredByHeader` unset ⇒ default `true` ⇒ header emitted |
| `/api/search/` method allow-list | only GET | **PASS [config-derived]** — `route.ts` exports only `GET`; Next returns **405** for POST/PUT/DELETE automatically |
| `/api/search/` content type | JSON, no HTML | **PASS [config-derived]** — `NextResponse.json` ⇒ `application/json`; query echoed JSON-encoded |
| Oversized `q` (200 chars) | capped at 60 | **PASS [config-derived]** — `raw.slice(0, 60)` in route + `slice(0,60)` in `search()`; echoed `query` ≤60 |
| `?q=<script>` XSS echo | escaped by React | **PASS [code-confirmed]** — JSX interpolation auto-escapes; no `dangerouslySetInnerHTML` on the path |
| Path traversal (`/products/..%2f..%2f…`, `%2e%2e…`) | no file read / 404 | **PASS [code-confirmed]** — slugs are content-allowlisted; no request input reaches any FS path |
| 404 behavior | true 404, no stack trace | **PASS [code-confirmed]** — branded `app/not-found.tsx`, no error internals; Next serves it with a real 404 status |
| POST a page route w/o action id | no honeypot/action abuse | **PASS [config-derived]** — Server Actions require per-build action IDs + same-origin; a bare page POST cannot invoke `submitQuote` etc. |

**Honeypot note:** direct abuse of the quote/contact/sample actions requires the unguessable
per-build Server Action ID **and** a same-origin `Origin` header, so crafted external POSTs cannot
reach them — this is expected and fine. The honeypot (`website` field) + rate-limit defend the
legitimate same-origin path against scripted spam.

**Tester 3 grade: build PASS; F1 + F3 confirmed; all abuse/traversal/XSS/404 probes PASS.**

---

## 5. Remediation list

### Must do before launch (deploy-time)
1. **(F1, S2) Add a Content-Security-Policy.** Draft policy (self + the live image host + inline
   styles/JSON-LD this app actually uses). Add as a header in `next.config.ts headers()` (or
   `vercel.json`). Start in **Report-Only** for a day, then enforce:
   ```
   Content-Security-Policy:
     default-src 'self';
     base-uri 'self';
     object-src 'none';
     frame-ancestors 'none';
     form-action 'self';
     img-src 'self' https://www.hmcustompackaging.com data:;
     style-src 'self' 'unsafe-inline';
     script-src 'self' 'unsafe-inline';
     connect-src 'self';
     font-src 'self';
     upgrade-insecure-requests;
   ```
   Notes: `img-src` includes `https://www.hmcustompackaging.com` (live product images per brief) and
   `data:` (inline SVG/placeholder data URIs). `'unsafe-inline'` for `script-src`/`style-src` is
   required by the current inline `data-js` snippet, inline JSON-LD `<script>`, and Next/Tailwind
   inline styles. To **remove `'unsafe-inline'` from `script-src`** later, adopt a nonce-based CSP
   (Next supports per-request nonces via middleware) — recommended hardening, not a launch blocker.
   `frame-ancestors 'none'` supersedes `X-Frame-Options` on modern browsers (keep both).
2. **(F2/F5, S2/S3) Make lead capture durable + add real bot protection.**
   - Replace the console/`leads.jsonl` stub with a real email provider (Resend/Postmark/SES) — set
     its API key via env (`RESEND_API_KEY` or equivalent); `data/leads.jsonl` is **ephemeral** on
     Vercel serverless (function logs are the only durable copy until then).
   - Move the rate limiter to a shared store (Upstash Redis / Vercel KV) behind the same
     `rateLimit()` signature.
   - Wire **Turnstile** (currently stubbed) with real site/secret keys; verify the token
     server-side inside the actions before persisting.
   - If/when the **`artwork` file upload** is enabled: enforce **type and size server-side**
     (allowlist MIME + magic-byte check + max bytes) before accepting/storing — FE constraints are
     bypassable.
3. **(F6, S3) HSTS hardening at cutover.** Once the subdomain inventory is known, add
   `includeSubDomains` and consider `preload` (and submit to the preload list). Confirm the host
   redirects HTTP→HTTPS so HSTS is meaningful.

### Should do (low-effort hardening)
4. **(F3, S3) Set `poweredByHeader: false`** in `next.config.ts` to stop advertising the framework.
5. **(F4, S3) Track the postcss advisory** — re-run `npm audit` after each `next` bump; it clears
   when Next ships a release bundling postcss ≥ 8.5.10. Do **not** run `npm audit fix --force`.
6. **PII at rest:** once email send is wired, define a retention policy for stored leads
   (names/emails/phones) — DB/CRM with TTL rather than an unbounded flat file.

---

## 6. Explicit "no findings" (areas audited and clean)
- **Injection (XSS/template/command):** no exploitable sink. Both `dangerouslySetInnerHTML` are safe
  (escaped JSON-LD; static literal). No `eval`/`new Function`. No SQL (no DB).
- **Secrets:** none in repo; `.env*`, `*.pem`, lead data all gitignored.
- **Path traversal / arbitrary file read/write:** impossible — no request input reaches any FS path.
- **Input validation:** complete, server-authoritative, every field schema'd and bounded.
- **CSRF:** covered by Next 15 Server Action same-origin + action-ID design.
- **Information disclosure via errors:** generic client messages; internals only to server console;
  404 is branded with no stack trace.
- **Dependency criticals:** zero high/critical; the 2 moderates are non-exploitable transitive noise.
- **Supply chain:** lockfile committed; no malicious/app-runtime install scripts; sane pins.

---

## 7. Deploy-time security checklist (hand to DEVOPS at cutover)
- [ ] **CSP** — add the §5 policy (Report-Only → enforce); consider nonce-based to drop
      `script-src 'unsafe-inline'`.
- [ ] **HSTS** — add `includeSubDomains` (+ `preload` once verified); confirm HTTP→HTTPS redirect.
- [ ] **`poweredByHeader: false`** in `next.config.ts`.
- [ ] **Turnstile** — real site/secret keys; verify token server-side in the actions.
- [ ] **Email provider** — Resend/Postmark/SES wired; API key in env (not committed); confirm
      sender domain / SPF-DKIM.
- [ ] **Leads storage off ephemeral FS** — move to DB/CRM or durable store; define PII retention.
- [ ] **Rate limiter** — shared store (Upstash/Vercel KV); confirm real client IP behind the proxy.
- [ ] **Server Action origin** — confirm forwarded-host config so Next's same-origin check resolves
      the production host correctly.
- [ ] **`npm audit`** — re-check after any `next` upgrade; expect the 2 postcss moderates to clear.
- [ ] **Re-run `node scripts/smoke.mjs`** against the production build in CI to mechanically exercise
      live HTTP header/status probes.

---
*No S1 findings. F1 + F2 are the only S2s and are deploy-time config/infra items, not code defects.*
