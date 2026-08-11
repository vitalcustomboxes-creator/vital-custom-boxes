/**
 * /contact/ — T5 contact page (owner: BE-2).
 * NAP comes from content/globals.json only. The street address is pending from
 * the client, so the visible line is city-level ("Los Angeles, CA") — never a
 * fake street. Form posts to BE-3's `submitContact` server action.
 */
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { submitContact } from "@/app/actions";
import { LeadForm, type LeadFormField } from "@/components/blocks/LeadForm";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/contact"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/contact/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact/" },
];

/** Fields match BE-3's contactSchema (lib/forms.ts). */
const CONTACT_FIELDS: LeadFormField[] = [
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
    kind: "phone",
    name: "phone",
    label: "Phone number (optional)",
    type: "tel",
    autoComplete: "tel",
    placeholder: "Enter phone number",
  },
  {
    kind: "input",
    name: "company",
    label: "Company name (optional)",
    autoComplete: "organization",
  },
  {
    kind: "country",
    name: "country",
    label: "Country",
    required: true,
    autoComplete: "country-name",
  },
  {
    kind: "textarea",
    name: "message",
    label: "Message",
    required: true,
    rows: 6,
    hint: "Include sizes and quantities if you have them — it speeds up your answer.",
  },
];

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  pinterest: "Pinterest",
  trustpilot: "Trustpilot",
};

export default function ContactPage() {
  const globals = getGlobals();
  // globals.address carries an inline client TODO ("street address pending") —
  // render the city-level part only; never invent a street (audit rule).
  const visibleAddress = globals.address.replace(/\s*\(TODO[^)]*\)\s*/g, "");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Questions about pricing, materials, artwork, or an order in production — a packaging specialist replies typically within one business day."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Contact details — NAP from globals.json via props (audit). */}
          <div className="flex flex-col gap-6">
            <h2 className="h3">Talk to a real person</h2>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <Phone size={20} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                <span>
                  <span className="block font-display text-sm font-semibold text-ink-900">Call us</span>
                  <a
                    href={globals.phoneHref}
                    className="mt-0.5 inline-block text-base text-slate-600 transition-colors duration-150 ease-brand hover:text-terra-600"
                  >
                    {globals.phone}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                <span>
                  <span className="block font-display text-sm font-semibold text-ink-900">Email us</span>
                  <a
                    href={`mailto:${globals.email}`}
                    className="mt-0.5 inline-block text-base text-slate-600 transition-colors duration-150 ease-brand hover:text-terra-600"
                  >
                    {globals.email}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                <span>
                  <span className="block font-display text-sm font-semibold text-ink-900">Visit us</span>
                  <span className="mt-0.5 block text-base text-slate-600">{visibleAddress}</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                <span>
                  <span className="block font-display text-sm font-semibold text-ink-900">Phone hours</span>
                  {/* TODO client: confirm business hours before launch. */}
                  <span className="mt-0.5 block text-base text-slate-600">
                    Monday–Friday, 9 am–6 pm Pacific
                  </span>
                </span>
              </li>
            </ul>

            <div>
              <h3 className="h4">Follow along</h3>
              {/* Plain text links — no hotlinked third-party badge images (audit). */}
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {Object.entries(globals.social).map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-sm font-semibold text-terra-600 transition-colors duration-150 ease-brand hover:text-terra-500"
                    >
                      {SOCIAL_LABELS[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact form — BE-3 submitContact via LeadForm (success → /thank-you/). */}
          <div className="rounded-lg border border-ink-100 bg-white p-6 shadow-e2 md:p-10">
            <h2 className="h3">Send us a message</h2>
            <p className="mb-6 mt-2 text-sm text-slate-600">
              We reply to every message — typically within one business day.
            </p>
            <LeadForm
              action={submitContact}
              fields={CONTACT_FIELDS}
              submitLabel="Send message"
              idPrefix="contact"
            />
          </div>
        </div>
      </section>

      <section className="section-compact bg-kraft-100">
        <div className="container-hm">
          {/* TODO client: supply a Google Maps embed (or static map) for the LA
              facility once the street address is confirmed — replace this
              placeholder block. No third-party embed is hotlinked until then. */}
          <div
            className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-400 bg-paper-50 p-8 text-center"
            role="img"
            aria-label="Map of our Indianapolis location coming soon"
          >
            <MapPin size={28} className="text-slate-600" aria-hidden="true" />
            <p className="font-display text-base font-semibold text-ink-700">
              Map coming soon
            </p>
            <p className="text-sm text-slate-600">{visibleAddress}</p>
          </div>
        </div>
      </section>

      <CTABand
        heading="Know your specs already?"
        sub="Skip the back-and-forth — send sizes, stock, and quantity through the quote form and get pricing fast."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
