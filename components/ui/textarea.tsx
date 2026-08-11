/**
 * components/ui/textarea.tsx — Textarea primitive (FE-1). DESIGN_SPEC §5.2.
 * Same chrome/label/error contract as Input; min-h 120, resize-y.
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

export interface TextareaProps
  extends Omit<ComponentPropsWithRef<"textarea">, "children"> {
  /** Visible label text (required — audit). */
  label: ReactNode;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id: idProp,
  required,
  className,
  containerClassName,
  "aria-describedby": externalDescribedBy,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const id = idProp ?? `textarea-${autoId}`;
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
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "min-h-[120px] py-3 resize-y",
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
