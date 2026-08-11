"use client";

/**
 * components/ui/use-dialog.ts — shared dialog plumbing (FE-1, internal).
 * Focus trap + Escape close + body scroll lock + focus return for Modal and
 * Drawer (DESIGN_SPEC §3/§5.12). Also exports useMounted() for client-only
 * portals (dialogs can't SSR a portal — they are interaction-only UI).
 */
import { useEffect, useRef, useState, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/* Body scroll lock with a counter so stacked dialogs don't unlock early. */
let lockCount = 0;
let previousOverflow = "";

function lockScroll() {
  if (typeof document === "undefined") return;
  if (++lockCount === 1) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  if (typeof document === "undefined") return;
  if (lockCount > 0 && --lockCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

function visibleFocusables(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => el.getClientRects().length > 0);
}

/**
 * Activate dialog behavior while `active` is true:
 * Esc → onClose, Tab cycles inside panelRef, scroll locked, initial focus on
 * [data-autofocus] → first focusable → panel (give the panel tabIndex={-1}),
 * focus returns to the previously focused element on deactivate.
 */
export function useDialog(
  active: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>
) {
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    lockScroll();

    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const autoTarget = panel.querySelector<HTMLElement>("[data-autofocus]");
      const target = autoTarget ?? visibleFocusables(panel)[0] ?? panel;
      target.focus({ preventScroll: true });
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = visibleFocusables(panel);
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      const inside = current instanceof HTMLElement && panel.contains(current);
      if (event.shiftKey) {
        if (!inside || current === first || current === panel) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (!inside || current === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [active, panelRef]);
}

/** True after first client render — gate for createPortal targets. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
