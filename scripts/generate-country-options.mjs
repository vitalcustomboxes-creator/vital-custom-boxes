/** Rebuild the small client country list from the existing locked dependencies. */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { countries } from 'country-data-list';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';

const phoneCountries = new Set(getCountries());
const options = countries.all
  .filter((country) => country.emoji && country.status !== 'deleted' && country.alpha2 !== 'KP' && phoneCountries.has(country.alpha2) && country.countryCallingCodes[0])
  .map((country) => ({ alpha2: country.alpha2, alpha3: country.alpha3, callingCode: country.countryCallingCodes[0], name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(fileURLToPath(new URL('../content/country-options.json', import.meta.url)), JSON.stringify(options, null, 2) + '\n');
console.log(`Wrote ${options.length} country options.`);
const callingCodes = Object.fromEntries(getCountries().map((country) => [country, `+${getCountryCallingCode(country)}`]));
writeFileSync(fileURLToPath(new URL('../content/phone-calling-codes.json', import.meta.url)), JSON.stringify(callingCodes, null, 2) + '\n');
console.log(`Wrote ${Object.keys(callingCodes).length} phone calling codes.`);
