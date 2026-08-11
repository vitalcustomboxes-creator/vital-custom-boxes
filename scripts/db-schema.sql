-- scripts/db-schema.sql — Vercel Postgres schema for the reviews + leads data layer.
--
-- Run ONCE against the production database (psql or the Vercel SQL console)
-- after connecting a Postgres store to the project. lib/store.ts reads
-- POSTGRES_URL at runtime and dynamically imports @vercel/postgres; these are
-- the tables it expects. See the JSDoc in lib/store.ts for the env switch.

-- ── reviews ────────────────────────────────────────────────────────────────
-- Public submissions land as status='pending', verified=false. Moderators
-- promote a review to status='approved', verified=true to make it display.
CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL   PRIMARY KEY,
  author      TEXT        NOT NULL,
  location    TEXT        NOT NULL,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT        NOT NULL,
  source      TEXT        NOT NULL DEFAULT 'verified',
  verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  status      TEXT        NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Display query path: WHERE status='approved' AND verified=TRUE ORDER BY created_at DESC.
CREATE INDEX IF NOT EXISTS reviews_display_idx
  ON reviews (status, verified, created_at DESC);

-- ── leads ──────────────────────────────────────────────────────────────────
-- Durable quote/contact/sample leads. payload is the validated form object.
CREATE TABLE IF NOT EXISTS leads (
  id          BIGSERIAL   PRIMARY KEY,
  type        TEXT        NOT NULL,
  payload     JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_type_created_idx
  ON leads (type, created_at DESC);

-- ── (optional) seed the 10 migrated reviews so the wall is populated in prod ─
-- Mark them approved+verified so listReviews() returns them immediately.
-- INSERT INTO reviews (author, location, rating, text, source, verified, status) VALUES
--   ('Jessica M', 'New York, NY', 5, 'These custom apparel boxes are perfect! ...', 'migrated', TRUE, 'approved');
-- (repeat for the remaining nine — full text lives in content/reviews.json)
