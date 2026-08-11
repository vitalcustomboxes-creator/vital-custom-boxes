"use client";

/**
 * components/ui/modal.tsx — Modal primitive (FE-1). DESIGN_SPEC §5.12 + §3.
 * role="dialog" aria-modal, focus trap, Esc + backdrop click close, body
 * scroll lock, focus returns to trigger. Backdrop `.anim-fade-in`, panel
 * `.anim-pop-in` (reduced-motion safe via animations.css). Centering uses the
 * grid wrapper — never translate (anim-pop-in owns transform). Portaled to
 * <body> so transformed/backdrop-filter ancestors can't break positioning.
 */
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "./cn";
import { useDialog, useMounted } from "./use-dialog";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Heading shown in the panel + used as the dialog accessible name. */
  title?: ReactNode;
  /** Required if no `title` is given (aria-label). */
  ariaLabel?: string;
  children: ReactNode;
  /** Extra classes on the panel (e.g. max-w overrides). */
  className?: string;
  closeLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  className,
  closeLabel = "Close dialog",
}: ModalProps) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const autoId = useId();
  const titleId = `modal-title-${autoId}`;

  useDialog(open && mounted, onClose, panelRef);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center overflow-hidden p-3 sm:p-4">
      <div
        className="anim-fade-in absolute inset-0 bg-[var(--color-overlay)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        data-lenis-prevent
        className={cx(
          "anim-pop-in relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[min(560px,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-lg bg-white p-5 shadow-e3 sm:max-h-[calc(100dvh-2rem)] sm:max-w-[min(560px,calc(100vw-2rem))] sm:p-6 md:p-8",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="press absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 ease-brand hover:bg-ink-100 hover:text-ink-900"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {title ? (
          <h2 id={titleId} className="h3 mb-4 pr-12">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
}
