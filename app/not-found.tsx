/**
 * app/not-found.tsx — branded 404 (owner: BE-2).
 *
 * Audit "real 404": Next serves this with a true HTTP 404 status — never a
 * soft-404 redirect (TECH_SEO §2.7). 404s emit no meta description and no
 * canonical (KEYWORD_META_MAP §4); the status code handles indexing.
 *
 * Recovery paths: product search (GET → /shop/?q=…, read by the hub),
 * top category tiles, quote CTA, home link. Single <h1>; visible form label.
 */
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CategoryTile } from "@/components/patterns/CategoryTile";
import { Button } from "@/components/ui";
import { getCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Page Not Found | Vital Custom Boxes",
  // QA-AUTO 2026-06-12 (ISSUES, SEO-VERIFY obs.2): without these nulls the 404
  // INHERITS the root layout's home metadata — description, canonical "/" and
  // og:url all rendered on the 404. Nulls clear the inherited fields; robots
  // noindex made explicit (Next adds it to not-found, but belt-and-braces).
  description: null,
  alternates: { canonical: null },
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

/** Curated "top" categories for lost visitors (highest-traffic heads). */
const TOP_CATEGORY_SLUGS = [
  "custom-boxes",
  "custom-mailer-boxes",
  "custom-pizza-boxes",
  "custom-bakery-boxes",
];

export default function NotFound() {
  const categories = getCategories();
  const topCategories = TOP_CATEGORY_SLUGS.flatMap((slug) => {
    const match = categories.find((c) => c.slug === slug);
    return match ? [match] : [];
  });

  return (
    <>
      <PageHero
        title="Page not found"
        lead="The page you're after has moved, never existed, or was folded into another box. Let's get you somewhere useful."
      >
        {/* Product search — plain GET form, zero JS required. */}
        <form
          action="/shop/"
          method="get"
          role="search"
          className="mt-6 flex max-w-[480px] flex-col gap-1.5"
        >
          <label htmlFor="nf-search" className="text-sm font-semibold text-ink-700">
            Search products
          </label>
          <div className="flex gap-2">
            <input
              id="nf-search"
              type="search"
              name="q"
              placeholder="e.g. cake boxes, mylar bags"
              className="h-11 w-full rounded-md border border-ink-100 bg-white px-4 text-base text-ink-900 transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-slate-400 hover:border-slate-400 focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)] focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" iconLeft={<Search size={18} />}>
              Search
            </Button>
          </div>
        </form>
      </PageHero>

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3">
            <span className="eyebrow">Popular right now</span>
            <h2>Start from the shop</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {topCategories.map((category) => (
              <CategoryTile
                key={category.slug}
                category={category}
                count={category.productSlugs.length}
              />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:items-center">
            <Button href="/get-custom-quote/" variant="primary" size="md">
              Get a Custom Quote
            </Button>
            <Button href="/" variant="ghost" size="md">
              Back to the homepage
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
