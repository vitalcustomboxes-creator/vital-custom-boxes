/**
 * components/ui/checkbox.tsx — Checkbox primitive (FE-1). DESIGN_SPEC §5.4.
 * Two variants:
 *  - "default": native 20px checkbox + 44px-tall label row.
 *  - "chip": quote-form multi-select pill (Material/Finish — Embossing etc.)
 *    using input.peer.sr-only + styled span; Check icon revealed via
 *    peer-checked. Pure CSS state — server-compatible, works without JS.
 * Group chips inside a <fieldset> with a visible <legend> (see RadioGroup for
 * the legend style); chips layout: `flex flex-wrap gap-2`.
 */
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "./cn";

export interface CheckboxProps
  extends Omit<ComponentPropsWithRef<"input">, "type" | "children"> {
  /** Visible label (audit — every control is labelled). */
  label: ReactNode;
  variant?: "default" | "chip";
  /** Extra classes for the wrapping <label>. */
  containerClassName?: string;
}

export function Checkbox({
  label,
  variant = "default",
  id: idProp,
  className,
  containerClassName,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? `checkbox-${autoId}`;

  if (variant === "chip") {
    return (
      <label htmlFor={id} className={cx("cursor-pointer", containerClassName)}>
        <input
          id={id}
          type="checkbox"
          className={cx("peer sr-only", className)}
          {...rest}
        />
        <span
          className={cx(
            "press inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink-100 bg-white px-5",
            "text-sm font-semibold text-ink-700 cursor-pointer select-none",
            "transition-colors duration-200 ease-brand hover:border-slate-400",
            "peer-checked:border-terra-500 peer-checked:bg-terra-100 peer-checked:text-terra-600",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring-color)]",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "[&>svg]:hidden peer-checked:[&>svg]:inline-block"
          )}
        >
          <Check size={16} aria-hidden="true" className="shrink-0" />
          {label}
        </span>
      </label>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cx(
        "flex min-h-[44px] cursor-pointer items-center gap-3 text-base text-slate-600",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:text-slate-400",
        containerClassName
      )}
    >
      <input
        id={id}
        type="checkbox"
        className={cx(
          "h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-terra-500)] disabled:cursor-not-allowed",
          className
        )}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
