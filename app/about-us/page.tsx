/**
 * /about-us/ — company page (owner: BE-2).
 * E-E-A-T trust page. No fabricated history, team names, or stats — qualitative
 * copy only; all SLA/MOQ/shipping facts come from content/globals.json.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/about-us"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/about-us/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us/" },
];

const VALUES = [
  {
    title: "Design help is part of the job",
    body: "Dielines, artwork setup, and print-ready file checks are included with every order — you approve a digital proof before anything goes to press.",
  },
  {
    title: "Small runs welcome",
    body: "You should not need a warehouse to look professional. Low minimums let new brands test packaging the same way big brands ship it.",
  },
  {
    title: "One promise, kept everywhere",
    body: "The turnaround, minimum, and shipping terms you see anywhere on this site are the same ones on your quote — no surprise fine print.",
  },
  {
    title: "Honest materials",
    body: "We tell you what a stock is good at and what it is not, including recyclable kraft and food-safe options on request, so you choose with open eyes.",
  },
];

export default function AboutUsPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="An Indianapolis-based custom box maker helping food, beauty, retail, and e-commerce brands turn packaging into part of the product."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Who we are</span>
            <h2 className="mt-3 max-w-[24ch]">Packaging people, not a print portal</h2>
          </div>
          <div className="flex max-w-[65ch] flex-col gap-4 text-slate-600">
            <p>
              Vital Custom Boxes designs and produces custom boxes, bags, and
              business print for brands across the United States. From food-safe
              bakery cartons to magnetic-lid rigid boxes, every order is made to
              your exact size, stock, and artwork — there is no off-the-shelf
              inventory here.
            </p>
            <p>
              Behind every quote is a real team: structural designers who turn a
              product into a dieline, prepress specialists who make artwork
              print-ready, and account managers who answer the phone. You talk
              to people, not ticket queues.
            </p>
            <p>
              We keep the promise simple: {globals.sla.toLowerCase()},
              run sizes confirmed with your quote, and free design support on
              every job.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">How we work</span>
            <h2>What you can hold us to</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="flex h-full flex-col gap-3 rounded-lg border border-ink-100 bg-white p-6 shadow-e1"
              >
                <Check size={20} className="text-terra-600" aria-hidden="true" />
                <h3 className="h4">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Where to next</span>
            <h2 className="max-w-[24ch]">See the work, then put us to work</h2>
            <p className="mt-3 max-w-[52ch] text-slate-600">
              The fastest way to judge a packaging partner is to look at the
              process and the projects.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {[
              { name: "How ordering works, step by step", href: "/how-it-works/" },
              { name: "Recent projects in our portfolio", href: "/portfolio/" },
              { name: "Materials and finish guide", href: "/materials/" },
              { name: "Our approach to sustainable packaging", href: "/sustainability/" },
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

      <CTABand
        heading="Let's build your box"
        sub="Free design support and free US shipping on every order."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
