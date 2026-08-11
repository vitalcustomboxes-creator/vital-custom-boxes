/**
 * /thank-you/ — conversion confirmation (owner: BE-2).
 *
 * NOINDEX (ISSUES #5 / TECH_SEO §2.6 + §4): `noIndex: true` emits
 * robots noindex,nofollow meta; the route is also EXCLUDED from app/sitemap.ts
 * and disallowed in app/robots.ts (belt and braces — the live WP sitemap
 * wrongly included it; we do not copy that). No CTABand and no breadcrumbs:
 * this is a terminal utility page reached after QuoteForm/LeadForm success.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MailCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui";
import { getGlobals } from "@/lib/content";
import { buildMetadata, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/thank-you"];

export const metadata: Metadata = buildMetadata({
  ...META,
  path: "/thank-you/",
  noIndex: true,
});

export default function ThankYouPage() {
  const globals = getGlobals();

  return (
    <section className="relative overflow-hidden bg-paper-50 py-14 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-kraft-100 to-transparent"
      />
      <div className="container-hm relative">
        <div className="mx-auto max-w-[1080px] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-e2">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12 sm:py-16 lg:items-start lg:px-16 lg:py-20 lg:text-left">
              <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-2xl bg-terra-100 text-terra-600 sm:h-28 sm:w-28">
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-terra-500 ring-4 ring-white"
                />
                <MailCheck className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.7} aria-hidden="true" />
              </div>

              <p className="eyebrow mb-3">Submission received</p>
              <h1 className="max-w-[15ch] text-ink-900">
                Thank you — your request is in.
              </h1>
              <p className="lead mt-5 max-w-[54ch] text-slate-600">
                A Vital packaging specialist will review your details and get
                back to you within one business day.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button href="/shop/" variant="primary" size="lg">
                  Browse packaging
                </Button>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-ink-200 px-6 font-display text-sm font-semibold text-ink-700 transition hover:border-ink-700 hover:bg-ink-50"
                >
                  Return home <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <aside className="flex flex-col justify-center bg-ink-700 px-6 py-10 text-white sm:px-12 lg:px-14 lg:py-16">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-terra-400">
                Need help sooner?
              </p>
              <h2 className="mt-3 text-2xl text-white sm:text-3xl">
                Talk to our packaging team
              </h2>
              <p className="mt-3 max-w-[38ch] text-sm leading-6 text-ink-100 sm:text-base">
                Have an urgent deadline or need to add a detail? Reach us
                directly and mention the request you just submitted.
              </p>

              <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                <a
                  href={globals.phoneHref}
                  className="group flex min-h-20 items-center gap-4 border-b border-white/15 px-5 py-4 transition hover:bg-white/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra-500 text-ink-900">
                    <Phone size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-ink-100">Call us</span>
                    <span className="mt-0.5 block font-display text-base font-semibold text-white sm:text-lg">
                      {globals.phone}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${globals.email}`}
                  className="group flex min-h-20 items-center gap-4 px-5 py-4 transition hover:bg-white/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra-500 text-ink-900">
                    <Mail size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-ink-100">Email us</span>
                    <span className="mt-0.5 block break-all font-display text-sm font-semibold text-white sm:text-base">
                      {globals.email}
                    </span>
                  </span>
                </a>
              </div>

              <p className="mt-5 text-xs leading-5 text-ink-100">
                A confirmation has been recorded securely. Please check your
                inbox and spam folder for our reply.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
