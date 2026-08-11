/**
 * /samples/ — sample-kit request (owner: BE-2).
 * Small lead form (name / email / shipping address) via BE-3's submitSample.
 * Like the quote page, this IS a conversion page — no CTABand at the end.
 * No "free samples" promise is made anywhere (nothing fabricated): sales
 * confirms contents and any fees by email.
 */
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { submitSample } from "@/app/actions";
import { LeadForm, type LeadFormField } from "@/components/blocks/LeadForm";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/samples"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/samples/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Samples", href: "/samples/" },
];

/** Fields match BE-3's sampleSchema (lib/forms.ts). */
const SAMPLE_FIELDS: LeadFormField[] = [
  { kind: "input", name: "name", label: "Name", required: true, autoComplete: "name" },
  {
    kind: "input",
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    kind: "textarea",
    name: "address",
    label: "Shipping address",
    required: true,
    rows: 3,
    autoComplete: "street-address",
    hint: "Where should the kit go? Street, city, state, ZIP.",
  },
  {
    kind: "input",
    name: "productInterest",
    label: "What are you packaging? (optional)",
    autoComplete: "off",
    placeholder: "e.g. candles, cosmetics, pizza",
  },
];

const KIT_CONTENTS = [
  "Stock swatches — cardstock calipers, kraft, corrugated flutes, rigid board",
  "Finish samples — matte, gloss, soft-touch, spot UV, and foil",
  "Printed example boxes from past production runs",
];

const HOW_IT_WORKS = [
  "Send the request with your shipping address.",
  "We confirm contents and any sample fees by email — typically within one business day.",
  "Your kit ships; when you're ready, your quote credits the experience, not the cost.",
];

export default function SamplesPage() {
  // globals loaded for parity/future use of contact facts on this page.
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Print quality is a thing you feel. Get stocks and finishes in hand before you commit to a production run."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-10">
            <div>
              <span className="eyebrow">In the kit</span>
              <h2 className="mt-3 max-w-[24ch]">What you’ll receive</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {KIT_CONTENTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-base text-slate-600">
                    <Check size={18} className="mt-1 shrink-0 text-terra-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="h4">How it works</h3>
              <ol className="mt-4 flex flex-col gap-3">
                {HOW_IT_WORKS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-base text-slate-600">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terra-100 font-display text-sm font-bold text-terra-600"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm text-slate-600">
                Need something specific — a certain stock, finish, or box style?
                Mention it in the form and we’ll include the closest match. Or
                call {globals.phone ? (
                  <a
                    href={globals.phoneHref}
                    className="font-semibold text-terra-600 underline underline-offset-4"
                  >
                    {globals.phone}
                  </a>
                ) : null}{" "}
                and tell us directly.
              </p>
            </div>
          </div>

          <div className="self-start rounded-lg border border-ink-100 bg-white p-6 shadow-e2 md:p-8">
            <h2 className="h3">Request your sample kit</h2>
            <p className="mb-6 mt-2 text-sm text-slate-600">
              We confirm every request by email before anything ships.
            </p>
            <LeadForm
              action={submitSample}
              fields={SAMPLE_FIELDS}
              submitLabel="Request sample kit"
              idPrefix="sample"
            />
          </div>
        </div>
      </section>
      <CTABand
        heading="Ready to price your packaging?"
        sub="Send your dimensions, stock, quantity, and artwork for a custom quote."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
