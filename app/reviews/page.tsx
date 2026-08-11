/**
 * /reviews/ — social-proof page (owner: BE-2).
 * ReviewWall renders content/reviews.json (placeholder entries are flagged
 * source:"placeholder", verified:false, with a visible note — audit: no
 * fabricated testimonials, NO aggregate-rating schema). Trustpilot CTA links
 * to the real profile from globals.json.
 */
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { ReviewWall } from "@/components/patterns/ReviewWall";
import { getGlobals, getReviews } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/reviews"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/reviews/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Reviews", href: "/reviews/" },
];

export default function ReviewsPage() {
  const globals = getGlobals();
  const reviews = getReviews();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="What brands say about working with us — print quality, proofing, and delivery, in their words."
        crumbs={CRUMBS}
      />

      {/* No aggregateRating JSON-LD here by design (placeholder data — audit).
          QA-AUTO 2026-06-12 (ISSUES, MANUAL_QA F-01): ReviewWall is
          section-owning — rendered bare (the extra .section wrapper doubled
          vertical padding), and trustpilotUrl now links the verification note. */}
      <ReviewWall reviews={reviews} trustpilotUrl={globals.social.trustpilot} />

      <section className="section-compact bg-kraft-100">
        <div className="container-hm flex flex-col items-center gap-4 text-center">
          <h2 className="max-w-[24ch]">Read independent reviews</h2>
          <p className="max-w-[48ch] text-slate-600">
            We collect verified customer reviews on Trustpilot — see the latest
            there, or leave one of your own after your order arrives.
          </p>
          <a
            href={globals.social.trustpilot}
            rel="noopener noreferrer"
            target="_blank"
            className="press inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-ink-700 bg-transparent px-6 font-display text-base font-semibold text-ink-700 transition-colors duration-200 ease-brand hover:bg-ink-700 hover:text-white"
          >
            Vital Custom Boxes on Trustpilot
            <ExternalLink size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <CTABand
        heading="Earn your own five stars"
        sub="Start with a free quote — design support and free US shipping included."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
