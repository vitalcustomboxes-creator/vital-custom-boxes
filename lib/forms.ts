/**
 * lib/forms.ts — zod v4 schemas + FormData parsers (BE-3 owned).
 *
 * CLIENT-SAFE: no node:fs, no `server-only` — FE-3 may import the option
 * constants to render the QuoteForm selects/chips, and the schemas for
 * optional client-side pre-validation. The server actions in app/actions.ts
 * are the authoritative validators.
 *
 * Option lists mirror the live quote form at
 * https://www.vitalcustomboxes.com/get-a-quote/ (verified 2026-07-12).
 */
import { z } from 'zod';
import {
  CATEGORY_SLUGS,
  DIMENSION_UNITS,
  QUOTE_COLORS,
  QUOTE_FINISHES,
  QUOTE_LAMINATIONS,
  QUOTE_STOCKS,
  QUOTE_SURFACES,
} from './quote-options';

export {
  CATEGORY_SLUGS,
  DIMENSION_UNITS,
  QUOTE_COLORS,
  QUOTE_FINISHES,
  QUOTE_LAMINATIONS,
  QUOTE_OPTIONS,
  QUOTE_STOCKS,
  QUOTE_SURFACES,
} from './quote-options';

/**
 * Honeypot field name. FE-3: render as a visually-hidden text input named
 * "website" (autocomplete="off", tabIndex={-1}, aria-hidden wrapper). Humans
 * leave it empty; bots fill it and get a silent `{ ok: true }`.
 */
export const HONEYPOT_FIELD = 'website';

/* -------------------------------- helpers -------------------------------- */

