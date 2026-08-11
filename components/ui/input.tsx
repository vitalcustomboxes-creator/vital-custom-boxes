/**
 * components/ui/input.tsx — Input primitive (FE-1). DESIGN_SPEC §5.2.
 * VISIBLE label is REQUIRED (audit rule — placeholder is never the label).
 * Server-compatible; useId only (allowed in Server Components).
 */
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "./cn";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  fieldIds,
  inputChromeBase,
  inputStateDefault,
  inputStateError,
} from "./field";

export interface InputProps
  extends Omit<ComponentPropsWithRef<"input">, "children"> {
  /** Visible label text (required — audit: no placeholder-as-label). */
  label: ReactNode;
  /** Error message; sets aria-invalid + aria-describedby. */
  error?: string;
  /** Help text below the field, wired via aria-describedby. */
  hint?: string;
  /** Extra classes for the outer wrapper div. */
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  id: idProp,
  required,
  className,
  containerClassName,
  "aria-describedby": externalDescribedBy,
  ...rest
}: InputProps) {
  const autoId = useId();
  const id = idProp ?? `input-${autoId}`;
  const { hintId, errorId, describedBy } = fieldIds(
    id,
    hint,
    error,
    externalDescribedBy
  );

  return (
    <div className={cx("flex flex-col gap-1.5", containerClassName)}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "h-11",
          inputChromeBase,
          error ? inputStateError : inputStateDefault,
          className
        )}
        {...rest}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
