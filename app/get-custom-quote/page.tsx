/**
 * /get-custom-quote/ — T4 two-step quote page (owner: BE-2).
 * Layout per docs/DESIGN_SPEC.md §2 (T4) + §6.9: interior hero (compact) →
 * QuoteForm + trust sidebar → footer. No CTABand and no StickyMobileCTA on
 * this route — the page IS the CTA (FE-2 hides the sticky bar here).
 *
 * `?product=<slug>` (ProductCard "Get a Quote" links) is resolved on the
 * CLIENT, in QuoteFormWithParamPrefill, into QuoteForm's `defaultProduct` per
 * FE-3's contract. Reading `searchParams` here instead would mark the route
 * dynamic and force a full SSR render of an otherwise entirely static page on
 * every visit — it was the top CPU consumer on Vercel. The prefill is a
 * convenience, so trading it for a prerendered page is the right side of that
 * deal; see the component for how the late-arriving product is applied.
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import { submitQuote } from "@/app/actions";
import { PageHero } from "@/components/blocks/PageHero";
import { QuoteFormWithParamPrefill } from "@/components/patterns/QuoteFormWithParamPrefill";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/get-custom-quote"];

export const metadata: Metadata = buildMetadata({
  ...META,
  path: "/get-custom-quote/",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Get a Custom Quote", href: "/get-custom-quote/" },
];

const NEXT_STEPS = [
  "We review your specs and reply with pricing — typically within one business day.",
  "Approve your free digital proof (we help with dielines and artwork).",
  "Production starts, and your boxes ship free anywhere in the US.",
];

/**
 * Reserves the form's slot until `useSearchParams()` resolves on the client.
 * Sized to the rendered form so the prerendered shell does not shift.
 */
function QuoteFormFallback() {
  return (
    <div
      className="min-h-[42rem] rounded-lg border border-ink-100 bg-white shadow-e1"
      aria-hidden="true"
    />
  );
}

export default function GetCustomQuotePage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Tell us what you're packing and how many you need — we'll come back with pricing, a free design proof, and a production date."
        crumbs={CRUMBS}
      />

      <section className="bg-paper-50">
        <div className="container-hm section grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Form card chrome lives inside QuoteForm (FE-3, DESIGN_SPEC §6.9).
              useSearchParams() suspends during prerender, so the boundary is
              required for this route to build as static. */}
          <Suspense fallback={<QuoteFormFallback />}>
            <QuoteFormWithParamPrefill action={submitQuote} moq={globals.moq} />
          </Suspense>

          {/* Trust sidebar — facts from content/globals.json only (audit). */}
          <aside className="hidden flex-col gap-6 lg:flex" aria-label="Why order with us">
            <div className="rounded-lg bg-kraft-100 p-6">
              <h2 className="h4">What every order includes</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {[globals.sla, `MOQ ${globals.moq}`, globals.shipping].map((fact) => (
                  <li key={fact} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={16} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                    {fact}
                  </li>
                ))}
              </ul>
              <hr className="my-5 border-ink-100" />
              <p className="font-display text-sm font-semibold text-ink-900">Prefer to talk?</p>
              <a
                href={globals.phoneHref}
                className="press mt-3 inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-ink-700 bg-transparent px-6 font-display text-base font-semibold text-ink-700 transition-colors duration-200 ease-brand hover:bg-ink-700 hover:text-white"
              >
                <Phone size={18} aria-hidden="true" />
                {globals.phone}
              </a>
            </div>

            <div>
              <h2 className="h4">What happens next</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-slate-600">
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
            </div>

            <Link
              href="/samples/"
              className="group flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-e1 transition-colors duration-200 ease-brand hover:border-slate-400"
            >
              <span>
                <span className="block font-display text-sm font-semibold text-ink-900">
                  Want to feel the quality first?
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  Request a sample kit before you commit.
                </span>
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-terra-600 transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </aside>
        </div>

        {/* Mobile fallback for the lg-only sidebar: keep the phone reachable
            (StickyMobileCTA is hidden on this route per DESIGN_SPEC §6.10). */}
        <div className="container-hm pb-12 lg:hidden">
          <p className="text-sm text-slate-600">
            Prefer to talk?{" "}
            <a href={globals.phoneHref} className="font-semibold text-terra-600 underline underline-offset-4">
              Call {globals.phone}
            </a>{" "}
            or{" "}
            <Link href="/samples/" className="font-semibold text-terra-600 underline underline-offset-4">
              request a sample kit
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