/** '' / null / undefined → undefined, so optional fields validate cleanly. */
function blankToUndefined(v: unknown): unknown {
  if (v == null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  return v;
}

/** Optional positive dimension (FormData arrives as string → coerced). */
function optionalPositive(label: string) {
  return z.preprocess(
    blankToUndefined,
    z.coerce
      .number(`${label} must be a number.`)
      .positive(`${label} must be greater than 0.`)
      .optional(),
  );
}

function optionalEnum<T extends readonly [string, ...string[]]>(
  values: T,
  label: string,
) {
  return z.preprocess(
    blankToUndefined,
    z.enum(values, `Please choose a valid ${label}.`).optional(),
  );
}

function optionalText(label: string, max: number) {
  return z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer.`)
      .optional(),
  );
}

/**
 * Tolerant enum reader. FE-3's QuoteForm currently ships its own option
 * labels (e.g. "12pt Cardstock", "Outside + inside", "Soft Touch") that
 * drift from the live-site canon above — logged in docs/team/ISSUES.md.
 * Until FE imports QUOTE_OPTIONS, we normalize known variants to canonical
 * values so real UI submissions never bounce; unknown values pass through
 * unchanged and are rejected by the zod enum.
 */
function normKey(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function canonicalizeEnum(
  value: string | undefined,
  canon: readonly string[],
  aliases: Record<string, string | undefined> = {},
): string | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const key = normKey(value);
  const direct = canon.find((c) => normKey(c) === key);
  if (direct) return direct;
  if (key in aliases) return aliases[key];
  return value; // let zod produce the enum error
}

const STOCK_ALIASES: Record<string, string | undefined> = {
  kraft: 'Kraft Stock',
  corrugated: 'Corrugated Stock',
  rigid: 'Rigid Stock',
  eco: 'Eco Friendly Stock',
  ecorecycledkraft: 'Eco Friendly Stock',
  ecofriendly: 'Eco Friendly Stock',
  sbs: 'SBS Board',
};

const COLOR_ALIASES: Record<string, string | undefined> = {
  '1colors': '1 color',
  '2colors': '2 color',
  '3colors': '3 color',
  '4colors': '4 color',
  '4colorsfullcolorcmyk': '4 color',
  fullcolorcmyk: '4 color',
  cmyk: '4 color',
  plainnoprinting: 'No Printing',
};

const LAMINATION_ALIASES: Record<string, string | undefined> = {
  none: undefined, // "None" = no lamination → field omitted
  gloss: 'Glossy',
  softtouch: 'Anti Scratch Soft Touch',
  antiscratch: 'Anti Scratch Soft Touch',
};

/** Strips spaces, dots, parens and dashes; keeps a leading "+" and digits. */
export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s().-]/g, '');
}

const PHONE_RE = /^\+?\d{7,15}$/;

const requiredPhone = z
  .string('Please enter your phone number.')
  .trim()
  .transform(normalizePhone)
  .refine(
    (v) => PHONE_RE.test(v),
    'Please enter a valid phone number (7–15 digits).',
  );

const optionalPhone = z.preprocess(blankToUndefined, requiredPhone.optional());

const requiredName = z
  .string('Please enter your name.')
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(100, 'Name must be 100 characters or fewer.');

const requiredEmail = z
  .email('Please enter a valid email address.')
  .max(254, 'Email must be 254 characters or fewer.');

/* -------------------------------- schemas -------------------------------- */

export const quoteSchema = z.object({
  // Step 1 — packaging
  boxType: optionalEnum(CATEGORY_SLUGS, 'box type'),
  length: optionalPositive('Length'),
  width: optionalPositive('Width'),
  height: optionalPositive('Height'),
  unit: z.preprocess(blankToUndefined, z.enum(DIMENSION_UNITS).default('in')),
  stock: optionalEnum(QUOTE_STOCKS, 'stock'),
  color: optionalEnum(QUOTE_COLORS, 'color option'),
  surface: optionalEnum(QUOTE_SURFACES, 'color surface'),
  lamination: optionalEnum(QUOTE_LAMINATIONS, 'lamination'),
  quantity: z.coerce
    .number('Please enter a quantity (numbers only).')
    .int('Quantity must be a whole number.')
    .min(25, 'Minimum quantity is 25.')
    .max(100000, 'For quantities above 100,000 please call us directly.'),
  finishes: z
    .array(z.enum(QUOTE_FINISHES, 'Please choose valid finishes.'))
    .max(QUOTE_FINISHES.length)
    .default([]),
  /** Originating product slug (hidden field when arriving from a ProductCard). */
  product: optionalText('Product', 160),
  productName: optionalText('Product name', 180),
  categorySlug: optionalText('Category slug', 120),
  categoryName: optionalText('Category name', 180),
  sourcePath: optionalText('Source page', 300),
  // Step 2 — contact
  name: requiredName,
  company: optionalText('Company', 120),
  email: requiredEmail,
  phone: requiredPhone,
  country: optionalText('Country', 80),
  notes: optionalText('Notes', 2000),
});

export const contactSchema = z.object({
  name: requiredName,
  company: optionalText('Company', 120),
  email: requiredEmail,
  phone: optionalPhone,
  country: z
    .string('Please choose your country.')
    .trim()
    .min(2, 'Please choose your country.')
    .max(80, 'Country must be 80 characters or fewer.'),
  subject: optionalText('Subject', 150),
  message: z
    .string('Please enter a message.')
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message must be 2000 characters or fewer.'),
});

export const sampleSchema = z.object({
  name: requiredName,
  email: requiredEmail,
  phone: optionalPhone,
  company: optionalText('Company', 120),
  /** Ship-to address for the sample kit — optional; sales follows up if absent. */
  address: optionalText('Address', 300),
  country: optionalText('Country', 80),
  /** Free text or a category slug — not constrained on purpose. */
  productInterest: optionalText('Product interest', 120),
  notes: optionalText('Notes', 2000),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SampleInput = z.infer<typeof sampleSchema>;

/** Result contract shared with FE-3's QuoteForm action prop. */
export interface ActionResult {
  ok: boolean;
  error?: string;
}

/* --------------------------- FormData extraction -------------------------- */

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : undefined;
}

function strList(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

/**
 * FormData → plain object for quoteSchema.
 * - Accepts FE-3 field aliases: `depth` → height, `colors` → color.
 * - Canonicalizes enum label variants (see canonicalizeEnum above).
 * - Captures hidden product/category/page context for the lead record.
 * - NOTE: the optional "artwork" file upload is intentionally ignored
 *   server-side for now (no binary persistence in the JSONL lead log) —
 *   wire to storage together with the real email send at deploy.
 */
export function quoteFromFormData(fd: FormData): Record<string, unknown> {
  return {
    boxType: str(fd, 'boxType'),
    length: str(fd, 'length'),
    width: str(fd, 'width'),
    height: str(fd, 'height') ?? str(fd, 'depth'),
    unit: str(fd, 'unit'),
    stock: canonicalizeEnum(str(fd, 'stock'), QUOTE_STOCKS, STOCK_ALIASES),
    color: canonicalizeEnum(
      str(fd, 'color') ?? str(fd, 'colors'),
      QUOTE_COLORS,
      COLOR_ALIASES,
    ),
    surface: canonicalizeEnum(str(fd, 'surface'), QUOTE_SURFACES),
    lamination: canonicalizeEnum(
      str(fd, 'lamination'),
      QUOTE_LAMINATIONS,
      LAMINATION_ALIASES,
    ),
    quantity: str(fd, 'quantity'),
    finishes: strList(fd, 'finishes'),
    product: str(fd, 'product'),
    productName: str(fd, 'productName'),
    categorySlug: str(fd, 'categorySlug'),
    categoryName: str(fd, 'categoryName'),
    sourcePath: str(fd, 'sourcePath'),
    name: str(fd, 'name'),
    company: str(fd, 'company'),
    email: str(fd, 'email'),
    phone: str(fd, 'phone'),
    country: str(fd, 'country'),
    notes: str(fd, 'notes'),
  };
}

export function contactFromFormData(fd: FormData): Record<string, unknown> {
  return {
    name: str(fd, 'name'),
    company: str(fd, 'company'),
    email: str(fd, 'email'),
    phone: str(fd, 'phone'),
    country: str(fd, 'country'),
    subject: str(fd, 'subject'),
    message: str(fd, 'message'),
  };
}

export function sampleFromFormData(fd: FormData): Record<string, unknown> {
  return {
    name: str(fd, 'name'),
    email: str(fd, 'email'),
    phone: str(fd, 'phone'),
    company: str(fd, 'company'),
    address: str(fd, 'address'),
    country: str(fd, 'country'),
    productInterest: str(fd, 'productInterest'),
    notes: str(fd, 'notes'),
  };
}

/** True when the hidden honeypot field was filled in (bot heuristic). */
export function isHoneypotTripped(fd: FormData): boolean {
  const v = fd.get(HONEYPOT_FIELD);
  return typeof v === 'string' && v.trim() !== '';
}

/* ----------------------------- error formatting --------------------------- */

const FIELD_LABELS: Record<string, string> = {
  boxType: 'Box type',
  length: 'Length',
  width: 'Width',
  height: 'Height',
  unit: 'Unit',
  stock: 'Stock',
  color: 'Color',
  surface: 'Color surface',
  lamination: 'Lamination',
  quantity: 'Quantity',
  finishes: 'Finishes',
  product: 'Product',
  productName: 'Product name',
  categorySlug: 'Category slug',
  categoryName: 'Category name',
  sourcePath: 'Source page',
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  country: 'Country',
  notes: 'Notes',
  subject: 'Subject',
  message: 'Message',
  address: 'Address',
  productInterest: 'Product interest',
};

/** ZodError → short, friendly, field-labelled message (max 3 fields). */
export function formatZodError(error: z.ZodError): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (seen.has(key)) continue;
    seen.add(key);
    const label = FIELD_LABELS[key] ?? key;
    const needsLabel =
      key !== '' && !issue.message.toLowerCase().includes(label.toLowerCase());
    parts.push(needsLabel ? `${label}: ${issue.message}` : issue.message);
    if (parts.length >= 3) break;
  }
  return parts.join(' ') || 'Please check the form and try again.';
}
