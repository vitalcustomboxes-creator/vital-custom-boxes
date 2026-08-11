/**
 * /blog/[slug]/ — blog post (owner: BE-2). 16 posts from content/posts.json.
 *
 * - Title pattern per KEYWORD_META_MAP §6: `<Post Title> | Vital Custom Boxes`
 *   when ≤60 chars, else the post title alone, word-boundary-truncated.
 * - Article JSON-LD as a manual object (author/publisher = the Organization —
 *   posts carry no real person byline; nothing is invented).
 * - Body renders "\n\n"-separated paragraphs; lines starting with "## " become
 *   anchored <h2>s feeding the TOC. Current bodies are DATA-ENG's flagged
 *   "TODO-migrate" placeholders (no headings yet) — TOC renders null until the
 *   live copy is migrated (it renders headings automatically once present).
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/blocks/PageHero";
import { AuthorBox } from "@/components/patterns/AuthorBox";
import { BlogCard } from "@/components/patterns/BlogCard";
import { CTABand } from "@/components/patterns/CTABand";
import { TOC, type TocHeading } from "@/components/patterns/TOC";
import { getGlobals, getPost, getPosts } from "@/lib/content";
import { formatDate, readingTime } from "@/lib/utils";
import {
  breadcrumbSchema,
  buildBlogTitle,
  buildMetadata,
  JsonLd,
  ORG_LOGO_URL,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
  truncateAtWordBoundary,
  type JsonLdObject,
} from "@/lib/seo";
import type { Post } from "@/lib/types";

interface BlogPostParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: buildBlogTitle(post.title),
    description: truncateAtWordBoundary(post.excerpt, 160),
    path: `/blog/${post.slug}/`,
    ogImage: post.imageUrl,
    ogType: "article",
  });
}

/* ---------------------- body parsing (paragraphs + h2) --------------------- */

type BodyBlock = { type: "h2"; id: string; text: string } | { type: "p"; text: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseBody(body: string): { blocks: BodyBlock[]; headings: TocHeading[] } {
  const blocks: BodyBlock[] = [];
  const headings: TocHeading[] = [];
  for (const raw of body.split(/\n\n+/)) {
    const text = raw.trim();
    if (!text) continue;
    if (text.startsWith("## ")) {
      const headingText = text.slice(3).trim();
      const id = slugify(headingText) || `section-${headings.length + 1}`;
      blocks.push({ type: "h2", id, text: headingText });
      headings.push({ id, text: headingText, level: 2 });
    } else {
      blocks.push({ type: "p", text });
    }
  }
  return { blocks, headings };
}

/** Article JSON-LD — organization byline; no invented authors/ratings. */
function articleSchema(post: Post): JsonLdObject {
  const orgRef = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: ORG_LOGO_URL },
  };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: truncateAtWordBoundary(post.excerpt, 160),
    image: [toAbsoluteUrl(post.imageUrl)],
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: orgRef,
    publisher: orgRef,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(`/blog/${post.slug}/`),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const globals = getGlobals();
  const { blocks, headings } = parseBody(post.body);
  const related = getPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog/" },
    { name: post.title, href: `/blog/${post.slug}/` },
  ];
  const date = formatDate(post.publishedAt);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href })))}
      />
      <JsonLd data={articleSchema(post)} />

      <PageHero title={post.title} crumbs={crumbs}>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {date ? (
            <>
              <time dateTime={post.publishedAt}>{date}</time>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>{readingTime(post.body)}</span>
          <span aria-hidden="true">·</span>
          <span>By the {SITE_NAME} team</span>
        </p>
      </PageHero>

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="max-w-[72ch]">
            <div className="relative mb-8 aspect-[1440/440] overflow-hidden rounded-lg border border-ink-100 bg-kraft-100">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                className="object-contain"
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
            </div>

            {blocks.map((block, i) =>
              block.type === "h2" ? (
                <h2 key={block.id} id={block.id} className="mb-4 mt-10 scroll-mt-24">
                  {block.text}
                </h2>
              ) : (
                <p key={`p-${i}`} className="mb-5 leading-relaxed text-slate-600">
                  {block.text}
                </p>
              ),
            )}

            <div className="mt-12">
              <AuthorBox />
            </div>
          </article>

          <aside className="hidden lg:block">
            {/* Renders only once migrated bodies contain "## " headings. */}
            <TOC headings={headings} className="lg:sticky lg:top-24" />
          </aside>
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">Keep reading</span>
            <h2>More from the blog</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <div key={p.slug} className="h-full">
                <BlogCard post={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        heading="Put the theory in a box"
        sub="Get a free quote with design support, free design support, and free US shipping."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
