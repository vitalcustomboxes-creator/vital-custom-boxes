/**
 * /sustainability/ — eco approach (owner: BE-2).
 * ONLY real, defensible claims (recyclable kraft, soy-based ink options,
 * biodegradable options, made-to-order = no overstock). NO certifications,
 * NO percentages, NO offset claims — nothing we cannot substantiate (audit).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Leaf, PackageOpen, Recycle, Sprout } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/sustainability"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/sustainability/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Sustainability", href: "/sustainability/" },
];

const PILLARS = [
  {
    icon: Recycle,
    title: "Recyclable kraft & paper stocks",
    body: "Uncoated kraft and paper-based boards go straight into curbside paper recycling. When you want the lowest-friction end of life, we'll steer you to uncoated, unlaminated constructions.",
  },
  {
    icon: Leaf,
    title: "Soy-based ink options",
    body: "Soy-based inks are available on request as an alternative to conventional petroleum-based inks — ask for them in your quote and we'll confirm availability for your stock and color set.",
  },
  {
    icon: Sprout,
    title: "Biodegradable & recycled-content options",
    body: "Recycled-content versions of most stocks and biodegradable options are available for many box styles. Tell us your target and we'll match the closest construction — honestly, including trade-offs.",
  },
  {
    icon: PackageOpen,
    title: "Made to order, not to landfill",
    body: "Everything we produce is made to order in your exact quantity — no speculative stock to pulp later. Right-sized boxes also cut void fill and wasted freight space.",
  },
];

export default function SustainabilityPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Less material, cleaner stocks, no overproduction — practical sustainability without the greenwash."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">What we actually do</span>
            <h2 className="max-w-[26ch]">Four honest levers</h2>
            <p className="lead max-w-[60ch] text-slate-600">
              We won’t print a leaf on your box and call it green. These are the
              concrete options we offer — and we’ll tell you the trade-offs of
              each when you ask for a quote.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex h-full flex-col gap-3 rounded-lg border border-ink-100 bg-white p-6 shadow-e1"
                >
                  <Icon size={22} className="text-terra-600" aria-hidden="true" />
                  <h3 className="h4">{pillar.title}</h3>
                  <p className="text-sm text-slate-600">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Kraft, up close</span>
            <h2 className="max-w-[24ch]">The workhorse of low-impact packaging</h2>
            <div className="mt-4 flex max-w-[65ch] flex-col gap-4 text-slate-600">
              <p>
                Kraft board is our most-requested eco option for a reason: it is
                made from wood fiber, carries recycled content, recycles
                curbside, and its unbleached look tells your sustainability
                story without a word of copy.
              </p>
              <p>
                It takes one- and two-color printing beautifully, holds up in
                shipping, and works across bakery boxes, candle boxes, carrier
                bags, and mailers. If you want the greenest version, keep it
                uncoated — lamination looks premium but complicates recycling,
                and we will tell you so.
              </p>
            </div>
          </div>
          <ul className="flex flex-col gap-3 self-center">
            {[
              { name: "Kraft & paper carrier bags", href: "/custom-printed-bags/" },
              { name: "Corrugated mailer boxes", href: "/custom-mailer-boxes/" },
              { name: "Kraft stocks in the materials guide", href: "/materials/" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-e1 transition-colors duration-200 ease-brand hover:border-slate-400"
                >
                  <span className="font-display text-base font-semibold text-ink-900">
                    {link.name}
                  </span>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-terra-600 transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-compact bg-paper-50">
        <div className="container-hm">
          <p className="max-w-[65ch] text-sm text-slate-600">
            A note on claims: we describe materials by what they are (recyclable,
            recycled-content, biodegradable options) rather than by badges. If
            your retailer or market requires specific certifications, tell us in
            your quote and we will confirm in writing exactly what your chosen
            stock can and cannot claim.
          </p>
        </div>
      </section>

      <CTABand
        heading="Make the greener box"
        sub="Ask for kraft, recycled content, or soy-based inks in your quote — we'll spec it straight."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
