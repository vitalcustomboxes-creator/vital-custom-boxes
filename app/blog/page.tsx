/**
 * /blog/ — blog index (owner: BE-2).
 * BlogCard grid from content/posts.json (16 posts, newest first via getPosts).
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { BlogCard } from "@/components/patterns/BlogCard";
import { CTABand } from "@/components/patterns/CTABand";
import { Reveal } from "@/components/ui";
import { getGlobals, getPosts } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/blog"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/blog/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog/" },
];

export default function BlogIndexPage() {
  const globals = getGlobals();
  const posts = getPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Sizing charts, material trade-offs, finish guides — what we've learned printing boxes, written down so you order right the first time."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <Reveal as="div" stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.slug} className="h-full">
                <BlogCard post={post} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CTABand
        heading="Done reading, ready to print?"
        sub="Bring what you learned to a free quote — we'll handle the rest."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
