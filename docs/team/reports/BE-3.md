# BE-3 report — server actions, search lib, search API — 2026-06-12

## Status: DONE — `npx vitest run tests/actions.test.ts tests/search.test.ts` 29/29 PASS · `tsc --noEmit` clean for all BE-3 files · /api/search smoke-tested on a live dev server

## Files created
- `app/actions.ts` — `'use server'`: `submitQuote`, `submitContact`, `submitSample`
- `lib/forms.ts` — client-safe option lists + zod v4 schemas + FormData parsers + error formatter
- `lib/rate-limit.ts` — naive in-memory sliding-window limiter (+ `resetRateLimit()` test hook)
- `lib/search.ts` — ranked sitewide search (server-only via lib/content.ts)
- `app/api/search/route.ts` — GET JSON endpoint
- `tests/actions.test.ts` (21 tests), `tests/search.test.ts` (8 tests), `tests/stubs/server-only.ts`
- `vitest.config.ts` — first cut by BE-3 (node env, server-only stub, `@` alias); **DEVOPS extended it same-day into a two-project node/jsdom setup — their version is authoritative**, my aliases/conventions preserved.

## Action contract (FE-3 / BE-2: import from `@/app/actions`)
All three actions share one signature — exactly what FE-3's QuoteForm expects:

```ts
(data: FormData) => Promise<{ ok: boolean; error?: string }>   // ActionResult in lib/forms.ts
```

Pipeline per action: **honeypot → rate limit → zod parse → append JSONL lead → email stub → `{ok:true}`**.
- **Honeypot**: hidden text field named `website` (`HONEYPOT_FIELD` in lib/forms.ts). Non-empty → silent `{ok:true}`, nothing written, no rate budget consumed (bots learn nothing).
- **Rate limit**: 5/min per `<formType>:<ip-ish>` key from `x-forwarded-for[0]` / `x-real-ip` via `headers()`; over limit → `{ok:false, error:'Too many submissions…'}`. **Serverless caveat**: per-instance memory — tripwire, not a guarantee (swap for Upstash/KV at deploy; see lib/rate-limit.ts header).
- **Persistence**: appends `{ts: ISO, type: 'quote'|'contact'|'sample', payload}` as one JSON line to `data/leads.jsonl` (dir auto-created; `LEADS_DIR` env override used by tests; file is gitignored per ARCHITECT).
- **Email**: console stub only, clearly marked `TODO(deploy): wire Resend/SMTP` — logs lead summary + intended recipient from `getGlobals().email`.
- Validation failure → `{ok:false, error}` with a friendly, field-labelled message (max 3 fields). Unexpected errors are caught, logged server-side, and return a generic message — no internals leak.
- Actions never throw and never call `redirect()` — FE owns success navigation (`router.push('/thank-you')`).

## Schemas (lib/forms.ts — zod v4, client-safe: FE may import everything here)
**quoteSchema** field names (canonical):
| field | rule |
|---|---|
| boxType | enum of the 22 category slugs (`CATEGORY_SLUGS`; sync with content/categories.json is test-enforced) |
| length / width / height | optional positive numbers (blank ok) |
| unit | `'in' \| 'cm'`, defaults `'in'` |
| stock | optional enum `QUOTE_STOCKS` (13 live-form values: 12–24pt Card Stock, SBS Board, Kraft/Eco Friendly/Corrugated/Rigid Stock, Other) |
| color | optional enum `QUOTE_COLORS` (1/2/3/4 color, No Printing) |
| surface | optional enum `QUOTE_SURFACES` (Outside Only, Inside Only, Outside & Inside) |
| lamination | optional enum `QUOTE_LAMINATIONS` (Glossy, Matte, Anti Scratch Soft Touch) |
| quantity | required int 25–100000 (coerced) |
| finishes | array subset of `QUOTE_FINISHES` (Embossing, Debossing, Foiling, PVC Window, UV Coating), default [] |
| product | optional slug of originating product (FE hidden field) — lands in the lead record |
| name | min 2 / max 100 |
| email | valid email, max 254 |
| phone | required; normalized (strips `space . ( ) -`, keeps leading `+`); 7–15 digits |
| company / country / notes | optional, max 120 / 80 / 2000 |

Option lists were captured verbatim from the live quote form (get-custom-quote, 2026-06-12).

**FE-3 bridge (tolerant reader)**: `quoteFromFormData` accepts FE-3's current aliases — `depth`→height, `colors`→color — and canonicalizes label variants ("12pt Cardstock"→"12pt Card Stock", "4 colors (full color CMYK)"→"4 color", "Outside + inside"→"Outside & Inside", "Soft Touch"→"Anti Scratch Soft Touch", lamination "None"→omitted, "Kraft"→"Kraft Stock", "Eco (recycled kraft)"→"Eco Friendly Stock", etc.). Real UI submissions therefore validate today; drift logged in ISSUES for convergence. The optional `artwork` FileUpload is **ignored server-side** (no binary in JSONL) — wire to storage with the email send at deploy.

**contactSchema**: name (min2) · email · message (10–2000) required; phone (validated if present) · subject (≤150) optional.
**sampleSchema**: name + email required; phone/company/address(≤300)/country/productInterest(≤120)/notes(≤2000) optional — forgiving on purpose so BE-2's /samples page can ship a short form.

