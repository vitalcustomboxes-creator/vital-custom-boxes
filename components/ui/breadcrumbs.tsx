/**
 * components/ui/breadcrumbs.tsx — Breadcrumbs primitive (FE-1). DESIGN_SPEC §5.8.
 * Server-compatible. Renders NOTHING for fewer than 2 items.
 * ≤480px: keeps the first + last two crumbs, middle collapses to "…" (CSS-only).
 * BreadcrumbList JSON-LD comes from lib/seo.ts (SEO-2) — visual only here.
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cx } from "./cn";

/**
 * `label` is the canonical key (task contract); `name` is accepted as an
 * alias because BreadcrumbList JSON-LD (lib/seo, SEO-2) and the BE page
 * crumbs use schema.org's `name` — one object can feed both.
 */
export type BreadcrumbItem = {
  /** Optional on the last (current) item — it renders as text, not a link. */
  href?: string;
} & ({ label: string; name?: string } | { name: string; label?: string });

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** nav aria-label, default "Breadcrumb". */
  ariaLabel?: string;
}

function Separator() {
  return (
    <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
  );
}

export function Breadcrumbs({
  items,
  className,
  ariaLabel = "Breadcrumb",
}: BreadcrumbsProps) {
  if (items.length < 2) return null;

  // Collapse rule (≤480): first crumb + … + last two. Middle items get
  // `hidden min-[480px]:flex`; the ellipsis only shows below 480.
  const collapses = items.length > 3;
  const lastIndex = items.length - 1;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const text = item.label ?? item.name;
          const isCurrent = index === lastIndex;
          const isCollapsible = collapses && index > 0 && index < lastIndex - 1;

          return (
            <li
              key={`${text}-${index}`}
              className={cx(
                "flex min-w-0 items-center gap-1.5",
                isCollapsible && "hidden min-[480px]:flex"
              )}
            >
              {index > 0 ? <Separator /> : null}
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="line-clamp-1 font-semibold text-ink-900"
                >
                  {text}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-slate-600 transition-colors duration-150 ease-brand hover:text-terra-600"
                >
                  {text}
                </Link>
              ) : (
                <span className="whitespace-nowrap text-slate-600">{text}</span>
              )}
              {/* Mobile ellipsis sits right after the first crumb. */}
              {collapses && index === 0 ? (
                <span
                  className="flex items-center gap-1.5 min-[480px]:hidden"
                  aria-hidden="true"
                >
                  <Separator />
                  <span className="text-slate-400">…</span>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
