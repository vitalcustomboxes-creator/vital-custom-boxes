/**
 * /portfolio/ — case-study showcase (owner: BE-2).
 * CANONICAL page of the /portfolio ↔ /case-studies pair (TECH_SEO §2.5 — the
 * live /portfolio/ URL holds the equity). /case-studies/ renders the same
 * content and canonicalizes here; only THIS route is in sitemap.ts.
 */
import type { Metadata } from "next";
import { CaseStudyShowcase } from "@/components/blocks/CaseStudyShowcase";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getCaseStudies, getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/portfolio"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/portfolio/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Portfolio", href: "/portfolio/" },
];

export default function PortfolioPage() {
  const globals = getGlobals();
  const studies = getCaseStudies();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Recent custom box and bag projects — what the brand needed, what we built, and how it turned out."
        crumbs={CRUMBS}
      />

      <CaseStudyShowcase studies={studies} />

      <CTABand
        heading="Your product belongs here"
        sub="Start with a free quote — design support, free design support, and free US shipping included."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
