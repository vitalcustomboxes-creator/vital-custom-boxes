/**
 * /how-it-works/ — process page (owner: BE-2).
 *
 * Full SIX-step process rail (brief requirement). FE-3's <ProcessSteps> is the
 * canonical 4-step component and takes no custom steps, so this page renders
 * the 6-step variant with the exact DESIGN_SPEC §6.12 recipe (number chips,
 * "Step N" overlines, connector hairline, <Reveal stagger>). The production
 * SLA appears exactly ONCE on this page (step 4, verbatim from globals.json).
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Factory,
  MessageSquareText,
  PackageCheck,
  PenTool,
  SearchCheck,
  Truck,
} from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { Reveal } from "@/components/ui";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/how-it-works"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/how-it-works/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "How It Works", href: "/how-it-works/" },
];

const CHECKLIST = [
  "What you're packing (product, weight, fragility)",
  "Rough dimensions — or send the product and we'll measure",
  "Quantity you'd like quoted (multiple tiers are fine)",
  "Logo or artwork files if you have them — not required to start",
];

export default function HowItWorksPage() {
  const globals = getGlobals();

  // 6 steps; the SLA renders once (step 4, verbatim from globals.json).
  const steps = [
    {
      icon: MessageSquareText,
      title: "Get a quote",
      body: "Send your size, stock, and quantity through the quote form — pricing lands in your inbox, typically within one business day.",
    },
    {
      icon: PenTool,
      title: "Free design support",
      body: "Our team builds the dieline and sets up your artwork at no extra cost. No designer? We'll work from your logo and brand colors.",
    },
    {
      icon: PackageCheck,
      title: "Approve your proof",
      body: "You sign off on a digital 3D proof showing exactly how the finished box prints, folds, and reads. Nothing runs until you approve.",
    },
    {
      icon: Factory,
      title: "Production",
      body: `Your order goes to press: ${globals.sla}.`,
    },
    {
      icon: SearchCheck,
      title: "Quality check",
      body: "Print, cutting, and finishing are inspected against your approved proof before anything is packed for dispatch.",
    },
    {
      icon: Truck,
      title: "Delivery",
      body: `${globals.shipping} — flat-packed to save storage space, with tracking shared as soon as your boxes leave the floor.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="From first quote to boxes at your door — six steps, one point of contact, and a proof you approve before anything prints."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">The process</span>
            <h2>Six steps from idea to inventory</h2>
          </div>
          {/* 6-step rail — §6.12 recipe (stagger child = list item, content nested). */}
          <Reveal as="ol" stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <div className="relative flex flex-col items-start gap-3">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-terra-100 font-display text-lg font-bold text-terra-600"
                      >
                        {i + 1}
                      </span>
                      <Icon size={22} className="text-terra-600" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                      Step {i + 1}
                    </span>
                    <h3 className="h4">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Before you start</span>
            <h2 className="max-w-[22ch]">All you need is the product</h2>
            <p className="mt-3 max-w-[52ch] text-slate-600">
              You don’t need print-ready files or exact specs to get a quote —
              that’s what the design support is for. Helpful to have on hand:
            </p>
          </div>
          <ul className="flex flex-col gap-3 self-center">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2 text-base text-slate-600">
                <Check size={18} className="mt-1 shrink-0 text-terra-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-compact bg-paper-50">
        <div className="container-hm">
          <p className="max-w-[65ch] text-slate-600">
            Want the detail first? Read the{" "}
            <Link href="/materials/" className="font-semibold text-terra-600 underline underline-offset-4">
              materials guide
            </Link>
            , browse{" "}
            <Link href="/box-styles/" className="font-semibold text-terra-600 underline underline-offset-4">
              box styles
            </Link>
            , or{" "}
            <Link href="/samples/" className="font-semibold text-terra-600 underline underline-offset-4">
              request a sample kit
            </Link>{" "}
            to feel the stocks before you order.
          </p>
        </div>
      </section>

      <CTABand
        heading="Ready for step one?"
        sub="Your quote is free, fast, and comes with design support included."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
