/**
 * /terms-conditions/ — Terms & Conditions (owner: BE-2).
 *
 * TODO legal review: this is a SHORT rewrite for launch consistency — counsel
 * must review quote validity, liability cap, and defect-window numbers before
 * go-live (same flags on the other policy pages).
 *
 * Audit fixes baked in: the live food-grade CONTRADICTION is gone — these
 * terms state that food-safe material options are AVAILABLE ON REQUEST
 * (consistent with category/product claims) instead of disclaiming food
 * safety sitewide. All SLA/MOQ/shipping figures come from globals.json, and
 * the regulated-products clause renders globals.complianceDisclaimer verbatim.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/terms-conditions"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/terms-conditions/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Terms & Conditions", href: "/terms-conditions/" },
];

export default function TermsConditionsPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="The short version of how ordering custom packaging from us works — quotes, proofs, production, and delivery."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="flex max-w-[65ch] flex-col gap-8 text-slate-600">
            <p className="text-sm">Last reviewed: June 12, 2026</p>

            <div>
              <h2 className="h3">1. The agreement</h2>
              <p className="mt-3">
                By requesting a quote or placing an order with Vital Custom
                Boxes you agree to these terms. They apply to every order
                unless we agree otherwise in writing.
              </p>
            </div>

            <div>
              <h2 className="h3">2. Quotes &amp; pricing</h2>
              <p className="mt-3">
                All pricing is quote-based and confirmed in writing before
                production. Quotes reflect the specifications you provide; if
                size, stock, quantity, or finishing changes, the quote is
                re-issued. Quoted prices include free US shipping — see the{" "}
                <Link href="/shipping-policy/" className="font-semibold text-terra-600 underline underline-offset-4">
                  Shipping Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="h3">3. Artwork &amp; proofs</h2>
              <p className="mt-3">
                You confirm you have the rights to any artwork, logos, and text
                you supply. Our team prepares a digital proof for every order,
                and nothing goes to press until you approve it. Minor color
                variation between screen proofs and printed stock is a normal
                part of print production.
              </p>
            </div>

            <div>
              <h2 className="h3">4. Production, minimums &amp; delivery</h2>
              <p className="mt-3">
                Standard production is {globals.sla.toLowerCase()}, counted from
                proof approval. Run size is confirmed on your written quote.{" "}
                {globals.shipping}.
              </p>
            </div>

            <div>
              <h2 className="h3">5. Custom-made goods</h2>
              <p className="mt-3">
                Every product is manufactured to order against your approved
                proof and cannot be restocked or resold. Reprints and refunds
                for defects are covered in the{" "}
                <Link href="/return-policy/" className="font-semibold text-terra-600 underline underline-offset-4">
                  Return Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="h3">6. Food-contact packaging</h2>
              <p className="mt-3">
                Food-safe material options are available on request for
                packaging that comes into direct contact with food. Tell us
                about food contact when you request your quote so we specify an
                appropriate stock; final regulatory compliance of the packaged
                food product, including any required labeling, remains your
                responsibility.
              </p>
            </div>

            <div>
              <h2 className="h3">7. Regulated products</h2>
              <p className="mt-3">{globals.complianceDisclaimer}</p>
            </div>

            <div>
              <h2 className="h3">8. Liability</h2>
              <p className="mt-3">
                Our responsibility for any order is limited to the amount you
                paid for that order. We are not liable for indirect or
                consequential losses, or for delays caused by carriers or events
                outside our reasonable control.
              </p>
            </div>

            <div>
              <h2 className="h3">9. Questions</h2>
              <p className="mt-3">
                Email{" "}
                <a href={`mailto:${globals.email}`} className="font-semibold text-terra-600 underline underline-offset-4">
                  {globals.email}
                </a>{" "}
                or call{" "}
                <a href={globals.phoneHref} className="font-semibold text-terra-600 underline underline-offset-4">
                  {globals.phone}
                </a>{" "}
                — we’d rather clarify before you order than argue after.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        heading="Clear terms, clear quote"
        sub="Get exact pricing for your specs — no surprises at checkout, because there is no checkout."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
