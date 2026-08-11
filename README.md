# HM Custom Packaging — Site Rebuild

Custom **Next.js 15 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS 3.4** rebuild of
[hmcustompackaging.com](https://www.hmcustompackaging.com). Built by Codewingz.

No CMS, no database: content lives as local JSON in `/content` with typed loaders in `lib/content.ts`
(CMS-ready shape). Forms use server actions + zod; email sending is stubbed (console + `data/leads.jsonl`).

## Setup

Requirements: Node.js >= 20, npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Next.js dev server                                |
| `npm run build`     | Production build (SSG)                            |
| `npm run start`     | Serve the production build                        |
| `npm run lint`      | `eslint .` (flat config `eslint.config.mjs` — DEVOPS) |
| `npm run test`      | Vitest (`--passWithNoTests` until QA-AUTO lands)  |
| `npm run typecheck` | `tsc --noEmit` (strict)                           |

## Project structure

```
app/                  Routes (App Router) — layout, pages, sitemap.ts, robots.ts
components/ui/        Primitives (Button, Input, Badge, …)            — FE-1
components/patterns/  Nav/layout + content patterns (Header, Footer,
                      ProductCard, QuoteForm, FAQAccordion, …)        — FE-2 / FE-3
components/blocks/    Page-level composed sections
content/              Source-of-truth JSON (products, categories,
                      posts, reviews, globals)                        — DATA-ENG
lib/                  Typed loaders, redirects, seo helpers, search
styles/               tokens.css (design tokens) + globals.css        — DESIGNER
public/               Static assets (logo, icons)
data/                 Runtime output (leads.jsonl — gitignored)
tests/                Vitest unit + content-integrity tests           — QA-AUTO
scripts/              One-off build/validation scripts                — DEVOPS
docs/                 Project brief, architecture, team reports, QA/SEO docs
```

Key config files:

- `next.config.ts` — TS config (decision documented inside); images allow
  `www.hmcustompackaging.com` + `unoptimized: true` for sandbox builds; redirects imported
  from `lib/redirects.ts`.
- `tailwind.config.ts` — maps brand colors / radii / shadows / fonts to CSS variables defined
  in `styles/tokens.css`.
- `tsconfig.json` — strict, `@/*` path alias to repo root.

## Team docs

- [Project brief (the contract)](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Team board](docs/team/BOARD.md) · [Issues log](docs/team/ISSUES.md) · [Role reports](docs/team/reports/)
- SEO docs in `docs/seo/`, QA docs in `docs/qa/`

## Operations

_Owner: DEVOPS — tooling, CI, deploy. Section appended 2026-06-12._

### Scripts

| Command                          | What it does                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run lint`                   | ESLint 9 flat config (`eslint.config.mjs`): next/core-web-vitals + next/typescript                     |
| `npm run typecheck`              | `tsc --noEmit` (strict; includes tests and configs)                                                    |
| `npm test`                       | Vitest, two projects: **node** (`*.test.ts` — actions/lib) and **dom** (`*.test.tsx` — jsdom + RTL + jest-dom via `tests/setup.ts`) |
| `node scripts/check-budgets.mjs` | Post-build: first-load JS ≤150 kB/route (gzip, parses `.next` manifests; `BUDGET_KB=…` to override)    |
| `node scripts/smoke.mjs`         | One-shot: boots `next start` (fallback `next dev`) on port 3100, asserts route statuses + exactly one `<h1` + `<title>` per 200 page, prints table, kills server (`SMOKE_PORT`/`SMOKE_MODE` to override) |
| `node scripts/validate-content.mjs` | Content integrity + banned-claims scan (DATA-ENG)                                                   |
| `node scripts/gen-redirects.mjs` | Regenerates `lib/redirects.ts` from the redirect spec (SEO-1)                                          |

### CI (.github/workflows/ci.yml)

Single job on push/PR: `npm ci → lint → typecheck → vitest → build → check-budgets → smoke`.
The last two stages parse/serve the `.next/` output of the build stage, so they must stay in the
same job after `npm run build`.

### Deploy (Vercel)

- Framework preset **Next.js**, Node **20**, build `npm run build` — no env vars required today.
- `trailingSlash: true` + 263 static 308 redirects ship via `next.config.ts`; the query-string
  legacy URL (`/?page_id=3`) is handled in `middleware.ts`.
- Security headers are set app-side in `next.config.ts` `headers()` (nosniff, DENY framing,
  referrer policy, minimal Permissions-Policy, HSTS) — platform-agnostic, works on any
  `next start` host; Vercel additionally injects HSTS on HTTPS domains. CSP deferred to the
  SECURITY pass (inline scripts: `data-js` snippet + JSON-LD need an inventory first).
- `images.unoptimized: true` is set for sandbox/CI builds; consider removing it on Vercel to get
  the image optimizer (ARCHITECT decision at cutover).
- Brand assets are self-hosted in `public/` (`/logo.svg`, `/og-default.svg`) — do not reference
  `wp-content` URLs in new code; those die when WordPress is switched off.

### Lead storage

Form submissions (quote/contact) append JSON lines to **`data/leads.jsonl`** (gitignored) and log
to the server console — a deliberate stub per the brief (no external services).
**Vercel warning:** the serverless filesystem is ephemeral — `data/leads.jsonl` does NOT persist
between invocations/deploys. Until a real provider is wired, treat the function logs as the
durable copy of each lead.

### Launch TODOs (tracked in docs/team/ISSUES.md)

- [ ] Email provider for lead notifications (Resend/Postmark/SES) replacing the console+jsonl stub
- [ ] Analytics (GA4 or privacy-light alternative) — nothing is installed
- [ ] Real Cloudflare Turnstile keys for form bot-protection (currently stubbed)
- [ ] Replace `public/logo.svg` (recreation) 1:1 with the live `logo3.svg`; export
      `public/og-default.svg` as a 1200×630 PNG and point `DEFAULT_OG_IMAGE` at it






============ ready to resume plan ==========
- sometimes the previous site shows on the https://www.vitalcustomboxes.com/ site; 
- sometimes in production the images are failed to load; this issue is only in the production app - locally it works file; 
- on Resend see if the domain is verified then update the Resend_FROM_EMAIL on vercel 
- 


