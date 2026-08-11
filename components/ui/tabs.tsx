"use client";

/**
 * components/ui/tabs.tsx — Tabs primitive (FE-1). DESIGN_SPEC §5.10.
 * tablist/tab/tabpanel roles, arrow-key roving tabindex (Left/Right/Home/End,
 * wrap-around, selection follows focus), aria-selected styling via Tailwind's
 * aria-selected: variant. Panel re-mounts with .anim-fade-in on switch.
 * Item ids derive DOM ids: `${id}-tab` / `${id}-panel`.
 */
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  /** Accessible name for the tablist. */
  ariaLabel?: string;
  onTabChange?: (id: string) => void;
  className?: string;
  /** Extra classes for the active tabpanel. */
  panelClassName?: string;
}

export function Tabs({
  items,
  defaultTabId,
  ariaLabel,
  onTabChange,
  className,
  panelClassName,
}: TabsProps) {
  const enabled = items.filter((item) => !item.disabled);
  const [activeId, setActiveId] = useState<string | undefined>(
    defaultTabId ?? enabled[0]?.id ?? items[0]?.id
  );
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  if (items.length === 0) return null;
  const active = items.find((item) => item.id === activeId) ?? items[0];

  const select = (id: string, focus = false) => {
    setActiveId(id);
    onTabChange?.(id);
    if (focus) tabRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = enabled.findIndex((item) => item.id === active.id);
    if (currentIndex === -1 || enabled.length === 0) return;
    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(enabled[nextIndex].id, true);
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto border-b border-ink-100"
      >
        {items.map((item) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${item.id}-tab`}
              aria-selected={selected}
              aria-controls={`${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
              className={cx(
                "relative h-11 shrink-0 whitespace-nowrap px-4 text-sm font-semibold",
                "text-slate-600 transition-colors duration-150 ease-brand hover:text-ink-900",
                "aria-selected:text-ink-900 disabled:pointer-events-none disabled:opacity-50",
                "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-terra-500",
                "after:opacity-0 after:transition-opacity after:duration-200 aria-selected:after:opacity-100"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        key={active.id}
        role="tabpanel"
        id={`${active.id}-panel`}
        aria-labelledby={`${active.id}-tab`}
        tabIndex={0}
        className={cx("anim-fade-in pt-6", panelClassName)}
      >
        {active.content}
      </div>
    </div>
  );
}
