/**
 * /return-policy/ — Return Policy (owner: BE-2).
 * TODO legal review: the 7-business-day reporting window and remedy wording
 * need counsel sign-off before launch. Consistent with Terms §5 (custom goods)
 * — no generic returns on made-to-order product, clear defect remedy instead.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/return-policy"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/return-policy/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Return Policy", href: "/return-policy/" },
];

export default function ReturnPolicyPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Custom-printed products can't be restocked — so here is exactly what we do when something isn't right."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="flex max-w-[65ch] flex-col gap-8 text-slate-600">
            <p className="text-sm">Last reviewed: June 12, 2026</p>

            <div>
              <h2 className="h3">Made to order means no general returns</h2>
              <p className="mt-3">
                Every box is produced specifically for you, against a proof you
                approved — it cannot be resold, so we cannot accept returns for
                change of mind. That is exactly why proofs exist: nothing prints
                until you sign off.
              </p>
            </div>

            <div>
              <h2 className="h3">If we made a mistake, we fix it</h2>
              <p className="mt-3">
                If your delivered order is defective or does not match your
                approved proof — wrong size, wrong stock, print errors, finishing
                faults — report it within 7 business days of delivery. After we
                verify the issue, we will reprint the affected quantity or refund
                it. That choice is made with you, not for you.
              </p>
            </div>

            <div>
              <h2 className="h3">Damaged in transit</h2>
              <p className="mt-3">
                Photograph the carton and contents before unpacking further and
                report it within the same 7-business-day window — we handle the
                carrier claim so you don’t have to.
              </p>
            </div>

            <div>
              <h2 className="h3">How to report an issue</h2>
              <p className="mt-3">
                Email{" "}
                <a href={`mailto:${globals.email}`} className="font-semibold text-terra-600 underline underline-offset-4">
                  {globals.email}
                </a>{" "}
                with your order number, a short description, and photos of the
                issue (including a few of the affected boxes). We respond
                typically within one business day with next steps.
              </p>
            </div>

            <div>
              <h2 className="h3">What this policy does not change</h2>
              <p className="mt-3">
                Color shifts within normal print tolerance, or specs you
                approved on the proof, are not defects. When in doubt, order a
                sample kit first — seeing the stock in hand prevents most
                surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        heading="Approve it before we print it"
        sub="Every order includes a free digital proof — the best return policy is not needing one."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
