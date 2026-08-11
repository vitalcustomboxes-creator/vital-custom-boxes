/**
 * /box-styles/ — style library (owner: BE-2).
 * Anatomy intro (static Dieline illustration — the draw-in signature stays
 * home-exclusive) + a ProductCard grid per Style-type category from
 * content/categories.json. Section backgrounds alternate per DESIGN_SPEC §2.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { Dieline } from "@/components/patterns/Dieline";
import { ProductCard } from "@/components/patterns/ProductCard";
import { Reveal } from "@/components/ui";
import { getCategories, getGlobals } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { categoryPath } from "@/lib/routes";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/box-styles"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/box-styles/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Box Styles", href: "/box-styles/" },
];

export default async function BoxStylesPage() {
  const globals = getGlobals();
  const styleCategories = getCategories().filter((c) => c.type === "Style");
  const allProducts = await getPublicProducts();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Mailer, display, insert, retail, and product packaging structures — find the construction that fits how your product sells and ships."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Start here</span>
            <h2 className="max-w-[24ch]">Every box starts as a dieline</h2>
            <div className="mt-4 flex max-w-[65ch] flex-col gap-4 text-slate-600">
              <p>
                A dieline is the flat blueprint of your box — cut lines, fold
                lines, and tuck flaps mapped out before anything prints. The
                style you choose decides how the box closes, stacks, ships, and
                opens in your customer’s hands.
              </p>
              <p>
                Pick a structure below, or skip the homework: describe your
                product in the quote form and our structural designers will
                recommend (and draw) the right dieline for free.
              </p>
            </div>
          </div>
          {/* Static illustration — no .draw-in outside the home hero (spec §6.6/§8). */}
          <div className="rounded-lg bg-kraft-100 p-8 md:p-12">
            <Dieline className="mx-auto w-full max-w-[460px] text-ink-700" />
          </div>
        </div>
      </section>

      {styleCategories.map((category, i) => {
        const products = allProducts.filter((product) => product.category === category.slug);
        return (
          <section
            key={category.slug}
            id={category.slug}
            className={`section ${i % 2 === 0 ? "bg-kraft-100" : "bg-paper-50"}`}
          >
            <div className="container-hm">
              <div className="mb-10 flex flex-col gap-3 md:mb-12">
                <span className="eyebrow">Style library</span>
                <h2>{category.name}</h2>
                <p className="lead max-w-[65ch] text-slate-600">{category.description}</p>
              </div>
              <Reveal
                as="div"
                stagger
                className="grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3"
              >
                {products.map((product) => (
                  <div key={product.slug} className="h-full">
                    <ProductCard product={product} categoryName={category.name} />
                  </div>
                ))}
              </Reveal>
              <div className="mt-8">
                <Link
                  href={categoryPath(category)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-terra-600 transition-colors duration-150 ease-brand hover:text-terra-500"
                >
                  View the {category.name.toLowerCase()} category
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      <CTABand
        heading="Can't find your structure?"
        sub="We build custom dielines every day — describe the product and we'll engineer the box around it."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
