/**
 * app/page.tsx — T1 Home (server component, BE-1).
 *
 * Section rhythm per docs/DESIGN_SPEC.md §2 (T1 row): Hero (paper) ·
 * TrustBar (paper, compact) · CategoryTiles (kraft) · Featured products
 * tabs (paper) · ProcessSteps (kraft) · Materials/Sustainability split
 * (paper) · StatsRow (dark) · ReviewWall (paper) · Materials comparison
 * teaser (kraft) · Blog teaser (paper) · FAQAccordion (kraft) · CTABand.
 *
 * Audit rules honored here:
 *  - single H1 (owned by <Hero heading>, copy from KEYWORD_META_MAP home row);
 *  - ONE FAQ block + FAQPage JSON-LD emitted from the same visible items;
 *  - every SLA/MOQ/shipping/phone/promo string flows from getGlobals()
 *    (ISSUES, SEO-2 claims item) — stat figures are real content counts or
 *    parsed FROM the globals strings, never invented;
 *  - NO fabricated ratings: Hero's `rating` prop requires real numbers, so it
 *    is omitted entirely; instead the reviews section links to the real
 *    Trustpilot profile ("Read our reviews") and ReviewWall shows its
 *    placeholder-verification note.
 */
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { ComparisonTable } from "@/components/blocks/ComparisonTable";
import { ImageText } from "@/components/blocks/ImageText";
import { StatsRow, type Stat } from "@/components/blocks/StatsRow";
import { TrustBar } from "@/components/blocks/TrustBar";
import { BlogCard } from "@/components/patterns/BlogCard";
import { CategoryTile } from "@/components/patterns/CategoryTile";
import { CTABand } from "@/components/patterns/CTABand";
import { Dieline } from "@/components/patterns/Dieline";
import { FAQAccordion } from "@/components/patterns/FAQAccordion";
import { Hero } from "@/components/patterns/Hero";
import { ProcessSteps } from "@/components/patterns/ProcessSteps";
import { ProductCard } from "@/components/patterns/ProductCard";
import { ReviewWall } from "@/components/patterns/ReviewWall";
import { Tabs } from "@/components/ui";
import {
  getCategories,
  getCategory,
  getFaqs,
  getGlobals,
  getPosts,
  getRatingSummary,
  getReviews,
} from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import {
  buildMetadata,
  DEFAULT_OG_IMAGE,
  faqSchema,
  JsonLd,
  STATIC_PAGE_META,
} from "@/lib/seo";
import type { Product } from "@/lib/types";

const home = STATIC_PAGE_META["/"];

export const metadata = buildMetadata({
  title: home.title,
  description: home.description,
  path: "/",
});

