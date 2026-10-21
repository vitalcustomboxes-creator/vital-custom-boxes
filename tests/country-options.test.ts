import { describe, expect, it } from 'vitest';
import { countries } from 'country-data-list';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import options from '../content/country-options.json';
import callingCodes from '../content/phone-calling-codes.json';

describe('compact country options', () => {
  it('preserves the original supported countries and calling codes', () => {
    const supported = new Set<string>(getCountries());
    const expected = countries.all
      .filter((country) => country.emoji && country.status !== 'deleted' && country.alpha2 !== 'KP' && supported.has(country.alpha2) && country.countryCallingCodes[0])
      .map((country) => ({ alpha2: country.alpha2, alpha3: country.alpha3, callingCode: country.countryCallingCodes[0], name: country.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    expect(options).toEqual(expected);
    expect(options.find((country) => country.alpha2 === 'US')?.callingCode).toBe('+1');
  });
  it('preserves every supported calling prefix without bundling the phone parser', () => {
    expect(callingCodes).toEqual(Object.fromEntries(getCountries().map((country) => [country, `+${getCountryCallingCode(country)}`])));
  });
});
