/**
 * /faqs/ — sitewide FAQ page (owner: BE-2).
 * Renders ALL of content/faqs.json in ONE FAQAccordion block (audit rule:
 * exactly one FAQ block per page), ordered by topic. FAQPage JSON-LD is
 * emitted here from the same items via lib/seo (DESIGN_SPEC §6.14).
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { FAQAccordion } from "@/components/patterns/FAQAccordion";
import { getFaqs, getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/faqs"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/faqs/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "FAQs", href: "/faqs/" },
];

/** Topic order for the single FAQ block: ordering → design → materials → delivery. */
const TOPIC_ORDER = [
  "quote-process",
  "moq",
  "design-support",
  "file-formats",
  "prototype",
  "materials",
  "turnaround",
  "free-shipping",
];

export default function FaqsPage() {
  const globals = getGlobals();
  const faqs = [...getFaqs()].sort(
    (a, b) =>
      TOPIC_ORDER.indexOf(a.slug ?? "") - TOPIC_ORDER.indexOf(b.slug ?? ""),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      {/* FAQPage schema — emitted once, from the exact items rendered below. */}
      <JsonLd data={faqSchema(faqs)} />

      <PageHero
        title={META.h1}
        lead="Quotes, minimums, artwork files, materials, and delivery — the answers we give on the phone every day, written down."
        crumbs={CRUMBS}
      />

      {/* FAQAccordion owns its section+container (FE-3, DESIGN_SPEC §6.14) —
          rendered bare to avoid double section padding. */}
      <FAQAccordion
        faqs={faqs}
        eyebrow="FAQs"
        title="Everything you need to know before you order"
        className="bg-paper-50"
      />

      <CTABand
        heading="Still have a question?"
        sub="Get a free quote with your exact specs, or call us — a packaging specialist replies typically within one business day."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
