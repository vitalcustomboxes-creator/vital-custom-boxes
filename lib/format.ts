/**
 * lib/format.ts — alias module (FE-3 owned).
 *
 * DESIGN_SPEC §6.7 names `lib/format.ts` as the home of the shared
 * word-boundary truncation helper; the implementation lives in lib/utils.ts
 * (client-safe). Both import paths resolve to the same functions.
 */
export { truncateAtWord, truncateWords, formatDate, readingTime } from './utils';
