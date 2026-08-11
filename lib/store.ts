/**
 * lib/store.ts — unified reviews/ratings + durable-leads data layer (BE owned).
 *
 * SERVER-ONLY. Import from server actions (app/actions.ts), API routes
 * (app/api/reviews/route.ts) and server components — never from a client
 * ("use client") component. Reads/writes the filesystem in local mode and uses
 * @vercel/postgres in production.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENV SWITCH — chosen at runtime, per call, by `process.env.POSTGRES_URL`:
 *
 *   POSTGRES_URL set    → Postgres adapter. `@vercel/postgres` is imported via
 *                         a DYNAMIC `await import('@vercel/postgres')` INSIDE
 *                         each adapter function, so the package is never
 *                         required for local dev / build / test / lint. It is
 *                         listed in package.json dependencies but is only
 *                         pulled in at runtime on Vercel.
 *
 *   POSTGRES_URL unset  → Local file adapter (default for dev/sandbox/test):
 *                           • seed reviews   ← content/reviews.json
 *                           • rating summary ← content/ratings.json
 *                           • new reviews    → data/pending-reviews.jsonl (append)
 *                           • new leads      → data/leads.jsonl           (append)
 *                         The data/ directory is created on first write.
 *
 * The four public functions are identical in shape across adapters:
 *   listReviews()      → approved/verified reviews for display
 *   getRatingSummary() → { ratingValue, reviewCount, bestRating: 5 }
 *   addReview(input)   → new submission (status 'pending', verified:false)
 *   addLead(input)     → durable quote/contact/sample lead
 *
 * ──────────────────────────────────────────────────────────────────────────
 * PROVISIONING VERCEL POSTGRES (production):
 *
 *   1. In the Vercel dashboard → Storage → create a Postgres database and
 *      connect it to the project. Vercel injects POSTGRES_URL (and friends)
 *      into the environment automatically — that env var is the ONLY switch
 *      this module reads.
 *   2. Run the schema once against the database (psql or the Vercel SQL
 *      console). The schema also lives in scripts/db-schema.sql:
 *
 *        CREATE TABLE IF NOT EXISTS reviews (
 *          id          BIGSERIAL PRIMARY KEY,
 *          author      TEXT        NOT NULL,
 *          location    TEXT        NOT NULL,
 *          rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
 *          text        TEXT        NOT NULL,
 *          source      TEXT        NOT NULL DEFAULT 'verified',
 *          verified    BOOLEAN     NOT NULL DEFAULT FALSE,
 *          status      TEXT        NOT NULL DEFAULT 'pending',
 *          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
 *        );
 *
 *        CREATE TABLE IF NOT EXISTS leads (
 *          id          BIGSERIAL PRIMARY KEY,
 *          type        TEXT        NOT NULL,
 *          payload     JSONB       NOT NULL,
 *          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
 *        );
 *
 *   3. (Optional) seed the 10 migrated reviews as
 *      status='approved', verified=true so listReviews() returns them in prod.
 *
 * Display reads (listReviews/getRatingSummary) in Postgres mode fall back to
 * the seed JSON if the tables are empty or unreachable, so a fresh database
 * never renders an empty wall.
 */
import 'server-only';
import { appendFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { RatingSummary, Review } from './types';

/* ------------------------------------------------------------------------- */
/* Public input shapes                                                        */
/* ------------------------------------------------------------------------- */

/** A new review submission (before moderation). */
export interface ReviewInput {
  author: string;
  location: string;
  /** 1–5 integer. */
  rating: number;
  text: string;
}

/** A durable lead (quote / contact / sample). `payload` is the validated form. */
export interface LeadInput {
  type: 'quote' | 'contact' | 'sample';
  payload: unknown;
}

/* ------------------------------------------------------------------------- */
/* Local seed readers (also the Postgres fallback)                            */
/* ------------------------------------------------------------------------- */

const CONTENT_DIR = path.join(process.cwd(), 'content');

function dataDir(): string {
  // Mirrors app/actions.ts: LEADS_DIR override (tests) or <cwd>/data.
  return process.env.LEADS_DIR || path.join(process.cwd(), 'data');
}

function readSeedReviews(): Review[] {
  try {
    const raw = readFileSync(path.join(CONTENT_DIR, 'reviews.json'), 'utf8');
    const rows = JSON.parse(raw) as Array<Review | { _note: string }>;
    return rows.filter((r): r is Review => !('_note' in r));
  } catch {
    return [];
  }
}

function readSeedRatingSummary(): RatingSummary {
  try {
    const raw = readFileSync(path.join(CONTENT_DIR, 'ratings.json'), 'utf8');
    return JSON.parse(raw) as RatingSummary;
  } catch {
    // Conservative default if the file is missing — never fabricate a high score.
    return { ratingValue: 0, reviewCount: 0, bestRating: 5 };
  }
}

/** True when a Vercel Postgres connection is configured (production). */
function isPostgresMode(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

/* ------------------------------------------------------------------------- */
/* Local file adapter                                                         */
/* ------------------------------------------------------------------------- */

async function appendJsonl(file: string, record: unknown): Promise<void> {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, file),
    `${JSON.stringify(record)}\n`,
    'utf8',
  );
}

