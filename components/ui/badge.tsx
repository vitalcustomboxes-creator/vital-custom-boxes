/**
 * components/ui/badge.tsx — Badge primitive (FE-1). DESIGN_SPEC §5.6.
 * Server-compatible. `gold` (decorative "Popular") auto-renders the star —
 * gold is decoration only, never text color (contrast rules §1.1).
 */
import type { ComponentPropsWithoutRef } from "react";
import { Star } from "lucide-react";
import { cx } from "./cn";

export type BadgeVariant =
  | "neutral"
  | "kraft"
  | "accent"
  | "success"
  | "error"
  | "outline"
  | "gold";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant;
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-ink-100 text-ink-700",
  kraft: "bg-kraft-100 text-slate-600",
  accent: "bg-terra-100 text-terra-600",
  success: "bg-[rgba(46,125,79,0.12)] text-success",
  error: "bg-[rgba(179,64,42,0.12)] text-error",
  outline: "border border-ink-100 text-slate-600",
  gold: "bg-[rgba(248,167,24,0.2)] text-ink-900",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold leading-none",
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {variant === "gold" ? (
        <Star
          size={12}
          className="shrink-0 text-gold-500 fill-gold-500"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
