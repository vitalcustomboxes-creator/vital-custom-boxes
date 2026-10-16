import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/blocks/PageHero';
import { CTABand } from '@/components/patterns/CTABand';
import { ProductCard } from '@/components/patterns/ProductCard';
import { SpecTable } from '@/components/patterns/SpecTable';
import { FAQAccordion } from '@/components/patterns/FAQAccordion';
import { Button } from '@/components/ui';
import { getCategory, getGlobals, getPosts } from '@/lib/content';
import { getPublicProducts } from '@/lib/public-products';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/lib/seo';
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
  const quoteHref = '/get-custom-quote/';
  const blogPattern = new RegExp(page.blogPattern, 'i');
  const posts = getPosts().filter((post) => blogPattern.test(`${post.title} ${post.slug}`)).slice(0, 2);

  return (
    <>
      <JsonLd data={[
        breadcrumbSchema(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href }))),
        faqSchema(page.faqs),
      ]} />
      <PageHero
        title={page.title}
        lead={page.description}
        crumbs={crumbs}
        image={hero ? { src: hero.imageUrl, alt: `${page.title} packaging example` } : undefined}
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
            <p className="eyebrow">Explore the catalogue</p>
            <h2>Related packaging options</h2>
            <p className="text-slate-600">Compare these examples, then confirm the construction and specifications for your intended use with a custom quote.</p>
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
            <h2>Choosing your {page.title.toLowerCase()}</h2>
            <p className="max-w-[65ch] text-slate-600">{page.intro}</p>
            <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
              <h3 className="h4 mb-3">What to include in your quote request</h3>
              <ul className="list-disc space-y-3 pl-5 text-sm text-slate-600">
                {page.guide.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <p className="text-slate-600">Free design support and a digital proof before printing. {globals.sla}. {globals.shipping}. Final run size, specifications and delivery terms are confirmed with your quote.</p>
            <div><Button href={quoteHref} variant="primary" size="md">Discuss Your Packaging</Button></div>
          </div>
          <SpecTable caption={`${page.title} specifications`} globals={globals} rows={page.specs} />
        </div>
      </section>

      <section className="section bg-paper-50">
        <div className="container-hm">
          <h2>More packaging options</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.related.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white p-5 font-semibold text-ink-900 shadow-e1 hover:border-slate-400">
                {link.name}<ArrowRight size={18} className="shrink-0 text-terra-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {posts.length ? (
            <div className="mt-12">
              <h2 className="h3">Packaging guides</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {posts.map((post) => <li key={post.slug}><Link href={`/blog/${post.slug}/`} className="font-semibold text-ink-900 underline underline-offset-4">{post.title}</Link></li>)}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
      <FAQAccordion faqs={page.faqs} className="bg-kraft-100" />
      <CTABand heading={`Request your ${page.title.toLowerCase()} quote`} sub="Send your dimensions, quantity, intended use and artwork requirements." phone={globals.phone} phoneHref={globals.phoneHref} />
    </>
  );
}
