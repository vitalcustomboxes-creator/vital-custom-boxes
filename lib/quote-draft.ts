'use client';

/**
 * lib/quote-draft.ts — keeps an unsubmitted quote request on the visitor's
 * device so a refresh, a misclick or a wandering tab does not cost them the
 * form they just filled in (and cost us the lead).
 *
 * Stored in localStorage rather than a server draft: it is the visitor's own
 * unfinished data, it must survive a full reload, and it must never reach us
 * until they actually press submit.
 */

const STORAGE_KEY = 'vital:quote-draft';

/** Older drafts are noise — the specs have moved on, and so has the visitor. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Never persisted.
 *  - `website` is the honeypot. Restoring a value into it would mark a real
 *    visitor as a bot, and their submission would be dropped silently.
 *  - `artwork` holds File objects, which do not survive JSON.
 */
const SKIP_FIELDS = new Set(['website', 'artwork']);

/** Product context is React state, not DOM state — restored via `product`. */
const PRODUCT_FIELDS = ['product', 'productName', 'categorySlug', 'categoryName'] as const;

export interface QuoteDraftProduct {
  slug: string;
  name: string;
  categorySlug?: string;
  categoryName?: string;
}

export interface QuoteDraft {
  values: Record<string, string[]>;
  product: QuoteDraftProduct | null;
}

function isBlank(values: Record<string, string[]>) {
  return !Object.values(values).some((entries) => entries.some((entry) => entry.trim() !== ''));
}

export function saveQuoteDraft(form: HTMLFormElement): void {
  try {
    const values: Record<string, string[]> = {};
    for (const [field, value] of new FormData(form).entries()) {
      if (SKIP_FIELDS.has(field) || typeof value !== 'string') continue;
      (values[field] ??= []).push(value);
    }
    // An empty form is not a draft; storing one would resurrect nothing and
    // keep overwriting a real draft saved from another tab.
    if (isBlank(values)) return clearQuoteDraft();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), values }));
  } catch {
    // Private mode, quota, disabled storage — never break the form over this.
  }
}

export function readQuoteDraft(): QuoteDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; values?: Record<string, string[]> };
    if (!parsed.values || typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearQuoteDraft();
      return null;
    }

    const [slug, name, categorySlug, categoryName] = PRODUCT_FIELDS.map(
      (field) => parsed.values?.[field]?.[0] ?? '',
    );
    return {
      values: parsed.values,
      product: slug && name ? { slug, name, categorySlug: categorySlug || undefined, categoryName: categoryName || undefined } : null,
    };
  } catch {
    return null;
  }
}

export function clearQuoteDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // As above — storage failures must stay invisible.
  }
}

/**
 * Write the draft back into the form. Hidden inputs are skipped: they mirror
 * React state (the picked product, the source page), so assigning to them here
 * would be overwritten on the next render anyway.
 */
export function applyQuoteDraft(form: HTMLFormElement, values: Record<string, string[]>): void {
  for (const element of Array.from(form.elements)) {
    const field = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const stored = field.name && values[field.name];
    if (!stored || SKIP_FIELDS.has(field.name)) continue;
    if (field instanceof HTMLInputElement && field.type === 'hidden') continue;

    if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
      field.checked = stored.includes(field.value);
    } else {
      field.value = stored[0] ?? '';
    }
  }
}
