/**
 * /shop/ — category shopping hub.
 *
 * Groups the main packaging categories by Industry, Material, Style, and
 * General so users can browse category pages before choosing a product.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { CategoryTile } from "@/components/patterns/CategoryTile";
import { ProductCard } from "@/components/patterns/ProductCard";
import { Button, Reveal } from "@/components/ui";
import { getCategories, getGlobals } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { search } from "@/lib/search";
import {
  breadcrumbSchema,
  buildMetadata,
  JsonLd,
  STATIC_PAGE_META,
} from "@/lib/seo";
import type { CategoryType } from "@/lib/types";

const META = STATIC_PAGE_META["/shop"];

export const metadata: Metadata = buildMetadata({
  ...META,
  path: "/shop/",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop/" },
];

const GROUPS: Array<{
  type: CategoryType;
  eyebrow: string;
  title: string;
  lead: string;
}> = [
  {
    type: "Industry",
    eyebrow: "By industry",
    title: "Start with your market",
    lead: "Food, cosmetics, apparel, gifts, CBD, and more — each category is tuned to where the package sells and ships.",
  },
  {
    type: "Material",
    eyebrow: "By material",
    title: "Choose the stock and feel",
    lead: "Compare kraft, rigid, corrugated, printed bags, mylar, and other material-led packaging routes.",
  },
  {
    type: "Style",
    eyebrow: "By style",
    title: "Pick the structure",
    lead: "Mailer, display, insert, retail, and product packaging styles organized around how the box opens, ships, and presents.",
  },
  {
    type: "General",
    eyebrow: "General",
    title: "Core packaging and print",
    lead: "Broad custom box and business-card options for brands that need a flexible starting point.",
  },
];

interface ShopPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const globals = getGlobals();
  const categories = getCategories();
  const products = await getPublicProducts();
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const productCounts = new Map<string, number>();
  for (const product of products) {
    productCounts.set(product.category, (productCounts.get(product.category) ?? 0) + 1);
  }
  const results = query
    ? search(query, products.length, {
        products,
        categories: [],
        posts: [],
      }).flatMap((hit) => {
        const product = productBySlug.get(hit.slug);
        return product ? [product] : [];
      })
    : null;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          CRUMBS.map((crumb) => ({ name: crumb.name, path: crumb.href })),
        )}
      />

      <PageHero
        title={META.h1}
        lead="Browse every main packaging category by industry, material, and box style — then request a quote with your exact size, stock, and quantity."
        crumbs={CRUMBS}
      >
        <form
          action="/shop/"
          method="get"
          role="search"
          className="mt-8 flex max-w-xl flex-col gap-1.5"
        >
          <label
            htmlFor="shop-search"
            className="text-sm font-semibold text-ink-700"
          >
            Search products
          </label>
          <div className="flex gap-3">
            <div className="relative w-full">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                id="shop-search"
                name="q"
                defaultValue={query}
                placeholder="e.g. mailer boxes"
                className="h-11 w-full rounded-md border border-ink-100 bg-white pl-10 pr-4 text-base text-ink-900 transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-slate-400 hover:border-slate-400 focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)] focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </div>
        </form>
      </PageHero>

      {results ? (
        <section className="section bg-paper-50">
          <div className="container-hm">
            <div className="mb-10 flex flex-col gap-3 md:mb-12">
              <p className="eyebrow">Search</p>
              <h2>
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for &ldquo;{query}&rdquo;
              </h2>
              <p className="text-sm">
                <Link
                  href="/shop/"
                  className="font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
                >
                  Clear search and browse the shop
                </Link>
              </p>
            </div>
            {results.length > 0 ? (
              <div className="reveal-stagger grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => (
                  <div key={product.slug} className="h-full">
                    <ProductCard
                      product={product}
                      categoryName={
                        categoryNames.get(product.category) ?? "Packaging"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-[65ch] rounded-lg border border-ink-100 bg-white p-6">
                <p className="font-display text-[17px] font-semibold text-ink-900">
                  No products match that search.
                </p>
                <p className="mt-2 text-slate-600">
                  Try a broader term like &ldquo;mailer&rdquo;,
                  &ldquo;bakery&rdquo;, or &ldquo;rigid&rdquo; — or{" "}
                  <Link
                    href={globals.promo.href}
                    className="font-semibold text-terra-600 underline underline-offset-4"
                  >
                    tell us what you need
                  </Link>{" "}
                  and we will spec it for you.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        GROUPS.map((group, index) => {
        const items = categories.filter((category) => category.type === group.type);
        if (items.length === 0) return null;

        return (
          <section
            key={group.type}
            className={`section ${index % 2 === 0 ? "bg-paper-50" : "bg-kraft-100"}`}
          >
            <div className="container-hm">
              <div className="mb-10 flex flex-col gap-3 md:mb-12">
                <p className="eyebrow">{group.eyebrow}</p>
                <h2>{group.title}</h2>
                <p className="lead max-w-[58ch] text-slate-600">{group.lead}</p>
              </div>
              <Reveal
                as="div"
                stagger
                className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
              >
                {items.map((category) => (
                  <div key={category.slug}>
                    <CategoryTile
                      category={category}
                      count={productCounts.get(category.slug) ?? 0}
                    />
                  </div>
                ))}
              </Reveal>
            </div>
          </section>
        );
      }))}

      <CTABand
        heading="Need a shop recommendation?"
        sub="Tell us what you're packing and we'll point you to the right structure, material, and finish before quoting."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
