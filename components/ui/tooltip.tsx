"use client";

/**
 * components/ui/tooltip.tsx — Tooltip primitive (FE-1). DESIGN_SPEC §5.11.
 * Trigger (single element child) gets aria-describedby; the tip stays mounted
 * (display toggles) so the description always resolves. Shows after 300ms on
 * hover, instantly on focus; hides instantly on leave/blur/Escape.
 * Never put essential content only in tooltips.
 */
import {
  Children,
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cn";

export interface TooltipProps {
  content: ReactNode;
  /** Single focusable trigger element (button, a, input…). */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  /** Hover open delay, default 300ms (focus opens instantly). */
  delayMs?: number;
  id?: string;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayMs = 300,
  id: idProp,
  className,
}: TooltipProps) {
  const autoId = useId();
  const tipId = idProp ?? `tooltip-${autoId}`;
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const cancel = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };
  const scheduleShow = () => {
    cancel();
    timerRef.current = window.setTimeout(() => setOpen(true), delayMs);
  };
  const showNow = () => {
    cancel();
    setOpen(true);
  };
  const hideNow = () => {
    cancel();
    setOpen(false);
  };

  useEffect(() => cancel, []);

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Escape") hideNow();
  };

  const child = Children.only(children);
  const existing = child.props["aria-describedby"];
  const trigger = cloneElement(child, {
    "aria-describedby": existing ? `${existing} ${tipId}` : tipId,
  });

  return (
    <span
      className={cx("relative inline-flex max-w-full", className)}
      onMouseEnter={scheduleShow}
      onMouseLeave={hideNow}
      onFocus={showNow}
      onBlur={hideNow}
      onKeyDown={onKeyDown}
    >
      {trigger}
      <span
        role="tooltip"
        id={tipId}
        className={cx(
          "pointer-events-none absolute left-1/2 z-[var(--z-tooltip)] w-max max-w-[240px] -translate-x-1/2",
          "rounded-md bg-ink-900 px-3 py-2 text-left text-xs leading-normal text-white shadow-e2",
          side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          open ? "anim-fade-in" : "hidden"
        )}
      >
        {content}
      </span>
    </span>
  );
}
