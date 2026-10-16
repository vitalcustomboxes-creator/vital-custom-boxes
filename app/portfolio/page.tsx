import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import {
  getCaseStudies,
  getCategory,
  getGlobals,
} from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { categoryPath, productPath } from "@/lib/routes";
import {
  breadcrumbSchema,
  buildMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Packaging Examples | Vital Custom Boxes",
  description:
    "Explore candle, pizza, display, mailer, rigid, gift, soap, clothing and product packaging examples. Request a free custom packaging quote.",
  path: "/portfolio/",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Packaging Examples", href: "/portfolio/" },
];

interface PackagingExample {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  linkLabel: string;
}

const EXAMPLE_COPY: Record<
  string,
  { title: string; description: string }
> = {
  "custom-candle-boxes": {
    title: "Candle Packaging",
    description:
      "Explore packaging ideas for candle jars and home fragrance products. Discuss box dimensions, stock, printing and insert options for your product.",
  },
  "custom-pizza-boxes": {
    title: "Pizza Packaging",
    description:
      "Explore branded pizza box ideas for takeaway and delivery. Request sizing, material and printing options suited to your menu.",
  },
  "custom-display-boxes": {
    title: "Counter Display Packaging",
    description:
      "Explore packaging ideas for presenting products on retail counters. Discuss display dimensions, product layout and custom printed artwork.",
  },
};

const ADDITIONAL_PRODUCTS = [
  {
    slug: "custom-mailer-boxes",
    description:
      "Explore custom mailer packaging for your products. Discuss sizing, printed branding and material options for your next order.",
  },
  {
    slug: "rigid-boxes",
    description:
      "Explore structured rigid packaging for product presentation. Ask about dimensions, wrapping, printing and available finishes.",
  },
  {
    slug: "custom-magnetic-closure-gift-boxes",
    description:
      "Explore magnetic closure gift packaging for retail and gifting. Discuss box sizing, branding and presentation options.",
  },
  {
    slug: "custom-soap-boxes",
    description:
      "Explore soap packaging tailored to your product. Ask about stock, dimensions and space for branding and product information.",
  },
  {
    slug: "custom-clothing-boxes",
    description:
      "Explore apparel packaging for folded garments, retail presentation and gifting. Discuss sizing, materials and printed artwork.",
  },
  {
    slug: "custom-product-boxes",
    description:
      "Explore custom product packaging based on your item and brand. Discuss dimensions, printing, materials and finishes.",
  },
];

export default async function PortfolioPage() {
  const globals = getGlobals();
  const studies = getCaseStudies();
  const products = await getPublicProducts();

  const productsBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );

  const existingExamples: PackagingExample[] = studies.map(
    (study) => {
      const category = getCategory(study.categorySlug);

      const copy = EXAMPLE_COPY[study.categorySlug] ?? {
        title: category?.name ?? "Custom Packaging",
        description:
          "Explore custom packaging options for your product. Ask about sizing, materials, printing and finishes.",
      };

      return {
        id: `example-${study.slug}`,
        title: copy.title,
        description: copy.description,
        imageUrl: study.imageUrl,
        href: category ? categoryPath(category) : "/shop/",
        linkLabel: category
          ? `Explore ${category.name}`
          : "Explore packaging",
      };
    },
  );

  const additionalExamples: PackagingExample[] =
    ADDITIONAL_PRODUCTS.flatMap((example) => {
      const product = productsBySlug.get(example.slug);

      if (!product) return [];

      return [
        {
          id: `product-${product.slug}`,
          title: product.name,
          description: example.description,
          imageUrl: product.imageUrl,
          href: productPath(product),
          linkLabel: `Explore ${product.name}`,
        },
      ];
    });

  const examples = [
    ...existingExamples,
    ...additionalExamples,
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          CRUMBS.map((crumb) => ({
            name: crumb.name,
            path: crumb.href,
          })),
        )}
      />

      <PageHero
        title="Packaging Examples"
        lead="Explore packaging styles and presentation ideas for your next custom order."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-8 max-w-[65ch]">
            <span className="eyebrow">
              Packaging inspiration
            </span>

            <h2 className="mt-3">
              Find a direction for your packaging
            </h2>

            <p className="mt-3 text-slate-600">
              These images illustrate packaging examples, rather than
              verified customer case studies. Final materials,
              dimensions, printing and finishes are confirmed with
              your quote.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((example) => (
              <article
                key={example.id}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-e1"
              >
                <div className="relative aspect-[4/3] bg-kraft-100">
                  <Image
                    src={example.imageUrl}
                    alt={`${example.title} example`}
                    fill
                    className="object-contain p-4"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <span className="eyebrow">
                    Packaging example
                  </span>

                  <h3 className="h4">{example.title}</h3>

                  <p className="text-sm text-slate-600">
                    {example.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-3 pt-3">
                    <Link
                      href={example.href}
                      className="inline-flex items-center gap-2 font-semibold text-ink-900 underline underline-offset-4"
                    >
                      {example.linkLabel}
                      <ArrowRight
                        size={16}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                    </Link>

                    <Link
                      href="/get-custom-quote/"
                      className="inline-flex items-center gap-2 font-semibold text-terra-600 underline underline-offset-4"
                    >
                      Request a custom quote
                      <ArrowRight
                        size={16}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        heading="Have a packaging idea?"
        sub={`Get a custom quote with free design support. ${globals.shipping}.`}
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}