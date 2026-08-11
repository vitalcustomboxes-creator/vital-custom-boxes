/**
 * components/ui/rating.tsx — Rating primitive (FE-1). DESIGN_SPEC §5.7.
 * DISPLAY-ONLY stars (gold-500 = decorative). Server-compatible.
 * AUDIT: render only real values from content/reviews.json — never fabricate,
 * never feed JSON-LD from this component.
 */
import { Star } from "lucide-react";
import { cx } from "./cn";

export interface RatingProps {
  /** Rating value, clamped to [0, max]. */
  value: number;
  /** Star count, default 5. */
  max?: number;
  /** Review count — appended to the aria-label and the optional text. */
  count?: number;
  size?: "sm" | "md";
  /** Shows "4.8 (132)" after the stars. */
  showValue?: boolean;
  /** Override the generated aria-label. */
  ariaLabel?: string;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  count,
  size = "md",
  showValue = false,
  ariaLabel,
  className,
}: RatingProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const filledCount = Math.round(clamped);
  const px = size === "sm" ? 14 : 18;
  const label =
    ariaLabel ??
    `Rated ${clamped} out of ${max}${
      count !== undefined ? ` from ${count} reviews` : ""
    }`;

  return (
    <div
      role="img"
      aria-label={label}
      className={cx("flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={px}
          aria-hidden="true"
          className={
            i < filledCount
              ? "shrink-0 text-gold-500 fill-gold-500"
              : "shrink-0 text-ink-100 fill-ink-100"
          }
        />
      ))}
      {showValue ? (
        <span className="ml-1.5 text-sm text-slate-600" aria-hidden="true">
          {clamped.toFixed(1)}
          {count !== undefined ? ` (${count})` : ""}
        </span>
      ) : null}
    </div>
  );
}
