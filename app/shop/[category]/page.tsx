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
import { Button } from '@/components/ui/button';
import { getCategories, getCategory, getFaqs, getGlobals, getPosts } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { CATEGORY_PACKAGING_SEO, packagingTopicLinks, selectPackagingPosts } from "@/lib/packaging-seo";
import { breadcrumbSchema, buildMetadata, buildPageTitle, CATEGORY_META, faqSchema, JsonLd, truncateAtWordBoundary } from "@/lib/seo";

interface CategoryPageProps { params: Promise<{ category: string }> }
const HERO_FALLBACKS: Record<string, string> = {
  "custom-boxes": "/img/hm/wp-content/uploads/2025/11/Custom-Product-Packaging-Boxes.webp",
};
const DEFAULT_SPECS = [
  { label: "Materials", value: "Stock and board construction confirmed for your product and intended use." },
  { label: "Styles", value: "Available structures reviewed against the contents and handling requirements." },
  { label: "Sizes", value: "Internal dimensions confirmed with the packed product and any inserts." },
  { label: "Printing", value: "Logo and supplied artwork; coverage depends on stock and printing method." },
  { label: "Finishes", value: "Ask about coatings and finishing options for the selected structure." },
];
function GuidanceCard({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
    <h3 className="h4 mb-3">{title}</h3>
    <ul className="flex flex-col gap-2 text-sm text-slate-600">{items.map((item) => (
      <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terra-500" /><span>{item}</span></li>
    ))}</ul>
  </div>;
}
export const dynamicParams = false;
export function generateStaticParams() { return getCategories().map((category) => ({ category: category.slug })); }
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const meta = CATEGORY_PACKAGING_SEO[slug] ?? CATEGORY_META[slug] ?? {
    title: buildPageTitle(category.name), description: truncateAtWordBoundary(category.description, 160), h1: category.name,
  };
  return buildMetadata({ title: meta.title, description: meta.description, path: `/shop/${slug}/`, ogImage: HERO_FALLBACKS[slug] ?? category.imageUrl });
}
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const globals = getGlobals();
  const categories = getCategories();
  const allProducts = await getPublicProducts();
  const products = allProducts.filter((product) => product.category === slug);
  const seo = CATEGORY_PACKAGING_SEO[slug];
  const h1 = seo?.h1 ?? CATEGORY_META[slug]?.h1 ?? category.name;
  const quoteHref = `/get-custom-quote/?category=${encodeURIComponent(slug)}&notes=${encodeURIComponent(`Packaging interest: ${category.name}\nSource page: /shop/${slug}/`)}`;
  const faqs = seo ? [
    ...(category.faqs ?? []).slice(0, 2),
    { question: `What is the minimum order for ${category.name.toLowerCase()}?`, answer: `Our minimum-order guidance is ${globals.moq}. Available run sizes depend on the structure, stock and customization. Include your preferred quantity with your quote request.` },
    { question: `Can I order ${category.name.toLowerCase()} for delivery in the USA?`, answer: `${globals.shipping}. Share your delivery ZIP code and any special delivery requirements so the destination and shipping terms can be confirmed with your quote.` },
    { question: `How long does production take for ${category.name.toLowerCase()}?`, answer: `${globals.sla}. Production and shipping transit are separate stages. Include your required arrival date and ZIP code so the schedule can be confirmed before ordering.` },
  ] : category.faqs?.length ? category.faqs : getFaqs().slice(0, 5);
  const relatedSlugs = seo?.relatedSlugs ?? [];
  const preferredCategories = relatedSlugs.flatMap((target) => {
    const item = categories.find((candidate) => candidate.slug === target && candidate.slug !== slug);
    return item ? [item] : [];
  });
  const seen = new Set([slug, ...preferredCategories.map((item) => item.slug)]);
  const siblings = [...preferredCategories, ...categories.filter((item) => !seen.has(item.slug)).sort((a, b) => Number(b.type === category.type) - Number(a.type === category.type))].slice(0, 4);
  const topicLinks = packagingTopicLinks(relatedSlugs);
  const relatedPosts = selectPackagingPosts(getPosts(), seo?.blogSlugs ?? []);
  const soapProduct = slug === "custom-cosmetics-boxes" ? products.find((product) => product.slug === "custom-soap-boxes") : undefined;
  const crumbs = [{ name: "Home", href: "/" }, { name: "Shop", href: "/shop/" }, { name: category.name, href: `/shop/${slug}/` }];
  return <>
    <JsonLd data={[breadcrumbSchema(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href }))), ...(faqs.length ? [faqSchema(faqs)] : [])]} />
    <PageHero title={h1} lead={category.description} crumbs={crumbs} image={{ src: HERO_FALLBACKS[slug] ?? category.imageUrl, alt: `${category.name} packaging example` }}>
      <div className="mt-6 flex flex-col gap-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
          <li>Free design support</li><li>Digital proof before printing</li><li>{globals.shipping}</li><li>MOQ: {globals.moq}</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button href={quoteHref} variant="primary" size="md">Get a Custom Quote</Button>
          <Button href={globals.phoneHref} variant="secondary" size="md">Call {globals.phone}</Button>
        </div>
      </div>
      {category.regulated ? <div role="note" className="mt-6 flex max-w-[75ch] items-start gap-3 rounded-lg border border-ink-100 bg-white p-4 text-sm text-slate-600"><Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>{globals.complianceDisclaimer}</p></div> : null}
    </PageHero>
    <section className="section bg-paper-50" aria-labelledby="category-products-heading">
      <div className="container-hm">
        <div className="reveal mb-10 flex flex-col gap-3 md:mb-12">
          <p className="eyebrow">Products</p><h2 id="category-products-heading">Explore {category.name}</h2>
          <p className="lead max-w-[65ch] text-slate-600">{products.length} made-to-order {products.length === 1 ? "style" : "styles"}. Compare structures, dimensions and printing options for your product.</p>
        </div>
        {products.length ? <div className="reveal-stagger grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">{products.map((product) => <div key={product.slug} className="h-full"><ProductCard product={product} categoryName={category.name} /></div>)}</div> : <p>Send your requirements to discuss available packaging options.</p>}
        <div className="reveal mt-10 rounded-lg border border-ink-100 bg-kraft-100 p-6 shadow-e1 md:mt-12 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3"><p className="eyebrow">Quote support</p><h2 className="h3">Plan Your {category.name} Order</h2><p className="max-w-[65ch] text-slate-600">Send your packed product dimensions, quantity, stock preferences and artwork notes. Include your US delivery ZIP code and required arrival date for a custom quote.</p><p className="text-sm text-slate-600">Free design support and a digital proof before production. {globals.shipping}.</p></div>
            <div className="flex flex-col gap-3 min-[480px]:flex-row lg:flex-col"><Button href={quoteHref} variant="primary" size="md">Get a Quote</Button><Button href={globals.phoneHref} variant="secondary" size="md">Call {globals.phone}</Button></div>
          </div>
        </div>
      </div>
    </section>
    <section className="section bg-kraft-100" aria-labelledby="category-guide-heading">
      <div className="container-hm grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="reveal flex flex-col gap-4"><p className="eyebrow">Buyer guide</p><h2 id="category-guide-heading">Choosing {category.name} for Your Product</h2><p className="max-w-[65ch]">{category.intro ?? category.description}</p>
          <p className="max-w-[65ch] text-slate-600">Pricing depends on dimensions, material, structure, print coverage, finishing and quantity. Provide your logo and approved text, then review the final specification and digital proof before production.</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2"><GuidanceCard title="Packaging options" items={category.highlights} /><GuidanceCard title="Before requesting a quote" items={category.buyersGuide} /></div>
          {soapProduct ? <p className="text-sm text-slate-600">Packaging soap bars? Compare <Link href={`/shop/${soapProduct.category}/${soapProduct.slug}/`} className="font-semibold underline underline-offset-4">custom soap boxes</Link> for bar dimensions, wrapping and printed artwork.</p> : null}
        </div>
        <div className="reveal"><SpecTable caption={`${category.name} specifications at a glance`} globals={globals} rows={seo?.specs ?? DEFAULT_SPECS} /></div>
      </div>
    </section>
    <section className="section bg-paper-50" aria-labelledby="related-packaging-heading">
      <div className="container-hm">
        <div className="reveal mb-10 flex flex-col gap-3 md:mb-12"><p className="eyebrow">Keep exploring</p><h2 id="related-packaging-heading">Related Packaging Options</h2></div>
        <div className="reveal-stagger grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{siblings.map((sibling) => <div key={sibling.slug}><CategoryTile category={sibling} count={allProducts.filter((product) => product.category === sibling.slug).length} /></div>)}</div>
        {topicLinks.length ? <nav aria-label="Related packaging materials and shipping" className="mt-6 flex flex-wrap gap-4">{topicLinks.map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center font-semibold text-ink-900 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{link.name}</Link>)}</nav> : null}
        <div className="mt-12"><h2 className="h3">Packaging Guides</h2><ul className="mt-5 grid gap-4 md:grid-cols-2">
          {relatedPosts.map((post) => <li key={post.slug}><Link href={`/blog/${post.slug}/`} className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white p-5 font-semibold text-ink-900 shadow-e1 hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><span>{post.title}</span><ArrowRight size={18} aria-hidden="true" className="shrink-0 text-terra-600" /></Link></li>)}
          <li><Link href="/materials/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Compare Packaging Materials</Link></li>
          <li><Link href="/how-it-works/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Custom Packaging Order Process</Link></li>
        </ul></div>
      </div>
    </section>
    <FAQAccordion faqs={faqs} className="bg-kraft-100" />
    <CTABand defaultSpecs={{ notes: `Packaging interest: ${category.name}\nSource page: /shop/${slug}/` }} heading={`Request Your ${category.name} Quote`} sub="Send your product dimensions, quantity, artwork requirements and US delivery ZIP code." phone={globals.phone} phoneHref={globals.phoneHref} />
  </>;
}