function productGrid(
  products: Product[],
  categoryNames: Map<string, string>,
): ReactNode {
  return (
    <div className="reveal-stagger grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div key={product.slug} className="h-full">
          <ProductCard
            product={product}
            categoryName={categoryNames.get(product.category) ?? "Packaging"}
          />
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const globals = getGlobals();
  const categories = getCategories();
  const products = await getPublicProducts();
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
  const productCounts = new Map(
    categories.map((c) => [
      c.slug,
      products.filter((p) => p.category === c.slug).length,
    ]),
  );

  // "Shop by categories" — the 12 Industry verticals lead (brief: 12 industry first).
  const industryCategories = categories.filter((c) => c.type === "Industry");

  // Tab collections = deterministic slices of the real catalog by category type.
  const productsOfType = (...types: string[]): Product[] => {
    const slugs = new Set(
      categories.filter((c) => types.includes(c.type)).map((c) => c.slug),
    );
    return products.filter((p) => slugs.has(p.category));
  };
  const trending = productsOfType("Industry").slice(0, 12);
  const topPicks = productsOfType("Style").slice(0, 12);
  const newArrivals = productsOfType("Material", "General").slice(0, 12);

  // Stats: real content counts + figures PARSED from globals strings (single
  // source of truth). A failed parse drops the stat rather than hardcoding a
  // number that could drift from content/globals.json.
  const moqMatch = globals.moq.match(/\d+/);
  const slaMatch = globals.sla.match(/(\d+)\s*[–—-]\s*(\d+)/);
  const stats: Stat[] = [
    { value: products.length, label: "Custom products ready to quote" },
    { value: categories.length, label: "Packaging categories" },
    ...(moqMatch
      ? [
          {
            value: Number(moqMatch[0]),
            label: "Box MOQ — smaller pilot runs on request",
          },
        ]
      : []),
    ...(slaMatch
      ? [
          {
            value: Number(slaMatch[2]),
            prefix: `${slaMatch[1]}–`,
            label: "Business days standard production",
          },
        ]
      : []),
  ];

  const faqs = getFaqs().slice(0, 6);
  const posts = getPosts().slice(0, 4);
  const reviews = getReviews();
  const ratingSummary = getRatingSummary();

  const aboutImage =
    getCategory("custom-rigid-boxes")?.imageUrl ?? DEFAULT_OG_IMAGE;
  const sustainabilityImage =
    getCategory("custom-printed-bags")?.imageUrl ?? DEFAULT_OG_IMAGE;
  const processImage =
    getCategory("custom-mailer-boxes")?.imageUrl ??
    getCategory("custom-rigid-boxes")?.imageUrl ??
    DEFAULT_OG_IMAGE;

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      {/* 1 — Hero: Owns the page's single H1. Dark navy theme matching spec. */}
      <Hero
        heading={
          <>
            Custom boxes made<br className="hidden sm:inline" /> easy{" "}
            <span className="text-terra-500">for retail</span>
          </>
        }
        sub={
          <>
            Supercharge your brand through the power of{" "}
            <strong className="font-semibold text-white">custom boxes</strong> and{" "}
            <strong className="font-semibold text-white">custom packaging</strong> that&apos;s
            big on wow-factor. With low minimums, free design expertise, super fast delivery
            and unlimited customization, our packaging specialists will help you create eye-catching{" "}
            <strong className="font-semibold text-white">custom shipping boxes</strong> that stand out from the crowd.
          </>
        }
        primaryCta={{
          label: "Get Free Quote",
          href: "/get-custom-quote/",
        }}
      />

      {/* 2 — Trust strip (paper-50, compact): globals facts + plain-text
            payment methods (no fake badges). Section-owning component. */}
      <TrustBar
        shipping={globals.shipping}
        moq={globals.moq}
        sla={globals.sla}
      />

      {/* 3 — Shop by packaging type (kraft-100). */}
      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="reveal mb-10 grid gap-6 md:mb-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Shop by Packaging Type</p>
              <h2 className="max-w-[16ch]">Find the right packaging faster</h2>
              <p className="lead max-w-[56ch] text-slate-600">
                Start with the category closest to your product. Each path
                groups box styles, materials, and finishes around real shelf,
                shipping, and labeling needs.
              </p>
            </div>
            <Link
              href="/shop/"
              className="press inline-flex h-11 items-center justify-center rounded-md border border-ink-700 px-6 font-display text-base font-semibold text-ink-700 transition-colors duration-200 ease-brand hover:bg-ink-700 hover:text-white"
            >
              Shop all packaging
            </Link>
          </div>

          <div className="reveal-stagger grid gap-4 md:grid-cols-2 md:gap-6">
            {industryCategories.slice(0, 2).map((category) => (
              <div key={category.slug}>
                <CategoryTile
                  category={category}
                  count={productCounts.get(category.slug)}
                />
              </div>
            ))}
          </div>

          <div className="reveal-stagger mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {industryCategories.slice(2).map((category) => (
              <div key={category.slug}>
                <CategoryTile
                  category={category}
                  count={productCounts.get(category.slug)}
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            Not seeing the exact structure?
            {" "}
            <Link
              href="/get-custom-quote/"
              className="text-sm font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
            >
              Send your product details and we will recommend the right shop path.
            </Link>
          </p>
        </div>
      </section>

      {/* 4 — Featured product collections (paper-50): real catalog slices. */}
      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Featured products</p>
            <h2>Explore the collections</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              A slice of the catalog — every style is made to order in your
              exact size, stock, and finish.
            </p>
          </div>
          <Tabs
            ariaLabel="Featured product collections"
            items={[
              {
                id: "trending",
                label: "Trending",
                content: productGrid(trending, categoryNames),
              },
              {
                id: "top-picks",
                label: "Top Picks",
                content: productGrid(topPicks, categoryNames),
              },
              {
                id: "new-arrivals",
                label: "New Arrivals",
                content: productGrid(newArrivals, categoryNames),
              },
            ]}
          />
        </div>
      </section>

      {/* 5 — Process (kraft-100). */}
      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">How it works</p>
            <h2>From box style to doorstep in four steps</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              One team handles structure, artwork, production, and delivery —
              you approve a digital proof before anything prints.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
            <div className="reveal relative overflow-hidden rounded-lg border border-ink-100 bg-white p-4 shadow-e1">
              <Dieline
                className="pointer-events-none absolute -bottom-20 -left-16 w-[300px] text-ink-700 opacity-[0.08]"
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-kraft-100">
                <Image
                  src={processImage}
                  alt="Custom packaging artwork proof and finished box"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 35vw, (min-width: 768px) 60vw, 100vw"
                />
              </div>
              <div className="relative mt-4 grid gap-3">
                {[
                  "Quote reviewed by a packaging specialist",
                  "Artwork prepared for digital proof approval",
                  "Production checked before free delivery",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-ink-100 bg-paper-50 px-4 py-3 text-sm font-semibold text-ink-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <ProcessSteps sla={globals.sla} shipping={globals.shipping} />
          </div>
        </div>
      </section>

      {/* 5.5 — Why order with us tabs (paper-50). */}
      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Why order with us</p>
            <h2>Support, specs, and proof in one place</h2>
            <p className="lead max-w-[56ch] text-slate-600">
              See what is included before you request pricing — from artwork
              help and material choices to real customer feedback.
            </p>
          </div>
          <Tabs
            ariaLabel="Why order with Vital Custom Boxes"
            panelClassName="rounded-b-lg border-x border-b border-ink-100 bg-white p-6 shadow-e1 md:p-8"
            items={[
              {
                id: "why-description",
                label: "Description",
                content: (
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
                    <div className="flex flex-col gap-4 text-slate-600">
                      <h3 className="h4 text-ink-900">
                        Custom packaging built around your product
                      </h3>
                      <p>
                        Vital Custom Boxes helps brands turn a product idea into
                        production-ready packaging. Share your dimensions,
                        quantity, material preferences, and artwork notes, and
                        our team will guide the structure, stock, print, and
                        finishing choices before anything goes to press.
                      </p>
                      <p>
                        Every order includes free design support and a digital
                        proof, so you can approve the look and layout before
                        production begins.
                      </p>
                    </div>
                    <div className="rounded-lg bg-kraft-100 p-5">
                      <p className="font-display text-base font-semibold text-ink-900">
                        Best for
                      </p>
                      <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                        <li>Retail boxes with logo and shelf-ready print</li>
                        <li>Mailer, rigid, food, cosmetic, and gift packaging</li>
                        <li>Brands that need help choosing stock and finish</li>
                      </ul>
                    </div>
                  </div>
                ),
              },
              {
                id: "why-additional-information",
                label: "Additional Information",
                content: (
                  <div className="overflow-hidden rounded-lg border border-ink-100">
                    <table className="w-full border-collapse text-left text-sm">
                      <tbody className="divide-y divide-ink-100">
                        {[
                          ["Materials", "SBS cardstock, kraft, corrugated, rigid board, and eco-friendly stocks"],
                          ["Printing", "CMYK, PMS color matching, inside and outside printing"],
                          ["Finishes", "Matte, gloss, soft touch, foil, embossing, debossing, spot UV, windows"],
                          ["Run size", globals.moq],
                          ["Production", globals.sla],
                          ["Shipping", globals.shipping],
                          ["Proofing", "Digital proof approval before production"],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <th className="w-1/3 bg-kraft-100 px-4 py-3 font-display text-sm font-semibold text-ink-900">
                              {label}
                            </th>
                            <td className="bg-white px-4 py-3 text-slate-600">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                id: "why-reviews",
                label: "Reviews",
                content: (
                  <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr] lg:items-start">
                    <div className="rounded-lg bg-kraft-100 p-5">
                      <p className="font-display text-3xl font-bold text-ink-900">
                        {ratingSummary.ratingValue.toFixed(1)}/5
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink-700">
                        Based on {ratingSummary.reviewCount}+ reviews
                      </p>
                      <Link
                        href="/reviews/"
                        className="mt-4 inline-flex text-sm font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
                      >
                        Read all reviews
                      </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {reviews.slice(0, 2).map((review) => (
                        <blockquote
                          key={`${review.author}-${review.location}`}
                          className="rounded-lg border border-ink-100 bg-white p-5"
                        >
                          <p className="text-sm leading-relaxed text-slate-600">
                            “{review.text}”
                          </p>
                          <footer className="mt-4">
                            <p className="font-display text-sm font-semibold text-ink-900">
                              {review.author}
                            </p>
                            <p className="text-xs text-slate-600">
                              {review.location}
                            </p>
                          </footer>
                        </blockquote>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* 6 — Materials / sustainability split (paper-50): two ImageText rows
            built from short About copy + globals facts. */}
      <section className="section bg-kraft-100">
        <div className="container-hm flex flex-col gap-16 lg:gap-24">
          <ImageText
            image={{
              src: aboutImage,
              alt: "Custom rigid boxes produced by Vital Custom Boxes",
            }}
            eyebrow="Why Vital Custom Boxes"
            title="Support from first dieline to delivered pallet"
            body={`Our in-house design team helps with structural dielines, artwork setup, and print-ready file checks at no extra cost — and you approve a digital proof before anything goes to press.\n\nEvery order runs on one production promise: ${globals.sla}.`}
            cta={{ label: "More about us", href: "/about-us/" }}
            reverse
          />
          <ImageText
            image={{
              src: sustainabilityImage,
              alt: "Kraft custom printed bags with logo",
            }}
            eyebrow="Sustainability"
            title="Better boxes, lighter footprint"
            body={
              "Recyclable kraft stocks, soy-based inks, and right-sized dielines that cut waste before a single sheet is printed. If your brand has eco goals, we spec materials to match.\n\nAsk about recycled and biodegradable stock options when you request your quote."
            }
            cta={{
              label: "Our sustainability approach",
              href: "/sustainability/",
            }}
          />
        </div>
      </section>

      {/* 6.5 — Printing & finishes ("mini-billboard", paper-50). Vital-style
            printing-capability section, restyled in Vital tokens. */}
      <section className="section bg-paper-50">
        <div className="container-hm grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="reveal flex flex-col gap-4">
            <p className="eyebrow">Printing &amp; finishes</p>
            <h2>We turn every box into a mini-billboard</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              Advanced offset and digital printing with CMYK and PMS colour
              matching makes your logo, brand colours, and artwork land with
              vivid precision on cardboard, kraft, corrugated, or rigid stock.
            </p>
            <p className="max-w-[52ch] text-slate-600">
              Add premium finishing — foil, embossing, spot UV, soft-touch — and
              every box becomes a branding tool that keeps selling long after the
              unboxing.
            </p>
            <div>
              <Link
                href="/get-custom-quote/"
                className="press mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-terra-500 px-6 font-display text-base font-semibold text-ink-900 transition-colors duration-200 ease-brand hover:bg-ink-700 hover:text-white"
              >
                Discuss your print options
              </Link>
            </div>
          </div>
          <ul className="reveal-stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                t: "Offset & digital printing",
                d: "Short pilot runs to high-volume — matched to your quantity.",
              },
              {
                t: "CMYK + PMS colour",
                d: "Brand-accurate colour matching on every material.",
              },
              {
                t: "Foil stamping",
                d: "Gold, silver, and holographic foil for a premium shelf pop.",
              },
              {
                t: "Embossing & debossing",
                d: "Raised or recessed logos that add a tactile, luxe feel.",
              },
              {
                t: "Spot UV & lamination",
                d: "Glossy, matte, or soft-touch surfaces and accents.",
              },
              {
                t: "Windows, inserts & eco inks",
                d: "PVC windows, custom inserts, and soy-based sustainable inks.",
              },
            ].map((cap) => (
              <li
                key={cap.t}
                className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1"
              >
                <p className="font-display text-base font-semibold text-ink-900">
                  {cap.t}
                </p>
                <p className="mt-1 text-sm text-slate-600">{cap.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7 — Stats band (section-owning: .dark-section .section-compact).
            Real counts + globals-parsed figures only (no default stats). */}
      <StatsRow stats={stats} />

      {/* 8 — Reviews (section-owning, paper-50). Placeholder data stays
            flagged; ReviewWall renders the verification note with the REAL
            Trustpilot profile link (audit: no fabricated rating strip). */}
      <ReviewWall reviews={reviews} trustpilotUrl={globals.social.trustpilot} />

      {/* 9 — Materials teaser (kraft-100): comparison matrix → /materials. */}
      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">Materials</p>
            <h2>Compare packaging materials</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              The four stocks behind most projects — and where each one earns
              its place.
            </p>
          </div>
          <div className="reveal">
            <ComparisonTable
              caption="Comparison of packaging materials by best use, look and feel, and strength"
              columns={["Cardstock (SBS)", "Kraft", "Corrugated", "Rigid board"]}
              rows={[
                {
                  label: "Best for",
                  values: [
                    "Retail & cosmetic boxes",
                    "Eco-minded brands, food & gifting",
                    "Mailers, shipping & pizza boxes",
                    "Luxury & gift packaging",
                  ],
                },
                {
                  label: "Look & feel",
                  values: [
                    "Smooth, premium print surface",
                    "Natural, earthy texture",
                    "Fluted wall, utilitarian",
                    "Thick, premium hand-feel",
                  ],
                },
                {
                  label: "Strength",
                  values: [
                    "Light-duty",
                    "Light-duty",
                    "Heavy-duty",
                    "Maximum protection",
                  ],
                },
              ]}
            />
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/materials/"
              className="text-sm font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
            >
              Read the full materials guide
            </Link>
          </p>
        </div>
      </section>

      {/* 10 — Latest from the blog (paper-50). */}
      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
            <p className="eyebrow">From the blog</p>
            <h2>Packaging insights &amp; guides</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              Sizing charts, material guides, and design tips — learn before
              you print.
            </p>
          </div>
          <div className="reveal-stagger grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <div key={post.slug} className="h-full">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/blog/"
              className="text-sm font-semibold text-terra-600 underline underline-offset-4 transition-colors duration-150 ease-brand hover:text-terra-500"
            >
              Visit the blog
            </Link>
          </p>
        </div>
      </section>

      {/* 11 — FAQ (section-owning; kraft via className): the page's ONE FAQ
            block; the JSON-LD at the top of the page uses exactly these items. */}
      <FAQAccordion faqs={faqs} className="bg-kraft-100" />

      {/* 12 — CTA band: always the last section before the footer. */}
      <CTABand
        heading="Ready to build packaging that sells?"
        sub="Tell us your size, stock, and quantity — we reply with wholesale pricing, typically within one business day."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
