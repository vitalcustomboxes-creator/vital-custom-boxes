/**
 * components/ui/skeleton.tsx — Skeleton primitive (FE-1). DESIGN_SPEC §5.14.
 * Shimmer comes from the design layer's `.skeleton` class (animations.css,
 * reduced-motion safe). Server-compatible. Put aria-busy="true" on the
 * CONTAINER that is loading; skeletons themselves are aria-hidden.
 * Use for search results / quote-form async bits only (site is SSG).
 */
import type { ComponentPropsWithoutRef } from "react";
import { cx } from "./cn";

export type SkeletonVariant = "text" | "title" | "image" | "button" | "card";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  variant?: SkeletonVariant;
}

const SHAPES: Record<Exclude<SkeletonVariant, "card">, string> = {
  text: "skeleton h-4 w-4/5",
  title: "skeleton h-6 w-3/5",
  image: "skeleton aspect-[4/3] w-full rounded-lg",
  button: "skeleton h-11 w-32 rounded-md",
};

export function Skeleton({
  variant = "text",
  className,
  ...rest
}: SkeletonProps) {
  if (variant === "card") {
    return (
      <div
        aria-hidden="true"
        className={cx("flex flex-col gap-3", className)}
        {...rest}
      >
        <div className={SHAPES.image} />
        <div className={SHAPES.title} />
        <div className={SHAPES.text} />
        <div className="skeleton h-4 w-2/3" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cx(SHAPES[variant], className)}
      {...rest}
    />
  );
}