const local = {
  async listReviews(): Promise<Review[]> {
    // Seed reviews are the approved/verified set for display.
    return readSeedReviews().filter((r) => r.verified);
  },
  async getRatingSummary(): Promise<RatingSummary> {
    return readSeedRatingSummary();
  },
  async addReview(input: ReviewInput): Promise<void> {
    await appendJsonl('pending-reviews.jsonl', {
      ts: new Date().toISOString(),
      status: 'pending',
      source: 'verified',
      verified: false,
      author: input.author,
      location: input.location,
      rating: input.rating,
      text: input.text,
    });
  },
  async addLead(_input: LeadInput): Promise<void> {
    // No-op in local mode: app/actions.ts already appends the canonical line to
    // data/leads.jsonl. addLead's job locally is just to NOT double-write — the
    // durable behaviour only differs in Postgres mode. (Underscore: unused.)
    void _input;
  },
};

/* ------------------------------------------------------------------------- */
/* Postgres adapter (Vercel) — @vercel/postgres imported dynamically          */
/* ------------------------------------------------------------------------- */

/**
 * Minimal local type for the @vercel/postgres `sql` tagged-template — declared
 * here so this file type-checks WITHOUT the package installed (it is only
 * pulled in at runtime on Vercel). The import specifier is held in a variable
 * so the TS compiler does not attempt to resolve the module at build time.
 */
type SqlRow = Record<string, unknown>;
type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<{ rows: SqlRow[] }>;

const VERCEL_POSTGRES = '@vercel/postgres';

/** Dynamic, build-safe load of the Vercel Postgres `sql` helper. */
async function loadSql(): Promise<SqlTag> {
  const mod = (await import(/* webpackIgnore: true */ VERCEL_POSTGRES)) as {
    sql: SqlTag;
  };
  return mod.sql;
}

const postgres = {
  async listReviews(): Promise<Review[]> {
    try {
      const sql = await loadSql();
      const { rows } = await sql`
        SELECT author, location, rating, text, source, verified, created_at
        FROM reviews
        WHERE status = 'approved' AND verified = TRUE
        ORDER BY created_at DESC
        LIMIT 100;
      `;
      if (rows.length === 0) return readSeedReviews().filter((r) => r.verified);
      return rows.map((r) => ({
        author: String(r.author),
        location: String(r.location),
        rating: Number(r.rating),
        text: String(r.text),
        source: (r.source as Review['source']) ?? 'verified',
        verified: Boolean(r.verified),
        date:
          r.created_at != null
            ? new Date(r.created_at as string).toISOString().slice(0, 10)
            : undefined,
      }));
    } catch {
      // Tables missing/unreachable on a fresh DB — fall back to the seed set.
      return readSeedReviews().filter((r) => r.verified);
    }
  },

  async getRatingSummary(): Promise<RatingSummary> {
    try {
      const sql = await loadSql();
      const { rows } = await sql`
        SELECT AVG(rating)::numeric(3,1) AS avg, COUNT(*)::int AS cnt
        FROM reviews
        WHERE status = 'approved' AND verified = TRUE;
      `;
      const row = rows[0];
      const cnt = row ? Number(row.cnt) : 0;
      if (!row || cnt === 0) return readSeedRatingSummary();
      return {
        ratingValue: Number(row.avg),
        reviewCount: cnt,
        bestRating: 5,
      };
    } catch {
      return readSeedRatingSummary();
    }
  },

  async addReview(input: ReviewInput): Promise<void> {
    const sql = await loadSql();
    await sql`
      INSERT INTO reviews (author, location, rating, text, source, verified, status)
      VALUES (${input.author}, ${input.location}, ${input.rating}, ${input.text}, 'verified', FALSE, 'pending');
    `;
  },

  async addLead(input: LeadInput): Promise<void> {
    const sql = await loadSql();
    await sql`
      INSERT INTO leads (type, payload)
      VALUES (${input.type}, ${JSON.stringify(input.payload)}::jsonb);
    `;
  },
};

/* ------------------------------------------------------------------------- */
/* Public API — dispatches to the adapter chosen by POSTGRES_URL              */
/* ------------------------------------------------------------------------- */

/** Approved/verified reviews for display (newest first in Postgres mode). */
export async function listReviews(): Promise<Review[]> {
  return isPostgresMode() ? postgres.listReviews() : local.listReviews();
}

/** Aggregate rating summary for the badge + Organization JSON-LD. */
export async function getRatingSummary(): Promise<RatingSummary> {
  return isPostgresMode() ? postgres.getRatingSummary() : local.getRatingSummary();
}

/** Persist a new review submission as status 'pending', verified:false. */
export async function addReview(input: ReviewInput): Promise<void> {
  return isPostgresMode() ? postgres.addReview(input) : local.addReview(input);
}

/** Persist a durable quote/contact/sample lead. */
export async function addLead(input: LeadInput): Promise<void> {
  return isPostgresMode() ? postgres.addLead(input) : local.addLead(input);
}