## Search
- `lib/search.ts` — `search(q, limit = 20, corpus?)` → `SearchHit { type: 'product'|'category'|'post'; slug; name; href; imageUrl? }`. Ranking: **name starts-with > name includes > description includes**; source order within a tier: products → categories → posts; query trimmed, case-insensitive, hard-capped at 60 chars (`MAX_QUERY_LENGTH`); empty → `[]`. Hrefs carry trailing slashes to match `trailingSlash: true` (no 308 hop on click). `corpus` param exists for deterministic tests — production callers omit it.
- NOTE: `lib/content.ts` has an earlier, simpler `search()` (DATA-ENG). **lib/search.ts is canonical** for the API/UI; consumers should not mix them (logged in ISSUES as informational).
- `app/api/search/route.ts` — `GET /api/search/?q=` → `{query, count, results}`; `Cache-Control: no-store` + `X-Content-Type-Options: nosniff`; input sliced to 60 chars before touching the index; Node runtime.
- **Consumer gotcha (FE-2 header search / anyone fetching)**: with `trailingSlash: true`, `/api/search?q=x` answers **308 → `/api/search/?q=x`**. Fetch the trailing-slash URL directly (verified on a live dev server).

## Verification
- `npx vitest run tests/actions.test.ts tests/search.test.ts` → **2 files, 29 tests, all green** (runs inside DEVOPS' "node" project).
- `npx tsc --noEmit` → zero errors in BE-3 files (repo-wide there are transient TS2307s in components/patterns/* awaiting FE-1's `@/components/ui` barrel — not mine, FE wave in flight).
- Live dev-server smoke: `/api/search/?q=mylar` → 200, 8 ranked hits; headers correct; empty query and 200-char query handled.

## SECURITY notes (for the security wave — please fold into SECURITY_REPORT)
1. **Input validation**: every form field is zod-validated server-side (enums whitelisted, numbers bounded 25–100000, strings length-capped ≤2000, email/phone format-checked, phone normalized). FormData extraction ignores non-string entries (Files) except where modeled. Unknown object keys never reach the payload (explicit field picking, not passthrough).
2. **Honeypot**: `website` field; trips return silent success — no oracle for bots; nothing persisted.
3. **Rate limiting**: 5/min sliding window per form+IP key, in-memory. Known limits: XFF is spoofable when not behind a trusted proxy; per-instance on serverless; bounded key map (5k) prevents memory exhaustion from key flooding. Upgrade path documented in lib/rate-limit.ts.
4. **FS path safety**: lead file path = `LEADS_DIR env || cwd()/data` + fixed filename `leads.jsonl`. No user-controlled path segments anywhere; dir created with `recursive: true`; writes are append-only. `data/*.jsonl` is gitignored (no lead PII in repo).
5. **No secrets**: no API keys/credentials anywhere; email transport is a console stub (TODO Resend/SMTP via env vars at deploy).
6. **Information exposure**: error strings are user-authored validation messages or generic copy; raw zod/fs errors only go to server console. Search API reflects the (capped, JSON-encoded) query back — JSON content type + nosniff; no HTML interpolation.
7. **PII at rest**: leads.jsonl holds names/emails/phones in plaintext on the server FS — fine for the stub phase; revisit (DB or CRM + retention) when email send is wired.

## Cross-role fix (noted per protocol)
`types/fe-contracts.d.ts` (BE-2's temporary contract shim) declared
`module "@/app/actions"` with the actions returning `Promise<void>` + "redirects
to /thank-you". Ambient `declare module` on a path-mapped specifier **shadows
the real file even after it exists** (the shim's "takes over automatically"
assumption is wrong) — repo-wide, tsc saw my actions as `void` and my test
typecheck broke. I deleted only the BE-3 block (the shim header explicitly
authorizes the owning agent to do so) and left an in-file note; the FE
component blocks still shadow the now-real components and can mask BE-2 page
prop mismatches — logged as S2 for BE-2/QA-AUTO. Verified after fix: tsc clean
for all BE-3 files incl. tests, 29/29 tests green.

## Issues logged (docs/team/ISSUES.md)
- FE-3 QuoteForm option labels / field names drift from lib/forms.ts canon — bridged server-side; FE-3 should import `QUOTE_OPTIONS` (S3).
- FE-3 client quantity min=1 vs server min=25 — surface MOQ before submit (S3).
- `/api/search/` trailing-slash requirement for fetch consumers (S3, informational).
- Duplicate search impls (lib/content.ts vs lib/search.ts) — lib/search.ts is canonical (S3).
- types/fe-contracts.d.ts ambient-shadowing — BE-3 block removed; FE blocks remain for BE-2/QA-AUTO (S2).

## Handoffs
- **FE-3**: import `QUOTE_OPTIONS`, `HONEYPOT_FIELD`, `ActionResult` from `@/lib/forms` (client-safe) to kill the drift; ideally rename `depth`→`height`, `colors`→`color` (aliases keep you safe meanwhile); set quantity `min={25}`.
- **BE-2**: pages pass `submitQuote`/`submitContact`/`submitSample` from `@/app/actions` straight into form components; `/thank-you` redirect stays client-side in the form.
- **FE-2**: header search → `fetch('/api/search/?q=' + encodeURIComponent(q))` (trailing slash!), debounce client-side; responses are no-store.
- **DEVOPS/QA-AUTO**: vitest config is yours now (two-project layout works for me); my suites live under `tests/*.test.ts` (node project).
