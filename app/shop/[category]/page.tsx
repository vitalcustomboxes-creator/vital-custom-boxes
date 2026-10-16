import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";

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
  getPosts,
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

interface SpecRow {
  label: string;
  value: string;
}

const MAILER_META = {
  title: "Custom Mailer Boxes | Vital Custom Boxes",
  description:
    "Explore custom mailer boxes with your logo, made-to-size packaging and printing options. Get free design support, a digital proof and a custom quote.",
  h1: "Custom Mailer Boxes",
};

const MAILER_SPECS: SpecRow[] = [
  {
    label: "Materials",
    value:
      "Discuss corrugated board options based on product weight, dimensions and shipping needs.",
  },
  {
    label: "Styles",
    value:
      "Mailer structures with closure and insert options confirmed for your product.",
  },
  {
    label: "Sizes",
    value:
      "Custom dimensions based on your product and any protective packing space.",
  },
  {
    label: "Printing",
    value:
      "Logo and artwork printing; ask about outside-only or inside-and-outside coverage.",
  },
  {
    label: "Finishes",
    value:
      "Available coatings and finishes depend on the selected stock and printing method.",
  },
];

const DEFAULT_SPECS: SpecRow[] = [
  {
    label: "Materials",
    value:
      "Cardstock, kraft, corrugated or rigid board options, depending on the packaging structure.",
  },
  {
    label: "Styles",
    value:
      "Available structures are confirmed for your product and category.",
  },
  {
    label: "Sizes",
    value:
      "Dimensions confirmed against your product and packaging requirements.",
  },
  {
    label: "Printing",
    value:
      "Custom branding and artwork; printing options depend on the selected stock.",
  },
  {
    label: "Finishes",
    value:
      "Ask about coatings, foil, embossing and other finishes available for your chosen structure.",
  },
];

const MAILER_RELATED = [
  "custom-product-packaging-boxes",
  "custom-rigid-boxes",
  "custom-gift-boxes",
  "custom-apparel-boxes",
];

const CATEGORY_HERO_FALLBACKS: Record<string, string> = {
  "custom-boxes":
    "/img/hm/wp-content/uploads/2025/11/Custom-Product-Packaging-Boxes.webp",
};

function GuidanceCard({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items?.length) return null;

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

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories().map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) return {};

  const meta =
    slug === "custom-mailer-boxes"
      ? MAILER_META
      : CATEGORY_META[slug] ?? {
          title: buildPageTitle(category.name),
          description: truncateAtWordBoundary(
            category.description,
            160,
          ),
          h1: category.name,
        };

  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: `/shop/${slug}/`,
    ogImage:
      CATEGORY_HERO_FALLBACKS[slug] ?? category.imageUrl,
  });
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const globals = getGlobals();
  const categories = getCategories();
  const allProducts = await getPublicProducts();

  const products = allProducts.filter(
    (product) => product.category === slug,
  );

  const isMailer = slug === "custom-mailer-boxes";

  const h1 = isMailer
    ? MAILER_META.h1
    : CATEGORY_META[slug]?.h1 ?? category.name;

  const heroImage =
    CATEGORY_HERO_FALLBACKS[slug] ?? category.imageUrl;

  const quoteHref =
    `/get-custom-quote/?category=${encodeURIComponent(slug)}`;

  const faqs = isMailer
    ? [
        {
          question: "Can I order custom mailer boxes with my logo?",
          answer:
            "Yes. Share your logo, artwork and box requirements with your quote request. We provide design support and a digital proof for approval before printing.",
        },
        {
          question: "How do I choose the right mailer box size?",
          answer:
            "Send your product length, width, height and weight, including any inserts or protective wrapping. Confirm the internal box dimensions in your quote before ordering.",
        },
        {
          question: "What is the minimum order for mailer boxes?",
          answer:
            `Our minimum-order guidance is ${globals.moq}. ` +
            "Share your required quantity so we can confirm the available run size and pricing.",
        },
        {
          question: "Can the inside of the box be printed?",
          answer:
            "Ask for inside-and-outside printing when requesting your quote. Available coverage, stock and printing options will be confirmed for your order.",
        },
        {
          question: "What are the production and shipping terms?",
          answer:
            `${globals.sla}. ${globals.shipping}. ` +
            "Production timing and delivery details are confirmed with your quote; production time is separate from transit time.",
        },
      ]
    : category.faqs?.length
      ? category.faqs
      : getFaqs().slice(0, 5);

  const siblings = categories
    .filter((item) => item.slug !== slug)
    .sort((a, b) => {
      if (isMailer) {
        const aIndex = MAILER_RELATED.indexOf(a.slug);
        const bIndex = MAILER_RELATED.indexOf(b.slug);

        const aRank = aIndex < 0 ? Infinity : aIndex;
        const bRank = bIndex < 0 ? Infinity : bIndex;

        if (aRank !== bRank) return aRank < bRank ? -1 : 1;
      }

      return (
        Number(b.type === category.type) -
        Number(a.type === category.type)
      );
    })
    .slice(0, 4);

  // Only link to existing, relevant posts.
  const relatedPosts = isMailer
    ? getPosts()
        .filter((post) =>
          /mailer|corrugated|shipping|box size|box dimensions|packaging design/i.test(
            `${post.title} ${post.slug}`,
          ),
        )
        .slice(0, 2)
    : [];

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop/" },
    { name: category.name, href: `/shop/${slug}/` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(
            crumbs.map((crumb) => ({
              name: crumb.name,
              path: crumb.href,
            })),
          ),
          faqSchema(
            faqs.map(({ question, answer }) => ({
              question,
              answer,
            })),
          ),
        ]}
      />

      <PageHero
  title={h1}
  lead={
    isMailer
      ? "Create custom mailer boxes around your product, logo and presentation needs. Get free design support and approve a digital proof before printing."
      : category.description
  }
  crumbs={crumbs}
  image={{
    src: heroImage,
    alt: `${category.name} packaging`,
  }}
