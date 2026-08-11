/**
 * TOC — Server Component (FE-3). Table of contents for long-form pages
 * (blog posts, policies). Pure render from a `headings` prop — the page
 * derives ids/text when it renders the body (anchors must exist in-page).
 * Sticky positioning is the page's concern (e.g. lg:sticky lg:top-24).
 */
import { cn } from '@/lib/utils';

export interface TocHeading {
  /** In-page anchor id (without '#'). */
  id: string;
  text: string;
  /** Heading depth — 3 renders indented under 2. Default 2. */
  level?: 2 | 3;
}

export interface TOCProps {
  headings: TocHeading[];
  title?: string;
  className?: string;
}

export function TOC({ headings, title = 'On this page', className }: TOCProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-lg border border-ink-100 bg-white p-5', className)}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink-900">
        {title}
      </p>
      <ol className="mt-3 flex flex-col border-l border-ink-100">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block border-l-2 border-transparent py-1.5 pr-2 text-sm text-slate-600 transition-colors duration-150 ease-brand hover:border-terra-500 hover:text-terra-600',
                h.level === 3 ? 'pl-8' : 'pl-4',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TOC;
