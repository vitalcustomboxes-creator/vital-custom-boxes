/**
 * ReviewWall — Server Component (FE-3). DESIGN_SPEC §6.13.
 *
 * Masonry wall of review cards (author, location, Rating stars, text).
 * Provenance rules (anti-fabrication, binding):
 *  - The per-card "Verified" badge renders ONLY when `verified === true` — the
 *    10 migrated testimonials in content/reviews.json are client-attested as
 *    genuine and carry verified:true, source:"migrated".
 *  - If any entry is still an unverified placeholder, a subtle attribution
 *    note renders instead of provenance badges.
 *  - The aggregate rating badge + aggregateRating JSON-LD live in the Hero /
 *    orgSchema (content/ratings.json) — NOT here.
 */
import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/ui/rating';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';

export interface ReviewWallProps {
  /** From getReviews() (the `_note` marker row is already filtered out). */
  reviews: Review[];
  /** globals.social.trustpilot — turns the attribution note into a link. */
  trustpilotUrl?: string;
  eyebrow?: string;
  title?: string;
  /** Section-owning component — className lands on the <section> (bg etc.). */
  className?: string;
}

function ReviewCard({ review }: { review: Review }) {
  const showProvenance = review.verified;
  return (
    <article className="mb-6 flex break-inside-avoid flex-col gap-3 rounded-lg border border-ink-100 bg-white p-6 shadow-e1">
      <Rating value={review.rating} size="sm" />
      <blockquote className="text-[15px] leading-relaxed text-slate-600">
        {review.text}
      </blockquote>
      <footer className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">{review.author}</p>
          <p className="text-sm text-slate-600">{review.location}</p>
        </div>
        {showProvenance && (
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="success">
              <BadgeCheck size={12} aria-hidden="true" />
              Verified
            </Badge>
          </div>
        )}
      </footer>
    </article>
  );
}

export function ReviewWall({
  reviews,
  trustpilotUrl,
  eyebrow = 'Reviews',
  title = 'What our customers say',
  className,
}: ReviewWallProps) {
  if (reviews.length === 0) return null;
  // Note only renders while some review is still an unverified placeholder.
  const hasUnverified = reviews.some((r) => !r.verified);
  const note = 'Reviews collected from customers — verification in progress.';

  return (
    <section className={cn('section bg-paper-50', className)}>
      <div className="container-hm">
        <div className="mx-auto mb-10 flex max-w-[52ch] flex-col items-center gap-3 text-center md:mb-12">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {hasUnverified && (
            <p className="text-sm text-slate-600">
              {trustpilotUrl ? (
                <a
                  href={trustpilotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-600"
                >
                  {note}
                </a>
              ) : (
                note
              )}
            </p>
          )}
        </div>

        <Reveal
          as="div"
          className="columns-1 gap-6 min-[480px]:columns-2 lg:columns-3"
        >
          {reviews.map((review, i) => (
            <ReviewCard key={`${review.author}-${i}`} review={review} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default ReviewWall;
