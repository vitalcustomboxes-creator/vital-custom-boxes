"use client";

/**
 * components/ui/drawer.tsx — Drawer primitive (FE-1). DESIGN_SPEC §5.12/§6.2.
 * Panel stays MOUNTED and toggles [data-open] so the design-layer classes
 * animate the slide (`.drawer-panel`, `.drawer-panel--left`) + `.overlay-fade`
 * backdrop. side="bottom" replicates the same transform/opacity pattern with
 * Tailwind utilities (animations.css has no --bottom variant — ISSUE logged
 * for DESIGNER; global prefers-reduced-motion kill switch still applies).
 * Dialog semantics, focus trap, Esc, scroll lock, focus return; `inert` while
 * closed keeps the offscreen panel out of tab order / a11y tree.
 * Portaled to <body> (backdrop-filter ancestors would break fixed
 * positioning). FE-2: pass id="mobile-nav" for the burger's aria-controls.
 */
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "./cn";
import { useDialog, useMounted } from "./use-dialog";

export type DrawerSide = "left" | "right" | "bottom";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  /** Header title; also the dialog accessible name. */
  title?: ReactNode;
  /** Required if no `title` (aria-label). */
  ariaLabel?: string;
  children: ReactNode;
  /** Applied to the panel — e.g. id="mobile-nav" via `id` prop below. */
  id?: string;
  className?: string;
  /** Classes for the scrollable content area (default p-5). */
  contentClassName?: string;
  closeLabel?: string;
}

const SIDE_CLASSES: Record<DrawerSide, string> = {
  right: "drawer-panel inset-y-0 right-0 h-full w-[min(88vw,360px)]",
  left: "drawer-panel drawer-panel--left inset-y-0 left-0 h-full w-[min(88vw,360px)]",
  // Bottom sheet — same motion contract via utilities (transform-only,
  // duration token, neutralised globally under prefers-reduced-motion).
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-lg translate-y-full transition-transform duration-300 ease-brand data-[open]:translate-y-0",
};

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  ariaLabel,
  children,
  id,
  className,
  contentClassName,
  closeLabel = "Close",
}: DrawerProps) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const autoId = useId();
  const titleId = `drawer-title-${autoId}`;

  useDialog(open && mounted, onClose, panelRef);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="overlay-fade fixed inset-0 z-[var(--z-drawer)] bg-[var(--color-overlay)]"
        data-open={open ? "" : undefined}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        data-open={open ? "" : undefined}
        inert={!open}
        className={cx(
          "fixed z-[var(--z-drawer)] flex flex-col bg-white shadow-e3",
          SIDE_CLASSES[side],
          className
        )}
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4 border-b border-ink-100 px-5">
          {title ? (
            <span id={titleId} className="h4">
              {title}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="press -mr-2 flex h-11 w-11 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 ease-brand hover:bg-ink-100 hover:text-ink-900"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div data-lenis-prevent className={cx("flex-1 overflow-y-auto p-5", contentClassName)}>
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
