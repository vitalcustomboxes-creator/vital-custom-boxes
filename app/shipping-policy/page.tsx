/**
 * /shipping-policy/ — Shipping Policy (owner: BE-2).
 * TODO legal review: address-change window and freight wording need counsel
 * sign-off. All timeline/shipping claims come from globals.json — the live
 * site's contradictory variants ("free worldwide over $100", "3–7 days",
 * "4–8 days") are intentionally NOT migrated (ISSUES, SEO-2).
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/shipping-policy"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/shipping-policy/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Shipping Policy", href: "/shipping-policy/" },
];

export default function ShippingPolicyPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="What happens between proof approval and the boxes landing at your door."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="flex max-w-[65ch] flex-col gap-8 text-slate-600">
            <p className="text-sm">Last reviewed: June 12, 2026</p>

            <div>
              <h2 className="h3">US shipping is free</h2>
              <p className="mt-3">
                {globals.shipping} — the price on your quote is the price you
                pay, delivery included. There are no order-value thresholds and
                no shipping surcharges within the United States.
              </p>
            </div>

            <div>
              <h2 className="h3">Timeline</h2>
              <p className="mt-3">
                Standard turnaround is {globals.sla.toLowerCase()}, counted from
                the moment you approve your digital proof. If you have a hard
                deadline, tell us in your quote request — we confirm the
                schedule before production starts rather than promising after.
              </p>
            </div>

            <div>
              <h2 className="h3">Tracking &amp; delivery</h2>
              <p className="mt-3">
                Every order ships with tracking, shared by email as soon as it
                leaves production. Most orders ship flat-packed in cartons;
                large-volume orders may ship palletized, in which case we
                coordinate the freight delivery window with you.
              </p>
            </div>

            <div>
              <h2 className="h3">Address changes</h2>
              <p className="mt-3">
                Need to redirect an order? Contact us as early as possible —
                changes are free before dispatch; after dispatch we will work
                with the carrier, but rerouting cannot be guaranteed.
              </p>
            </div>

            <div>
              <h2 className="h3">Outside the US</h2>
              <p className="mt-3">
                We focus on US delivery. Shipping outside the United States is
                quoted case by case — mention your destination in the quote form
                and we will confirm cost and timeline in writing.
              </p>
            </div>

            <div>
              <h2 className="h3">Problems with a delivery</h2>
              <p className="mt-3">
                If a shipment arrives damaged or short, email{" "}
                <a href={`mailto:${globals.email}`} className="font-semibold text-terra-600 underline underline-offset-4">
                  {globals.email}
                </a>{" "}
                with your order number and photos — the Return Policy explains
                how reprints and refunds work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        heading="Delivery included, always"
        sub="Get a quote and the number you see is the number you pay — shipping is on us."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
