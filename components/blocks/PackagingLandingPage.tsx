import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/blocks/PageHero';
import { CTABand } from '@/components/patterns/CTABand';
import { ProductCard } from '@/components/patterns/ProductCard';
import { SpecTable } from '@/components/patterns/SpecTable';
import { FAQAccordion } from '@/components/patterns/FAQAccordion';
import { Button } from '@/components/ui/button';
import { getCategory, getGlobals, getPosts } from '@/lib/content';
import { getPublicProducts } from '@/lib/public-products';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/lib/seo';
import { selectPackagingPosts } from '@/lib/packaging-seo';
import type { PackagingLanding } from '@/lib/packaging-landings';

export async function PackagingLandingPage({ page }: { page: PackagingLanding }) {
  const globals = getGlobals();
  const catalog = await getPublicProducts();
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  const products = page.productSlugs.flatMap((slug) => {
    const product = bySlug.get(slug);
    return product ? [product] : [];
  });
  const hero = bySlug.get(page.heroProduct) ?? products[0];
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop/' },
    { name: page.title, href: `/${page.slug}/` },
  ];
  // No category parameter: these topics are not CMS category IDs.
  const quoteHref = `/get-custom-quote/?notes=${encodeURIComponent(`Packaging interest: ${page.title}\nSource page: /${page.slug}/`)}`;
  const posts = selectPackagingPosts(getPosts(), page.blogSlugs ?? []);
  const faqs = [
    ...page.faqs.slice(0, 3),
    { question: `What is the minimum order for ${page.title.toLowerCase()}?`, answer: `Our minimum-order guidance is ${globals.moq}. Share your preferred quantity, size and printing needs so the available run size and pricing can be confirmed.` },
    { question: `What are the US shipping and production terms for ${page.title.toLowerCase()}?`, answer: `${globals.shipping}. ${globals.sla}. Production and transit are separate stages. Include your US delivery ZIP code, required arrival date and any special delivery requirements so the schedule and shipping terms can be confirmed.` },
  ];
  const relatedLinks = page.related.filter((link) => {
    if (link.href === `/${page.slug}/`) return false;
    if (!link.href.startsWith('/shop/')) return true;
    const categorySlug = link.href.split('/')[2];
    return Boolean(getCategory(categorySlug));
  });

  return (
    <>
      <JsonLd data={[
        breadcrumbSchema(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href }))),
        faqSchema(faqs),
      ]} />
      <PageHero
        title={page.h1 ?? page.title}
        lead={page.description}
        crumbs={crumbs}
        image={hero ? { src: hero.imageUrl, alt: hero.imageAlt ?? `${hero.name} packaging example` } : undefined}
      >
        <div className="mt-6 flex flex-col gap-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
            <li>Free design support</li>
            <li>Digital proof before printing</li>
            <li>{globals.shipping}</li>
            <li>MOQ: {globals.moq}</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button href={quoteHref} variant="primary" size="md">Get a Custom Quote</Button>
            <Button href={globals.phoneHref} variant="secondary" size="md">Call {globals.phone}</Button>
          </div>
        </div>
      </PageHero>

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex max-w-[65ch] flex-col gap-3">
            <p className="eyebrow">Explore the catalog</p>
            <h2>Compare {page.title} Options</h2>
            <p className="text-slate-600">Compare these packaging examples, then request the construction, sizing and print options for your product and US delivery requirements.</p>
          </div>
          {products.length ? (
            <div className="grid gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} categoryName={getCategory(product.category)?.name ?? 'Custom Packaging'} />
              ))}
            </div>
          ) : (
            <p className="text-slate-600">Contact us to discuss available packaging options for your requirements.</p>
          )}
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <p className="eyebrow">Plan your packaging</p>
            <h2>Choosing {page.title} for Your Product</h2>
            <p className="max-w-[65ch] text-slate-600">{page.intro}</p>
            <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
              <h3 className="h4 mb-3">What to include in your quote request</h3>
              <ul className="list-disc space-y-3 pl-5 text-sm text-slate-600">
                {page.guide.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <nav aria-label="Packaging planning resources" className="mt-5 flex flex-wrap gap-5">
                <Link href="/materials/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Compare Packaging Materials</Link>
                <Link href="/how-it-works/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Custom Packaging Order Process</Link>
                <Link href="/shipping-policy/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">US Shipping Policy</Link>
              </nav>
            </div>
            <p className="text-slate-600">Free design support and a digital proof before printing. {globals.sla}. {globals.shipping}. Include your US delivery ZIP code and arrival deadline. Production time and shipping transit are separate stages; final run size, specifications and delivery terms are confirmed with your quote.</p>
            <div><Button href={quoteHref} variant="primary" size="md">Discuss Your Packaging</Button></div>
          </div>
          <SpecTable caption={`${page.title} specifications`} globals={globals} rows={page.specs} />
        </div>
      </section>

      <section className="section bg-paper-50">
        <div className="container-hm">
          <h2>Related Box Styles and Materials</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white p-5 font-semibold text-ink-900 shadow-e1 hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                {link.name}<ArrowRight size={18} className="shrink-0 text-terra-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {(
            <div className="mt-12">
              <h2 className="h3">Packaging guides</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {posts.map((post) => <li key={post.slug}><Link href={`/blog/${post.slug}/`} className="font-semibold text-ink-900 underline underline-offset-4">{post.title}</Link></li>)}
              </ul>
              <nav aria-label="Packaging planning resources" className="mt-5 flex flex-wrap gap-5">
                <Link href="/materials/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Compare Packaging Materials</Link>
                <Link href="/how-it-works/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Custom Packaging Order Process</Link>
                <Link href="/shipping-policy/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">US Shipping Policy</Link>
              </nav>
            </div>
          )}
        </div>
      </section>
      <FAQAccordion faqs={faqs} className="bg-kraft-100" />
      <CTABand defaultSpecs={{ notes: `Packaging interest: ${page.title}\nSource page: /${page.slug}/` }} heading={`Request your ${page.title.toLowerCase()} quote`} sub="Send your dimensions, quantity, artwork requirements and US delivery ZIP code." phone={globals.phone} phoneHref={globals.phoneHref} />
    </>
  );
}
