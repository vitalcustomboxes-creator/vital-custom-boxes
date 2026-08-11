'use server';

/**
 * app/actions.ts — server actions for the quote / contact / sample forms
 * (BE-3 owned). Contract shared with FE-3's forms and BE-2's pages:
 *
 *   (data: FormData) => Promise<{ ok: boolean; error?: string }>
 *
 * Flow per action: honeypot → rate limit → zod parse → Firebase collection →
 * { ok: true }. Validation failures return a friendly message;
 * unexpected failures never leak internals.
 *
 * NOTE: a 'use server' file may only export async functions — schemas,
 * option lists and parsers live in lib/forms.ts (client-safe, FE-3 imports
 * the same option constants).
 */

import { headers } from 'next/headers';
import {
  contactFromFormData,
  contactSchema,
  formatZodError,
  isHoneypotTripped,
  quoteFromFormData,
  quoteSchema,
  sampleFromFormData,
  sampleSchema,
  type ActionResult,
  type QuoteInput,
} from '@/lib/forms';
import { getCategory, getProduct } from '@/lib/content';
import { ArtworkError, uploadQuoteArtwork } from '@/lib/lead-artwork';
import { rateLimit } from '@/lib/rate-limit';
import { saveSubmission } from '@/lib/firebase/server-leads';
import { sendLeadEmail } from '@/lib/lead-email';

type LeadType = 'quote' | 'contact' | 'sample';

const GENERIC_ERROR =
  'Something went wrong on our end. Please try again, or email us directly.';
const RATE_LIMIT_ERROR =
  'Too many submissions from your connection. Please wait a minute and try again.';

/**
 * ip-ish rate-limit key from request headers. Best-effort only: XFF is
 * client-spoofable on non-proxied setups — acceptable for a 5/min tripwire
 * (see lib/rate-limit.ts for the serverless caveat). Falls back to 'local'
 * outside a request scope (tests / build).
 */
async function clientKey(): Promise<string> {
  try {
    const h = await headers();
    const xff = h.get('x-forwarded-for');
    const first = xff?.split(',')[0]?.trim();
    return first || h.get('x-real-ip') || 'unknown';
  } catch {
    return 'local';
  }
}

type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

async function handleSubmission<T>(
  type: LeadType,
  fd: FormData,
  parse: () => Parsed<T>,
  /** Runs after validation, before the write — see submitQuote's uploads. */
  enrich?: (data: T) => Promise<Record<string, unknown>>,
): Promise<ActionResult> {
  const traceId = crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();
  console.info(`[lead:${type}:${traceId}] submission received`);

  try {
    // 1. Honeypot first: bots get a silent success — no write, no budget burn.
    if (isHoneypotTripped(fd)) {
      console.warn(`[lead:${type}:${traceId}] submission dropped`, {
        reason: 'honeypot',
      });
      return { ok: true };
    }

    // 2. Naive rate limit, keyed per form type + ip-ish header.
    const key = await clientKey();
    if (!rateLimit(`${type}:${key}`)) {
      console.warn(`[lead:${type}:${traceId}] submission rejected`, {
        reason: 'rate-limit',
      });
      return { ok: false, error: RATE_LIMIT_ERROR };
    }

    // 3. Validate.
    const result = parse();
    if (!result.ok) {
      console.warn(`[lead:${type}:${traceId}] submission rejected`, {
        reason: 'validation',
        error: result.error,
      });
      return { ok: false, error: result.error };
    }
    console.info(`[lead:${type}:${traceId}] validation passed`);

    // 4. Side effects that must land before the lead is recorded — currently
    //    the artwork upload, so a stored lead never references missing files.
    const record = enrich
      ? await enrich(result.data)
      : (result.data as Record<string, unknown>);

    // 5. Keep each form type in its own Firebase collection.
    console.info(`[lead:${type}:${traceId}] Firestore write started`);
    await saveSubmission(type, record);
    console.info(`[lead:${type}:${traceId}] submission stored in Firestore`);

    // 6. Notify the owner. The lead is already durable at this point, so an
    //    email-provider outage cannot lose the submitted customer details.
    try {
      console.info(`[lead:${type}:${traceId}] Resend workflow requested`);
      await sendLeadEmail(type, record);
      console.info(`[lead:${type}:${traceId}] Resend workflow returned`, {
        durationMs: Date.now() - startedAt,
      });
    } catch (emailError) {
      console.error(`[lead:${type}:${traceId}] email workflow failed`, emailError);
    }
    return { ok: true };
  } catch (err) {
    // A rejected attachment is the customer's to fix, so say what was wrong
    // instead of hiding it behind the generic message.
    if (err instanceof ArtworkError) {
      console.warn(`[lead:${type}:${traceId}] artwork rejected`, {
        error: err.message,
      });
      return { ok: false, error: err.message };
    }
    console.error(`[lead:${type}:${traceId}] submission failed`, err);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/**
 * The quote form's product picker means `product`/`productName`/`categoryName`
 * now arrive from the browser as free text (the schema only bounds their
 * length). Re-derive the display fields from the catalog so the admin inbox
 * can never be shown a name that doesn't match the slug; an unrecognised slug
 * is dropped rather than persisted.
 */
function withResolvedProduct(quote: QuoteInput): Record<string, unknown> {
  if (!quote.product) return quote;

  const product = getProduct(quote.product);
  if (!product) {
    return Object.fromEntries(
      Object.entries(quote).filter(
        ([key]) => key !== 'product' && key !== 'productName',
      ),
    );
  }

  return {
    ...quote,
    productName: product.name,
    categorySlug: product.category,
    categoryName: getCategory(product.category)?.name ?? quote.categoryName,
  };
}

export async function submitQuote(data: FormData): Promise<ActionResult> {
  return handleSubmission(
    'quote',
    data,
    () => {
      const parsed = quoteSchema.safeParse(quoteFromFormData(data));
      return parsed.success
        ? { ok: true, data: withResolvedProduct(parsed.data) }
        : { ok: false, error: formatZodError(parsed.error) };
    },
    async (quote) => {
      // `artwork` is the one field that never reaches the zod schema: it holds
      // File objects, so it is pulled straight off the FormData and turned
      // into R2 references the admin inbox can download.
      const files = data.getAll('artwork').filter((f): f is File => f instanceof File && f.size > 0);
      const artwork = await uploadQuoteArtwork(files);
      return artwork.length ? { ...quote, artwork } : quote;
    },
  );
}

export async function submitContact(data: FormData): Promise<ActionResult> {
  return handleSubmission(
    'contact',
    data,
    () => {
      const parsed = contactSchema.safeParse(contactFromFormData(data));
      return parsed.success
        ? { ok: true, data: parsed.data }
        : { ok: false, error: formatZodError(parsed.error) };
    },
  );
}

export async function submitSample(data: FormData): Promise<ActionResult> {
  return handleSubmission(
    'sample',
    data,
    () => {
      const parsed = sampleSchema.safeParse(sampleFromFormData(data));
      return parsed.success
        ? { ok: true, data: parsed.data }
        : { ok: false, error: formatZodError(parsed.error) };
    },
  );
}
