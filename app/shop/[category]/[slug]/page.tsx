/**
 * app/shop/[category]/[slug]/page.tsx — T3 product template (BE-1).
 *
 * Static product routes from content/products.json (`dynamicParams = false` +
 * notFound() guard → branded 404 for unknown slugs).
 *
 * Section rhythm per DESIGN_SPEC §2 (T3): Breadcrumb + Gallery/Info (paper) ·
 * SpecTable + description (kraft) · RelatedProducts (paper) · FAQAccordion
 * (kraft, ONLY when the product has captured FAQs — else none) · CTABand.
 *
 * Audit/ISSUES hooks:
 *  - SINGLE H1 = product name (the live second "marketing H1" is the H2 of
 *    the details section); title/meta via buildProductTitle/Description;
 *  - Product JSON-LD WITHOUT aggregateRating/review/offers (lib/seo enforces);
 *  - FAQPage JSON-LD only when the FAQ block visibly renders;
 *  - ISSUES (SEO-2 claims): MOQ/SLA/shipping/tel from getGlobals() only —
 *    SpecTable appends the three rows from the globals prop itself;
 *  - ISSUES (SEO-2 §7): products in regulated categories render
 *    globals.complianceDisclaimer (category.regulated drives it).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Info } from "lucide-react";

import { RelatedProducts } from "@/components/blocks/RelatedProducts";
import { CTABand } from "@/components/patterns/CTABand";
import { FAQAccordion } from "@/components/patterns/FAQAccordion";
import { GalleryLightbox } from "@/components/patterns/GalleryLightbox";
import { ProductSpecConfigurator } from "@/components/patterns/ProductSpecConfigurator";
import { SpecTable } from "@/components/patterns/SpecTable";
import { Badge, Breadcrumbs, Button } from "@/components/ui";
import {
  getCategory,
  getGlobals,
  getProducts,
} from "@/lib/content";
import { getPublicProduct, getPublicProducts } from "@/lib/public-products";
import {
  breadcrumbSchema,
  buildMetadata,
  buildProductDescription,
  buildProductTitle,
  faqSchema,
  JsonLd,
  productSchema,
  type JsonLdObject,
} from "@/lib/seo";
import { categoryPath as buildCategoryPath, productPath as buildProductPath } from "@/lib/routes";
import type { Product } from "@/lib/types";

interface Params {
  category: string;
  slug: string;
}

interface ProductPageProps {
  params: Promise<Params>;
}

function CompactList({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
      <h3 className="h4 mb-3">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check
              size={15}
              className="mt-0.5 shrink-0 text-terra-600"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Local catalog slugs are prebuilt; Firebase-only products resolve dynamically. */
export const dynamicParams = true;

