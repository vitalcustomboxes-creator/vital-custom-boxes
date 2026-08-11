"use client";

/**
 * components/ui/reveal.tsx — <Reveal> scroll-reveal trigger (FE-1).
 * HARD CONTRACT — DESIGN_SPEC §0.4 / animations.css JS contract #2:
 * IntersectionObserver (threshold 0, rootMargin "0px 0px -10% 0px") sets
 * data-inview="" ONCE, then unobserves. Hidden pre-reveal states only exist
 * under html[data-js] (BE-1 inline script), so no-JS users always see content.
 *
 * `stagger` renders `.reveal-stagger` and injects `--stagger-i` on element
 * children (the nth-child fallback in animations.css covers the first 12;
 * the inline var covers longer grids). Composition rule: the stagger child is
 * the grid CELL — nest cards inside it, never put .card-lift on the same node.
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { cx } from "./cn";

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element/tag, default "div" (e.g. "section", "ul"). */
  as?: ElementType;
  /** Use the staggered children reveal (grids, footer cols). */
  stagger?: boolean;
}

export function Reveal({
  as: Tag = "div",
  stagger = false,
  className,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.hasAttribute("data-inview")) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-inview", "");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-inview", "");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const kids = stagger
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<{ style?: CSSProperties }>;
        const style: CSSProperties = {
          ...element.props.style,
          "--stagger-i": index,
        } as CSSProperties;
        return cloneElement(element, { style });
      })
    : children;

  const Component = Tag as ElementType;
  return (
    <Component
      ref={ref}
      className={cx(stagger ? "reveal-stagger" : "reveal", className)}
      {...rest}
    >
      {kids}
    </Component>
  );
}
