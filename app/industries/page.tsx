/**
 * /industries/ — industry hub (owner: BE-2).
 * CategoryTile grid of the 12 Industry-type categories + secondary links to
 * the General/Material/Style ways of browsing.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CategoryTile } from "@/components/patterns/CategoryTile";
import { CTABand } from "@/components/patterns/CTABand";
import { Reveal } from "@/components/ui";
import { getCategories, getGlobals } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/industries"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/industries/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Industries", href: "/industries/" },
];

const OTHER_WAYS = [
  { name: "Shop", href: "/shop/", blurb: "Browse the full catalog of 150+ products." },
  { name: "By box style", href: "/box-styles/", blurb: "Mailer, display, insert, retail, and more." },
  { name: "By material", href: "/materials/", blurb: "Cardstock, kraft, corrugated, rigid, films." },
  { name: "Business cards", href: "/business-card/", blurb: "Print that matches your packaging." },
];

export default async function IndustriesPage() {
  const globals = getGlobals();
  const industryCategories = getCategories().filter((c) => c.type === "Industry");
  const products = await getPublicProducts();
  const productCounts = new Map<string, number>();
  for (const product of products) {
    productCounts.set(product.category, (productCounts.get(product.category) ?? 0) + 1);
  }

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Bakery counters, dispensary shelves, toy aisles, delivery bags — every industry sells in a different place. Start with yours."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">Industries</span>
            <h2>Packaging that knows your shelf</h2>
          </div>
          <Reveal
            as="div"
            stagger
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
          >
            {industryCategories.map((category) => (
              <div key={category.slug}>
                <CategoryTile category={category} count={productCounts.get(category.slug) ?? 0} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">More ways to browse</span>
            <h2>Not industry-specific?</h2>
          </div>
          <ul className="grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {OTHER_WAYS.map((way) => (
              <li key={way.href}>
                <Link
                  href={way.href}
                  className="group flex h-full flex-col gap-2 rounded-lg border border-ink-100 bg-white p-6 shadow-e1 transition-colors duration-200 ease-brand hover:border-slate-400"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-semibold text-ink-900">
                      {way.name}
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-terra-600 transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-sm text-slate-600">{way.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        heading="Don't see your industry?"
        sub="We've boxed products from hot sauce to hardware — tell us what you make and we'll spec the packaging."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