>
  <div className="mt-6 flex flex-col gap-4">
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
      <li>Free design support</li>
      <li>Digital proof before printing</li>
      <li>{globals.shipping}</li>
      <li>MOQ: {globals.moq}</li>
    </ul>

    <div className="flex flex-wrap gap-3">
      <Button
        href={quoteHref}
        variant="primary"
        size="md"
      >
        Get a Custom Quote
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

  {category.regulated ? (
    <div
      role="note"
      className="mt-6 flex max-w-[75ch] items-start gap-3 rounded-lg border border-ink-100 bg-white p-4 text-sm text-slate-600"
    >
      <Info
        size={18}
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <p>{globals.complianceDisclaimer}</p>
    </div>
  ) : null}
</PageHero>

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Products</p>
            <h2>Shop {category.name}</h2>

            <p className="lead max-w-[52ch] text-slate-600">
              {products.length} made-to-order{" "}
              {products.length === 1 ? "style" : "styles"} —
              explore structures and request size, stock and
              finish options for your product.
            </p>
          </div>

          <div className="reveal-stagger grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.slug} className="h-full">
                <ProductCard
                  product={product}
                  categoryName={category.name}
                />
              </div>
            ))}
          </div>

          <div className="reveal mt-10 rounded-lg border border-ink-100 bg-kraft-100 p-6 shadow-e1 md:mt-12 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-3">
                <p className="eyebrow">Category quote support</p>

                <h2 className="h3">
                  Need help choosing your packaging?
                </h2>

                <p className="max-w-[65ch] text-slate-600">
                  Send your product dimensions, quantity, stock
                  preferences and artwork notes. We will review
                  your requirements and provide a custom quote.
                </p>

                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
                  <li>Free design support</li>
                  <li>Digital proof before production</li>
                  <li>{globals.shipping}</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 min-[480px]:flex-row lg:flex-col">
                <Button
                  href={quoteHref}
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

      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal flex flex-col gap-4">
            <p className="eyebrow">Why order with us</p>

            <h2 className="max-w-[24ch]">
              {isMailer
                ? "Custom mailer boxes built around your product"
                : `Choose ${category.name.toLowerCase()} with confidence`}
            </h2>

            <p className="max-w-[65ch]">
              {isMailer
                ? "Start with what goes inside the box: your product dimensions, weight and any protective wrapping. These details help determine the internal space, structure and board options to discuss in your quote."
                : category.intro ?? category.description}
            </p>

            <p className="max-w-[65ch] text-slate-600">
              {isMailer
                ? "Then plan the presentation. Share your logo, preferred artwork placement and whether you want printing inside, outside or both. We confirm available options and provide a digital proof before printing."
                : "Start with the product, then choose the structure, board, print coverage and finishing details that suit how it will be displayed, shipped and opened."}
            </p>

            {isMailer ? (
              <p className="max-w-[65ch] text-slate-600">
                Free design support is included. {globals.sla}.
                {" "}{globals.shipping}. Run size, specifications
                and delivery details are confirmed with your quote.
              </p>
            ) : null}

            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <GuidanceCard
                title={
                  isMailer ? "Plan your mailer" : "Category strengths"
                }
                items={
                  isMailer
                    ? [
                        "Measure your product with its protective wrapping.",
                        "Include product weight and insert requirements.",
                        "Share your intended packing and shipping method.",
                      ]
                    : category.highlights
                }
              />

              <GuidanceCard
                title="Buyer guide"
                items={
                  isMailer
                    ? [
                        "Specify internal dimensions in your quote request.",
                        "Confirm printing coverage and artwork placement.",
                        "Approve the final specifications and digital proof.",
                      ]
                    : category.buyersGuide
                }
              />
            </div>
          </div>

          <div className="reveal">
            <SpecTable
              caption={`${category.name} specifications at a glance`}
              globals={globals}
              rows={isMailer ? MAILER_SPECS : DEFAULT_SPECS}
            />
          </div>
        </div>
      </section>

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
                    allProducts.filter(
                      (product) =>
                        product.category === sibling.slug,
                    ).length
                  }
                />
              </div>
            ))}
          </div>

          {relatedPosts.length > 0 ? (
            <div className="mt-12">
              <h2 className="h3">Packaging guides</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}/`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white p-5 font-semibold text-ink-900 shadow-e1 transition-colors hover:border-slate-400"
                  >
                    <span>{post.title}</span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-terra-600"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <FAQAccordion
        faqs={faqs}
        className="bg-kraft-100"
      />

      <CTABand
        heading={`Ready to create your ${category.name.toLowerCase()}?`}
        sub="Send your product dimensions, quantity and artwork requirements for a custom quote."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}