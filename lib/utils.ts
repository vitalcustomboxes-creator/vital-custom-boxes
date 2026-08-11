/**
 * lib/utils.ts — shared client-safe helpers (FE-3 owned).
 *
 * IMPORTANT: keep this module free of node:fs / server-only imports — it is
 * consumed by both Server and Client Components. (Server-only string helpers
 * for metadata live in lib/seo.ts.)
 */

/**
 * cn — minimal class-name joiner (clsx-style, strings only).
 * Filters falsy values so conditional classes read cleanly:
 *   cn('base', isActive && 'active', className)
 */
export function cn(
  ...inputs: Array<string | number | null | undefined | false>
): string {
  return inputs.filter(Boolean).join(' ');
}

/** Trailing punctuation/whitespace we strip before appending an ellipsis. */
const TRAILING_PUNCT = /[\s.,;:!?\-–—]+$/;

/**
 * truncateWords — word-count truncation at a WORD BOUNDARY (audit rule:
 * mid-word cuts are forbidden). Returns the first `maxWords` words with a
 * single ellipsis appended when anything was cut.
 *
 *   truncateWords('Custom kraft boxes made to order', 3) // 'Custom kraft boxes…'
 */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (maxWords <= 0) return '';
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, maxWords).join(' ').replace(TRAILING_PUNCT, '') + '…';
}

/**
 * truncateAtWord — character-budget truncation at a word boundary
 * (DESIGN_SPEC §6.7 contract: cut at `maxChars`, backtrack to the last space,
 * trim trailing punctuation, append '…'; never cuts mid-word).
 */
export function truncateAtWord(text: string, maxChars: number): string {
  const s = text.trim();
  if (s.length <= maxChars) return s;
  let cut = s.slice(0, Math.max(0, maxChars));
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);
  return cut.replace(TRAILING_PUNCT, '') + '…';
}

/**
 * formatDate — '2026-06-12' → 'Jun 12, 2026' (en-US, UTC so SSG output is
 * deterministic). Returns '' for missing/invalid input.
 */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** readingTime — ~200 wpm estimate, minimum 1 minute: '4 min read'. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
