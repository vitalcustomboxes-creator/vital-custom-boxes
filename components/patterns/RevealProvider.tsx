'use client';

/**
 * components/patterns/RevealProvider.tsx — scroll-reveal engine. Owner: FE-2.
 *
 * Contract (styles/animations.css + DESIGN_SPEC §0.4):
 * - Observes every `.reveal` / `.reveal-stagger` element with an
 *   IntersectionObserver (threshold 0, rootMargin "0px 0px -10% 0px"),
 *   sets `data-inview=""` the FIRST time it intersects, then unobserves.
 * - Hidden pre-reveal states only exist under `html[data-js]` (inline script
 *   in the root layout — BE-1), so content is never invisible without JS.
 * - prefers-reduced-motion: elements are marked in-view immediately (CSS also
 *   neutralises the animation — belt and braces).
 *
 * Usage:
 *   <RevealProvider />        once in the root layout (after {children} is fine)
 *   <Reveal as="ul" stagger>  self-contained wrapper for one-off targets
 * Both can coexist — marking is idempotent and one-time.
 */

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Canonical one-off wrapper lives in components/ui (FE-1) — it also injects
// `--stagger-i` on children past the nth-child(12) CSS fallback. Re-exported
// here so layout code can grab both tools from one module.
export { Reveal, type RevealProps } from '@/components/ui';

const SELECTOR = '.reveal:not([data-inview]), .reveal-stagger:not([data-inview])';

let sharedObserver: IntersectionObserver | null = null;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-inview', '');
            sharedObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
  }
  return sharedObserver;
}

/** Observe one element (or mark it immediately when motion is off). */
function watch(el: Element): void {
  if (el.hasAttribute('data-inview')) return;
  const observer = prefersReducedMotion() ? null : getObserver();
  if (observer) observer.observe(el);
  else el.setAttribute('data-inview', '');
}

/** Scan a subtree for un-revealed targets and observe them. */
function scan(root: ParentNode): void {
  for (const el of root.querySelectorAll(SELECTOR)) watch(el);
}

/**
 * Global provider — drop ONCE into the root layout. Scans on mount, on every
 * route change, and (cheaply, rAF-batched) when new nodes are added to the
 * DOM, so client-rendered content reveals too. Renders nothing.
 */
export function RevealProvider(): null {
  const pathname = usePathname();

  useEffect(() => {
    // rAF so the new route's DOM is committed before scanning.
    const raf = requestAnimationFrame(() => scan(document));

    // PERF (motion smoothness): only scan the subtrees that were actually
    // added — never re-query the whole document on every mutation. On a long,
    // content-heavy page (200+ product cards) the previous full-document
    // querySelectorAll on every DOM change (including hover/menu class
    // toggles) was the main source of scroll/animation jank. We now batch the
    // added element nodes and scan just those.
    let pending = 0;
    const queued = new Set<Element>();
    const flush = () => {
      pending = 0;
      for (const node of queued) {
        if (node.matches(SELECTOR)) watch(node);
        scan(node);
      }
      queued.clear();
    };
    const mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) queued.add(node as Element);
        }
      }
      if (queued.size && !pending) pending = requestAnimationFrame(flush);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      if (pending) cancelAnimationFrame(pending);
      queued.clear();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}

