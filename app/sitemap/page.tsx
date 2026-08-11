/**
 * /sitemap/ — HTML sitemap page (owner: BE-2).
 *
 * PM DECISION (ISSUES): the live WordPress site serves its HTML sitemap at
 * /sitemap/, so this route keeps that exact URL — do NOT rename to
 * /sitemap-page (the metadata strings live under the "/sitemap-page" key in
 * lib/seo.ts STATIC_PAGE_META; only the path differs). Coexists with
 * app/sitemap.ts → /sitemap.xml (different route: /sitemap/ vs /sitemap.xml).
 *
 * Lists PUBLIC CONTENT PAGES ONLY — no account/cart legacy URLs (they are 308
 * redirects), no /thank-you/ (noindex), no /case-studies/ (canonicalizes to
 * /portfolio/). Dynamic entries come from the typed loaders, the static list
 * from lib/routes.ts — the same sources app/sitemap.ts uses, so the HTML and
 * XML sitemaps can never drift apart.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getCategories, getGlobals, getPosts } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { categoryPath, productPath, STATIC_CONTENT_ROUTES } from "@/lib/routes";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/sitemap-page"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/sitemap/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Sitemap", href: "/sitemap/" },
];

function SitemapLink({ href, children }: { href: string; children: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-block py-1 text-sm text-ink-700 transition-colors duration-150 ease-brand hover:text-terra-600"
      >
        {children}
      </Link>
    </li>
  );
}

export default async function HtmlSitemapPage() {
  const categories = getCategories();
  const products = await getPublicProducts();
  const posts = getPosts();
  const globals = getGlobals();
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  const groups = [
    { id: "explore", title: "Shop & explore" },
    { id: "company", title: "Company" },
    { id: "legal", title: "Policies & utility" },
  ] as const;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Every public page on the site, in one index — pages, shop sections, products, and the blog."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm flex flex-col gap-12">
          <div>
            <h2 className="h3">Pages</h2>
            <div className="mt-5 grid gap-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.id}>
                  <h3 className="h4">{group.title}</h3>
                  <ul className="mt-3">
                    {group.id === "explore" ? (
                      <>
                        <SitemapLink href="/">Home</SitemapLink>
                        <SitemapLink href="/shop/">Shop</SitemapLink>
                      </>
                    ) : null}
                    {group.id === "company" ? (
                      <SitemapLink href="/blog/">Blog</SitemapLink>
                    ) : null}
                    {STATIC_CONTENT_ROUTES.filter((r) => r.group === group.id).map(
                      (route) => (
                        <SitemapLink key={route.path} href={route.path}>
                          {route.name}
                        </SitemapLink>
                      ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="h3">Shop Sections</h2>
            <ul className="mt-5 grid gap-x-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <SitemapLink key={category.slug} href={categoryPath(category)}>
                  {category.name}
                </SitemapLink>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="h3">Products</h2>
            <p className="mt-2 text-sm text-slate-600">
              All {products.length} products, A–Z with their category.
            </p>
            <ul className="mt-5 grid gap-x-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {[...products]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={productPath(product)}
                      className="inline-block py-1 text-sm text-ink-700 transition-colors duration-150 ease-brand hover:text-terra-600"
                    >
                      {product.name}
                    </Link>{" "}
                    <span className="text-xs text-slate-600">
                      — {categoryName.get(product.category) ?? product.category}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h2 className="h3">Blog posts</h2>
            <ul className="mt-5 grid gap-x-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <SitemapLink key={post.slug} href={`/blog/${post.slug}/`}>
                  {post.title}
                </SitemapLink>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CTABand
        heading="Ready to start your packaging project?"
        sub="Share your specifications and artwork for a custom quote."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
