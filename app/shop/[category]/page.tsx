/**
 * app/shop/[category]/page.tsx — T2 category template (BE-1).
 *
 * 22 static routes from content/categories.json. `dynamicParams = false`
 * plus an explicit notFound() guard → unknown single-segment slugs hit the
 * branded 404 (BE-2's not-found.tsx).
 *
 * Section rhythm per DESIGN_SPEC §2 (T2), with the sibling-categories band
 * inserted after the spec section: PageHero (kraft) · Product grid (paper) ·
 * SEO copy + SpecTable (kraft) · Sibling category tiles (paper) ·
 * FAQAccordion (kraft) · CTABand. FAQ sits directly above the CTA (audit).
 *
 * Audit/ISSUES hooks:
 *  - metadata from lib/seo CATEGORY_META via buildMetadata (≤60/≤160);
 *  - single H1 = category entity name (the live "marketing H1" is an H2);
 *  - BreadcrumbList + FAQPage JSON-LD (FAQ schema only because the block
 *    visibly renders, exactly once);
 *  - ISSUES (SEO-2 §7): regulated categories (mylar-bags, custom-cbd-boxes,
 *    custom-tobacco-packaging) render globals.complianceDisclaimer in the hero;
 *  - ISSUES (SEO-2 claims): MOQ/SLA/shipping strings come from getGlobals()
 *    only — SpecTable appends them from the globals prop itself.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { PageHero } from "@/components/blocks/PageHero";
import { CategoryTile } from "@/components/patterns/CategoryTile";
import { CTABand } from "@/components/patterns/CTABand";
import { FAQAccordion } from "@/components/patterns/FAQAccordion";
import { ProductCard } from "@/components/patterns/ProductCard";
import { SpecTable } from "@/components/patterns/SpecTable";
import { Button } from "@/components/ui";
import {
  getCategories,
  getCategory,
  getFaqs,
  getGlobals,
} from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import {
  breadcrumbSchema,
  buildMetadata,
  buildPageTitle,
  CATEGORY_META,
  faqSchema,
  JsonLd,
  truncateAtWordBoundary,
} from "@/lib/seo";

interface Params {
  category: string;
}

interface CategoryPageProps {
  params: Promise<Params>;
}

function GuidanceCard({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
      <h3 className="h4 mb-3">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terra-500"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CATEGORY_HERO_FALLBACKS: Record<string, string> = {
  "custom-boxes": "/img/hm/wp-content/uploads/2025/11/Custom-Product-Packaging-Boxes.webp",
};

/** All 22 category slugs are statically generated; anything else 404s. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  // Final, validated values from KEYWORD_META_MAP §3 — the fallback only
  // guards a future category added to content without an SEO row.
  const meta = CATEGORY_META[slug] ?? {
    title: buildPageTitle(category.name),
    description: truncateAtWordBoundary(category.description, 160),
    h1: category.name,
  };

  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: `/shop/${slug}/`,
    ogImage: CATEGORY_HERO_FALLBACKS[slug] ?? category.imageUrl,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const globals = getGlobals();
  const allProducts = await getPublicProducts();
  const products = allProducts.filter((product) => product.category === slug);
  const h1 = CATEGORY_META[slug]?.h1 ?? category.name;
  const heroImage = CATEGORY_HERO_FALLBACKS[slug] ?? category.imageUrl;

  // ONE FAQ block per page: category-level FAQs when captured on the live
  // site, else a sitewide slice. The schema uses exactly the visible items.
  const faqs =
    category.faqs && category.faqs.length > 0
      ? category.faqs
      : getFaqs().slice(0, 5);

  // Sibling categories — same type first, then the rest (4 tiles).
  const siblings = getCategories()
    .filter((c) => c.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.type === category.type) - Number(a.type === category.type),
    )
    .slice(0, 4);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop/" },
    { name: category.name, href: `/shop/${slug}/` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href }))),
          faqSchema(faqs.map(({ question, answer }) => ({ question, answer }))),
        ]}
      />

      {/* Interior hero (kraft, §6.6) — owns the single H1. */}
      <PageHero
        title={h1}
        lead={category.description}
        crumbs={crumbs}
        image={{
          src: heroImage,
          alt: `${category.name} packaging`,
        }}
      >
        {category.regulated ? (
          /* ISSUES (SEO-2 §7) — compliance disclaimer, regulated verticals. */
          <div
            role="note"
            className="mt-6 flex max-w-[75ch] items-start gap-3 rounded-lg border border-ink-100 bg-white p-4 text-sm text-slate-600"
          >
            <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{globals.complianceDisclaimer}</p>
          </div>
        ) : null}
      </PageHero>

      {/* Product grid (paper). */}
      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Products</p>
            <h2>Shop {category.name}</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              {products.length} made-to-order{" "}
              {products.length === 1 ? "style" : "styles"} — pick a structure
              and we tailor size, stock, and finish to your product.
            </p>
          </div>
          <div className="reveal-stagger grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.slug} className="h-full">
                <ProductCard product={product} categoryName={category.name} />
              </div>
            ))}
          </div>

          <div className="reveal mt-10 rounded-lg border border-ink-100 bg-kraft-100 p-6 shadow-e1 md:mt-12 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-3">
                <p className="eyebrow">Category quote support</p>
                <h2 className="h3">
                  Need help choosing the right {category.name.toLowerCase()}?
                </h2>
                <p className="max-w-[65ch] text-slate-600">
                  Send your size, quantity, stock, and artwork notes. A
                  packaging specialist will recommend the right structure and
                  reply with pricing, typically within one business day.
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
                  <li>Free design support</li>
                  <li>Digital proof before production</li>
                  <li>{globals.shipping}</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 min-[480px]:flex-row lg:flex-col">
                <Button
                  href={`/get-custom-quote/?category=${encodeURIComponent(category.slug)}`}
                  variant="primary"
                  size="md"
                >
                  Get a Quote
                </Button>
                <Button
                  href={globals.phoneHref}
                  variant="secondary"
                  size="md"
                >
                  Call {globals.phone}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO copy + SpecTable (kraft). The live page's second "marketing H1"
          becomes this H2 (KEYWORD_META_MAP §1). */}
      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal flex flex-col gap-4">
            <p className="eyebrow">Why order with us</p>
            <h2 className="max-w-[24ch]">
              Choose {category.name.toLowerCase()} with confidence
            </h2>
            <p className="max-w-[65ch]">{category.intro ?? category.description}</p>
            <p className="max-w-[65ch] text-slate-600">
              Start with the product, then choose the structure, board, print
              coverage, and finishing details that support how it will be
              displayed, shipped, opened, and remembered.
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <GuidanceCard title="Category strengths" items={category.highlights} />
              <GuidanceCard title="Buyer guide" items={category.buyersGuide} />
            </div>
          </div>
          <div className="reveal">
            {/* MOQ / Turnaround / Shipping rows are appended by SpecTable
                from the globals prop (single source — audit). */}
            <SpecTable
              caption={`${category.name} specifications at a glance`}
              globals={globals}
              rows={[
                {
                  label: "Materials",
                  value:
                    "Cardstock (SBS), kraft, corrugated, or rigid board — matched to your product",
                },
                {
                  label: "Styles",
                  value:
                    "Tuck-end, mailer, two-piece, sleeve, display, and fully custom structures",
                },
                {
                  label: "Sizes",
                  value: "Made to your exact dimensions — no fixed size chart",
                },
                {
                  label: "Printing",
                  value:
                    "Full-color CMYK and PMS spot colors, inside and outside",
                },
                {
                  label: "Finishes",
                  value:
                    "Matte, gloss, soft-touch, spot UV, foil stamping, embossing, window patching",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Sibling categories (paper). */}
      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Keep exploring</p>
            <h2>More packaging categories</h2>
          </div>
          <div className="reveal-stagger grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {siblings.map((sibling) => (
              <div key={sibling.slug}>
                <CategoryTile
                  category={sibling}
                  count={
                    allProducts.filter((p) => p.category === sibling.slug)
                      .length
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ONE FAQ block (section-owning, kraft), directly above the CTA (audit). */}
      <FAQAccordion faqs={faqs} className="bg-kraft-100" />

      <CTABand
        heading={`Ready to create your ${category.name.toLowerCase()}?`}
        sub="Send your size, stock, and quantity — wholesale pricing typically lands within one business day."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
