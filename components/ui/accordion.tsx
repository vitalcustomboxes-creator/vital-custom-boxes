"use client";

/**
 * components/ui/accordion.tsx — Accordion primitive (FE-1). DESIGN_SPEC §5.9.
 * - single-open (default, FAQ) or multiple (drawer subgroups) modes.
 * - Heading wraps the trigger: <h3 class="contents"><button aria-expanded
 *   aria-controls>; panel role="region" aria-labelledby (spec §3).
 * - Panel toggles `hidden` — height change is INSTANT per the motion rule;
 *   chevron rotates via `.chevron` + [aria-expanded]; content fades with
 *   `.anim-fade-in` (replays on display:none → block).
 * - Item `id` is the stable key FE-3/SEO-2 use to pair FAQPage JSON-LD:
 *   trigger = `${id}-trigger`, panel = `${id}-panel`.
 */
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "./cn";

export interface AccordionItem {
  /** Stable id (FAQ schema pairing). DOM ids derive: `${id}-trigger/-panel`. */
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single": opening one closes others (FAQ). "multiple": independent. */
  mode?: "single" | "multiple";
  defaultOpenIds?: string[];
  /** Semantic heading level wrapping each trigger (default h3). */
  headingLevel?: 2 | 3 | 4;
  onOpenChange?: (openIds: string[]) => void;
  className?: string;
}

export function Accordion({
  items,
  mode = "single",
  defaultOpenIds = [],
  headingLevel = 3,
  onOpenChange,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() =>
    mode === "single" ? defaultOpenIds.slice(0, 1) : defaultOpenIds
  );
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      const next =
        mode === "single"
          ? isOpen
            ? []
            : [id]
          : isOpen
            ? current.filter((openId) => openId !== id)
            : [...current, id];
      onOpenChange?.(next);
      return next;
    });
  };

  return (
    <div className={cx("divide-y divide-ink-100 border-y border-ink-100", className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id);
        const triggerId = `${item.id}-trigger`;
        const panelId = `${item.id}-panel`;
        return (
          <div key={item.id}>
            <Heading className="contents">
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-[44px] w-full items-center justify-between gap-4 py-5 text-left font-display text-[17px] font-semibold text-ink-900 transition-colors duration-150 ease-brand hover:text-terra-600"
              >
                {item.title}
                <ChevronDown
                  size={20}
                  className="chevron shrink-0 text-slate-600"
                  aria-hidden="true"
                />
              </button>
            </Heading>
            <div
              role="region"
              id={panelId}
              aria-labelledby={triggerId}
              hidden={!open}
            >
              <div className="anim-fade-in pb-5 pr-10 text-slate-600">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
