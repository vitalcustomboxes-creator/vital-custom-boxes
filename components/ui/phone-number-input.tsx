"use client";

import { useId } from "react";
import PhoneInput, {
  type Country,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import labels from "react-phone-number-input/locale/en.json";
import { cx } from "./cn";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  fieldIds,
  inputStateDefault,
  inputStateError,
} from "./field";

export interface PhoneNumberInputProps {
  id?: string;
  name: string;
  label: string;
  value?: Value;
  onChange: (value?: Value) => void;
  onCountryChange?: (country?: Country) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}

export function PhoneNumberInput({
  id: idProp,
  name,
  label,
  value,
  onChange,
  onCountryChange,
  required,
  autoComplete,
  placeholder,
  hint,
  error,
}: PhoneNumberInputProps) {
  const autoId = useId();
  const id = idProp ?? `phone-${autoId}`;
  const { hintId, errorId, describedBy } = fieldIds(id, hint, error);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <PhoneInput
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onCountryChange={onCountryChange}
        international
        limitMaxLength
        countryCallingCodeEditable
        flags={flags}
        labels={labels}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "hm-phone-input h-11 w-full rounded-md border bg-white px-3 text-base transition-[border-color,box-shadow] duration-200 ease-brand",
          error ? inputStateError : inputStateDefault,
        )}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
