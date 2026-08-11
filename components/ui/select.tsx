/**
 * components/ui/select.tsx — Select primitive (FE-1). DESIGN_SPEC §5.3.
 * Native <select> (zero-JS, server-compatible) with input chrome + chevron.
 * Options via `options` prop and/or <option> children.
 */
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentPropsWithRef<"select"> {
  /** Visible label text (required — audit). */
  label: ReactNode;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  /** Non-selectable first option, e.g. "Select a box style". */
  placeholder?: string;
  containerClassName?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  id: idProp,
  required,
  className,
  containerClassName,
  children,
  value,
  defaultValue,
  "aria-describedby": externalDescribedBy,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? `select-${autoId}`;
  const { hintId, errorId, describedBy } = fieldIds(
    id,
    hint,
    error,
    externalDescribedBy
  );

  // With a placeholder and no value/defaultValue, start on the placeholder.
  const resolvedDefault =
    placeholder !== undefined && value === undefined && defaultValue === undefined
      ? ""
      : defaultValue;

  return (
    <div className={cx("flex flex-col gap-1.5", containerClassName)}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          defaultValue={resolvedDefault}
          className={cx(
            "h-11 appearance-none pr-10 cursor-pointer",
            inputChromeBase,
            error ? inputStateError : inputStateDefault,
            className
          )}
          {...rest}
        >
          {placeholder !== undefined ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
