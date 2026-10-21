'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { Value } from 'react-phone-number-input';
import type { PhoneNumberInputProps } from './phone-number-input';
import { Input } from './input';

/** Keep a usable, labelled telephone field while the formatting widget loads. */
export function DeferredPhoneNumberInput(props: PhoneNumberInputProps) {
  const [Widget, setWidget] = useState<ComponentType<PhoneNumberInputProps> | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    let active = true;
    void import('./phone-number-input').then((module) => {
      if (active) setWidget(() => module.PhoneNumberInput);
    }).catch(() => {
      // The ordinary tel input remains usable if the optional chunk is offline.
      // Server-side validation is still authoritative for every submission.
    });
    return () => { active = false; };
  }, []);

  // Never replace a focused field during typing or move the user's cursor.
  if (Widget && !focused) return <Widget {...props} />;

  const { id, name, label, value, onChange, required, autoComplete, placeholder, hint, error } = props;
  return (
    <Input
      id={id}
      name={name}
      label={label}
      type="tel"
      inputMode="tel"
      value={value ?? ''}
      onChange={(event) => {
        const next = event.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
        if (next.replace(/\D/g, '').length <= 15) onChange((next || undefined) as Value | undefined);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      hint={hint}
      error={error}
    />
  );
}