export function generateStaticParams(): Params[] {
  return getProducts().map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product || product.category !== categorySlug) return {};

  return buildMetadata({
    // Pattern A/B/C helper (≤60) + blurb-first description (≤160) — spec §6.
    // Curated titles are retained unless they collide with a category/static
    // page (for example the Custom Pizza Boxes product).
    title: buildProductTitle(product.name, product.title),
    description: buildProductDescription(product.name, {
      blurb: product.description,
    }),
    path: `/shop/${product.category}/${slug}/`,
    ogImage: product.imageUrl,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category: categorySlug, slug } = await params;
  const allProducts = await getPublicProducts();
  const product = allProducts.find((item) => item.slug === slug);
  if (!product || product.category !== categorySlug) notFound();

  const globals = getGlobals();
  const category = getCategory(product.category);
  const categoryName = category?.name ?? "All Products";
  const categoryPath = category ? buildCategoryPath(category) : "/shop/";
  const productPath = buildProductPath(product);

  // Related: curated `related` slugs first (same category only — task spec),
  // topped up with category siblings to exactly 4, never the product itself.
  const seen = new Set<string>([product.slug]);
  const related: Product[] = [];
  const productBySlug = new Map(allProducts.map((item) => [item.slug, item]));
  const candidates = [
    ...(product.related ?? [])
      .map((s) => productBySlug.get(s))
      .filter((p): p is Product => Boolean(p))
      .filter((p) => p.category === product.category),
    ...allProducts.filter((item) => item.category === product.category),
  ];
  for (const candidate of candidates) {
    if (related.length === 4) break;
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    related.push(candidate);
  }

  const faqs = product.faqs ?? [];
  const hasFaqs = faqs.length > 0;
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            src: product.imageUrl,
            alt:
              product.imageAlt ??
              `${product.name} — custom printed ${categoryName} packaging`,
          },
          ...related.slice(0, 4).map((item) => ({
            src: item.imageUrl,
            alt:
              item.imageAlt ??
              `${item.name} — related ${categoryName} packaging example`,
          })),
        ].filter(
          (image, index, images) =>
            images.findIndex((candidate) => candidate.src === image.src) === index,
        );

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop/" },
    { name: categoryName, href: categoryPath },
    { name: product.name, href: productPath },
  ];

  const quoteHref = `/get-custom-quote/?product=${encodeURIComponent(slug)}`;

  const schema: JsonLdObject[] = [
    breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href }))),
    // NO ratings/reviews/offers — quote-based, nothing fabricated (audit).
    productSchema({
      name: product.name,
      image: product.imageUrl,
      description: product.description,
      url: productPath,
      sku: product.sku,
      category: categoryName,
    }),
  ];
  if (hasFaqs) {
    schema.push(
      faqSchema(faqs.map(({ question, answer }) => ({ question, answer }))),
    );
  }

  return (
    <>
      <JsonLd data={schema} />

      {/* Breadcrumb + gallery/info (paper) — H1 + quote CTA above the fold. */}
      <section className="bg-paper-50">
        <div className="container-hm py-8 md:py-12">
          <Breadcrumbs className="mb-6" items={crumbs} />
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <GalleryLightbox
                images={galleryImages}
                alt={product.imageAlt ?? `${product.name} — custom printed ${categoryName} packaging`}
              />
            </div>
            <div className="flex flex-col items-start gap-4">
              <p className="eyebrow">{categoryName}</p>
              <h1 className="max-w-[20ch]">{product.name}</h1>
              {product.sku ? (
                <Badge variant="outline">SKU {product.sku}</Badge>
              ) : null}
              <p className="max-w-[60ch]">{product.description}</p>

              {/* Spec summary — every figure from globals (single source). */}
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-terra-600"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ink-700">MOQ:</strong>{" "}
                    {globals.moq}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-terra-600"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ink-700">
                      Turnaround:
                    </strong>{" "}
                    {globals.sla}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-terra-600"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ink-700">
                      Shipping:
                    </strong>{" "}
                    {globals.shipping}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-terra-600"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ink-700">
                      Design:
                    </strong>{" "}
                    Free design support with a digital proof before production
                  </span>
                </li>
              </ul>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                {/* Above-the-fold quote CTA (no sheen — hero/CTABand only). */}
                <Button href={quoteHref} variant="primary" size="lg">
                  Get a Custom Quote
                </Button>
                <a
                  href={globals.phoneHref}
                  className="text-sm font-semibold text-ink-700 transition-colors duration-150 ease-brand hover:text-terra-600"
                >
                  or call {globals.phone}
                </a>
              </div>

              {/* On-page spec configurator (UX-D): builds a deep link that
                  pre-fills the quote form with the chosen specs. Quote-only
                  model preserved — no pricing/cart. */}
              <div className="mt-6">
                <ProductSpecConfigurator
                  productSlug={product.slug}
                  productName={product.name}
                  categorySlug={product.category}
                  categoryName={categoryName}
                  productPath={productPath}
                />
              </div>

              {category?.regulated ? (
                /* ISSUES (SEO-2 §7) — disclaimer on regulated products. */
                <div
                  role="note"
                  className="mt-4 flex items-start gap-3 rounded-lg border border-ink-100 bg-kraft-100 p-4 text-sm text-slate-600"
                >
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>{globals.complianceDisclaimer}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Description + SpecTable (kraft). Marketing heading = H2 (audit). */}
      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal flex flex-col gap-4">
            <p className="eyebrow">Product details</p>
            <h2 className="max-w-[24ch]">{product.name}, built to your spec</h2>
            <p className="max-w-[65ch]">{product.description}</p>
            <p className="max-w-[65ch] text-slate-600">
              Share your dimensions, quantity, stock preference, and artwork
              notes. Our team will shape the dieline, print setup, and finish
              recommendations around the way this packaging needs to perform.
            </p>
            <p className="text-sm">
              <Link
                href={categoryPath}
                className="font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
              >
                See every product in {categoryName}
              </Link>
            </p>
          </div>
          <div className="reveal">
            {/* MOQ / Turnaround / Shipping rows are appended by SpecTable
                from the globals prop (single source — audit). */}
            <SpecTable
              caption={`${product.name} specifications`}
              globals={globals}
              rows={[
                ...(product.sku ? [{ label: "SKU", value: product.sku }] : []),
                { label: "Category", value: categoryName },
                {
                  label: "Materials",
                  value:
                    "Cardstock (SBS), kraft, corrugated, or rigid board — matched to your product",
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

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-8 flex flex-col gap-3 md:mb-10">
            <p className="eyebrow">Packaging details</p>
            <h2 className="max-w-[24ch]">What to plan for this box</h2>
            <p className="lead max-w-[60ch] text-slate-600">
              Keep the core decisions simple: product fit, material choice,
              print surface, and finish details that support the brand without
              overbuilding the package.
            </p>
          </div>
          <div className="reveal-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <CompactList title="Best for" items={product.bestFor} />
            <CompactList title="Materials" items={product.materials} />
            <CompactList title="Finishes" items={product.finishes} />
            <CompactList title="Highlights" items={product.highlights} />
          </div>
        </div>
      </section>

      {/* Related products (section-owning, paper) — same category, 4.
          Renders nothing when the list is empty. */}
      <RelatedProducts
        products={related}
        title={`More ${categoryName.toLowerCase()}`}
      />

      {/* ONE FAQ block (section-owning, kraft), only when this product has
          captured FAQs — FAQAccordion renders nothing for an empty list. */}
      {hasFaqs ? <FAQAccordion faqs={faqs} className="bg-kraft-100" /> : null}

      <CTABand
        heading={`Ready to customize your ${product.name.toLowerCase()}?`}
        sub="Send your size, stock, and quantity — wholesale pricing typically lands within one business day."
        defaultProduct={{
          slug: product.slug,
          name: product.name,
          categorySlug: product.category,
          categoryName,
          sourcePath: productPath,
        }}
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
