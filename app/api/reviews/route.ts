/**
 * /api/reviews — reviews data layer endpoint (BE owned).
 *
 * GET  → { summary, reviews } from the store (approved/verified reviews +
 *         aggregate rating). Never cached — reflects the latest moderated set.
 * POST → submit a review: honeypot + zod-validate { author, location,
 *        rating(1-5), text }, then store.addReview (status 'pending',
 *        verified:false — NOT shown until a moderator approves it).
 *
 * Style mirrors app/api/search/route.ts (NextResponse + no-store + nosniff)
 * and the zod validation in app/actions.ts / lib/forms.ts. Runs on the Node
 * runtime (lib/store → node:fs + dynamic @vercel/postgres).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { addReview, getRatingSummary, listReviews } from '@/lib/store';

const NO_STORE = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

export async function GET(): Promise<NextResponse> {
  const [summary, reviews] = await Promise.all([
    getRatingSummary(),
    listReviews(),
  ]);
  return NextResponse.json({ summary, reviews }, { headers: NO_STORE });
}

/** Same hidden honeypot field name as the quote/contact/sample forms. */
const HONEYPOT_FIELD = 'website';

const reviewSchema = z.object({
  author: z
    .string('Please enter your name.')
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be 100 characters or fewer.'),
  location: z
    .string('Please enter your location.')
    .trim()
    .min(2, 'Location must be at least 2 characters.')
    .max(120, 'Location must be 120 characters or fewer.'),
  rating: z.coerce
    .number('Please choose a rating.')
    .int('Rating must be a whole number.')
    .min(1, 'Rating must be between 1 and 5.')
    .max(5, 'Rating must be between 1 and 5.'),
  text: z
    .string('Please enter your review.')
    .trim()
    .min(10, 'Review must be at least 10 characters.')
    .max(2000, 'Review must be 2000 characters or fewer.'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400, headers: NO_STORE },
    );
  }

  // Honeypot: bots that fill the hidden field get a silent success, no write.
  const honeypot =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)[HONEYPOT_FIELD]
      : undefined;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? 'Please check the form and try again.';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    await addReview(parsed.data);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Something went wrong saving your review. Please try again.',
      },
      { status: 500, headers: NO_STORE },
    );
  }

  // Stored as status 'pending' — not shown until verified/approved.
  return NextResponse.json({ ok: true }, { status: 201, headers: NO_STORE });
}
