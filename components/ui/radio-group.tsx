/**
 * components/ui/radio-group.tsx — RadioGroup primitive (FE-1).
 * Native radio inputs inside <fieldset> + visible <legend> (audit/spec §3).
 * Keyboard navigation (arrow keys between radios, Tab in/out) is NATIVE radio
 * behavior — no JS needed, so the component stays server-compatible when used
 * uncontrolled. Controlled use (value + onValueChange) requires a client
 * parent.
 */
import { useId, type ReactNode } from "react";
import { cx } from "./cn";
import { FieldError, FieldHint, fieldIds } from "./field";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Visible group label, rendered as <legend> (required — audit). */
  label: ReactNode;
  /** Shared input name — groups the radios for native keyboard nav. */
  name: string;
  options: RadioOption[];
  /** Controlled value — pass onValueChange with it. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  orientation?: "vertical" | "horizontal";
  id?: string;
  className?: string;
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
  error,
  hint,
  orientation = "vertical",
  id: idProp,
  className,
}: RadioGroupProps) {
  const autoId = useId();
  const id = idProp ?? `radio-group-${autoId}`;
  const { hintId, errorId, describedBy } = fieldIds(id, hint, error);
  const controlled = value !== undefined;

  return (
    <fieldset
      id={id}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      className={cx("m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0", className)}
    >
      <legend className="p-0 text-sm font-semibold text-ink-700">
        {label}
        {required ? (
          <span className="text-terra-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </legend>
      <div
        className={
          orientation === "horizontal"
            ? "flex flex-wrap gap-x-6 gap-y-1"
            : "flex flex-col"
        }
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cx(
              "flex min-h-[44px] cursor-pointer items-center gap-3 text-base text-slate-600",
              "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:text-slate-400"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={controlled ? value === option.value : undefined}
              defaultChecked={
                !controlled && defaultValue !== undefined
                  ? defaultValue === option.value
                  : undefined
              }
              onChange={
                onValueChange
                  ? (event) => onValueChange(event.target.value)
                  : undefined
              }
              disabled={option.disabled}
              required={required}
              className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-terra-500)] disabled:cursor-not-allowed"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </fieldset>
  );
}
