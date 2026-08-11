"use client";

import { useMemo } from "react";
import { countries } from "country-data-list";
import { CircleFlag } from "react-circle-flags";
import { getCountries, type Country as PhoneCountry } from "react-phone-number-input";
import { Combobox, type ComboboxOption } from "./combobox";

export interface CountryOption {
  alpha2: PhoneCountry;
  alpha3: string;
  callingCode: string;
  name: string;
}

interface CountryRecord {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  emoji?: string;
  name: string;
  status: string;
}

const PHONE_COUNTRIES = new Set<string>(getCountries());

/** ISO-backed options from the component recommended by the client. */
export const COUNTRY_OPTIONS: CountryOption[] = (countries.all as CountryRecord[])
  .filter(
    (country) =>
      country.emoji &&
      country.status !== "deleted" &&
      country.alpha2 !== "KP" &&
      PHONE_COUNTRIES.has(country.alpha2) &&
      country.countryCallingCodes[0],
  )
  .map((country) => ({
    alpha2: country.alpha2 as PhoneCountry,
    alpha3: country.alpha3,
    callingCode: country.countryCallingCodes[0],
    name: country.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const COMBOBOX_OPTIONS: ComboboxOption[] = COUNTRY_OPTIONS.map((country) => ({
  value: country.alpha2,
  label: country.name,
}));

export function countryByCode(code: string | undefined): CountryOption | null {
  if (!code) return null;
  return COUNTRY_OPTIONS.find((country) => country.alpha2 === code) ?? null;
}

export interface CountryDropdownProps {
  id: string;
  name: string;
  label: string;
  value: CountryOption | null;
  onChange: (country: CountryOption | null) => void;
  required?: boolean;
  hint?: string;
}

export function CountryDropdown({
  id,
  name,
  label,
  value,
  onChange,
  required,
  hint,
}: CountryDropdownProps) {
  const selectedCode = value?.alpha2 ?? null;
  const selected = useMemo(
    () => COUNTRY_OPTIONS.find((country) => country.alpha2 === selectedCode) ?? null,
    [selectedCode],
  );

  return (
    <>
      <Combobox
        id={id}
        label={label}
        options={COMBOBOX_OPTIONS}
        value={selectedCode}
        onChange={(option) => onChange(countryByCode(option?.value))}
        placeholder="Select a country"
        emptyLabel="No country found"
        required={required}
        hint={hint}
        maxVisible={60}
        renderLeading={(option) => (
          <CircleFlag
            countryCode={option.value.toLowerCase()}
            height={20}
            width={20}
            alt=""
            className="h-5 w-5 rounded-full object-cover"
          />
        )}
      />
      <input type="hidden" name={name} value={selected?.name ?? ""} />
    </>
  );
}
