import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import {
  breadcrumbSchema,
  buildMetadata,
  JsonLd,
  STATIC_PAGE_META,
} from "@/lib/seo";

const META = STATIC_PAGE_META["/about-us"];

export const metadata: Metadata = buildMetadata({
  ...META,
  path: "/about-us/",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us/" },
];

const VALUES = [
  {
    title: "Design support",
    body: "Get help preparing your packaging artwork and review a digital proof before printing begins.",
  },
  {
    title: "Runs that fit your business",
    body: "Tell us the quantity you need. We confirm the available minimum and pricing in your quote.",
  },
  {
    title: "Clear order details",
    body: "Review your packaging specifications, pricing, production timeline, and shipping terms before approving your order.",
  },
  {
    title: "Materials for your product",
    body: "Explore stock and finish options based on your product, presentation, and shipping needs.",
  },
];

const LINKS = [
  {
    name: "How ordering works, step by step",
    href: "/how-it-works/",
  },
  {
    name: "Explore our portfolio",
    href: "/portfolio/",
  },
  {
    name: "Materials and finish guide",
    href: "/materials/",
  },
  {
    name: "Our approach to sustainable packaging",
    href: "/sustainability/",
  },
];

export default function AboutUsPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          CRUMBS.map((crumb) => ({
            name: crumb.name,
            path: crumb.href,
          })),
        )}
      />

      <PageHero
        title={META.h1}
        lead="Founded in 2025, Vital Custom Boxes helps food, beauty, retail, and e-commerce brands create custom packaging."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Who we are</span>
            <h2 className="mt-3 max-w-[24ch]">
              Packaging built around your product
            </h2>
          </div>

          <div className="flex max-w-[65ch] flex-col gap-4 text-slate-600">
            <p>
              Founded in 2025, Vital Custom Boxes provides custom
              packaging for brands across the United States. We help
              businesses create boxes and bags tailored to their product
              size, materials, and artwork, with free design support and
              a digital proof before printing.
            </p>

            <p>
              Our mission is to make ordering custom packaging clearer:
              help you explore suitable options, explain the
              specifications, and confirm the details before production.
            </p>

            <p>
              {globals.sla}. Your run size and order requirements are
              confirmed with your quote. {globals.shipping}.
            </p>

            <div className="mt-2 rounded-lg border border-ink-100 bg-white p-5">
              <h3 className="h4 text-ink-900">Business details</h3>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-ink-900">
                    Business name
                  </dt>
                  <dd>Vital Custom Boxes</dd>
                </div>

                <div>
                  <dt className="font-semibold text-ink-900">
                    Established
                  </dt>
                  <dd>2025</dd>
                </div>

                <div>
                  <dt className="font-semibold text-ink-900">
                    Business address
                  </dt>
                  <dd className="whitespace-normal">
                    {globals.address}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-ink-900">
                    Phone
                  </dt>
                  <dd>
                    <a
                      href={globals.phoneHref}
                      className="underline underline-offset-4"
                    >
                      {globals.phone}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-ink-900">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${globals.email}`}
                      className="break-words underline underline-offset-4"
                    >
                      {globals.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">How we work</span>
            <h2>What you can expect</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="flex h-full flex-col gap-3 rounded-lg border border-ink-100 bg-white p-6 shadow-e1"
              >
                <Check
                  size={20}
                  className="text-terra-600"
                  aria-hidden="true"
                />
                <h3 className="h4">{value.title}</h3>
                <p className="text-sm text-slate-600">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Where to next</span>
            <h2 className="max-w-[24ch]">
              Explore your packaging options
            </h2>
            <p className="mt-3 max-w-[52ch] text-slate-600">
              Learn about the ordering process, compare materials,
              and explore packaging ideas for your next order.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {LINKS.map((link) => (
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
        sub={`Free design support. ${globals.shipping}.`}
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}