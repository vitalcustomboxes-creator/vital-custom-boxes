/**
 * BlogCard — Server Component (FE-3). DESIGN_SPEC §6.17.
 *
 * Equal-height card (h-full flex column, footer pinned via mt-auto),
 * banner-ratio media for wide blog artwork, stretched title link (one tab
 * stop), word-boundary truncation via line-clamp only. Grid recipe:
 * grid gap-6 md:grid-cols-2 lg:grid-cols-3 inside <Reveal stagger>
 * (cells are the stagger children).
 */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { cn, formatDate, readingTime } from '@/lib/utils';
import type { Post } from '@/lib/types';

export interface BlogCardProps {
  post: Post;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  const date = formatDate(post.publishedAt);

  return (
    <article
      className={cn(
        'group card-lift relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-e1 transition-[border-color,box-shadow,transform] duration-300 ease-brand hover:border-terra-200 hover:shadow-e3',
        'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--focus-ring-color)]',
        className,
      )}
    >
      <div className="card-media relative aspect-[1440/440] overflow-hidden border-b border-ink-100 bg-kraft-100">
        <Image
          src={post.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain transition-transform duration-500 ease-brand group-hover:scale-[1.025]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={2} aria-hidden="true" />
              <time dateTime={post.publishedAt}>{date}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} strokeWidth={2} aria-hidden="true" />
            {readingTime(post.body)}
          </span>
        </div>

        <h3 className="h4 line-clamp-2 text-pretty text-ink-900 transition-colors duration-200 ease-brand group-hover:text-terra-600">
          <Link
            href={`/blog/${post.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>

        <div className="mt-auto flex min-h-11 items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <span className="text-sm font-semibold text-terra-600 transition-colors duration-200 ease-brand group-hover:text-terra-500">
            Read article
          </span>
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-100 bg-paper-50 text-ink-900 transition-[background-color,border-color,color,transform] duration-200 ease-brand group-hover:translate-x-1 group-hover:border-terra-500 group-hover:bg-terra-500 group-hover:text-white"
          >
            <ArrowRight size={18} strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
