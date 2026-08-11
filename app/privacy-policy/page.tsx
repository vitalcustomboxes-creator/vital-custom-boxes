/**
 * /privacy-policy/ — Privacy Policy (owner: BE-2).
 * TODO legal review: counsel must confirm jurisdictional requirements
 * (CCPA/GDPR applicability) before launch; update the analytics paragraph if
 * DEVOPS adds any tracking. The legacy WP URL /?page_id=3 308s here
 * (middleware.ts, SEO-1).
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/privacy-policy"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/privacy-policy/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Privacy Policy", href: "/privacy-policy/" },
];

export default function PrivacyPolicyPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="What we collect when you use this site, why we collect it, and how to reach us about it."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="flex max-w-[65ch] flex-col gap-8 text-slate-600">
            <p className="text-sm">Last reviewed: June 12, 2026</p>

            <div>
              <h2 className="h3">What we collect</h2>
              <p className="mt-3">
                When you request a quote, contact us, or order a sample kit we
                collect what you type into the form: your name, email address,
                and message, plus — where you provide them — phone number,
                company, shipping address, order specifications, and artwork
                files.
              </p>
            </div>

            <div>
              <h2 className="h3">How we use it</h2>
              <p className="mt-3">
                To answer your request, prepare quotes and proofs, produce and
                ship your order, and follow up about it. We do not sell your
                personal information, and we do not add you to marketing lists
                you didn’t ask for.
              </p>
            </div>

            <div>
              <h2 className="h3">Who we share it with</h2>
              <p className="mt-3">
                Only what is needed to fulfil your order: production partners
                receive artwork and specifications; shipping carriers receive
                the delivery name and address. We never share your information
                for third-party marketing.
              </p>
            </div>

            <div>
              <h2 className="h3">Cookies &amp; analytics</h2>
              <p className="mt-3">
                This site uses only what it needs to function — there are no
                third-party advertising trackers. If we add privacy-respecting
                analytics in the future, this policy will be updated first.
              </p>
            </div>

            <div>
              <h2 className="h3">Your choices</h2>
              <p className="mt-3">
                Want a copy of the information we hold about you, a correction,
                or deletion? Email{" "}
                <a href={`mailto:${globals.email}`} className="font-semibold text-terra-600 underline underline-offset-4">
                  {globals.email}
                </a>{" "}
                and we will action it. We keep lead and order records only as
                long as needed for orders, warranty, and legal obligations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        heading="Questions answered, data respected"
        sub="Request a quote knowing exactly what happens with your details."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
