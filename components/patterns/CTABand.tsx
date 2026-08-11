/**
 * components/patterns/CTABand.tsx — Server Component. Owner: FE-2.
 * Sitewide quote section, always the last conversion section before footer.
 * It reuses QuoteForm so every public template collects the same fields.
 *
 * Phone text/href come from globals via props (audit: tel link correctness +
 * single claims source). Pass `phone`/`phoneHref` from getGlobals().
 */

import { submitQuote } from '@/app/actions';
import type { QuoteFormProps } from './QuoteForm';
import { LazyQuoteForm } from './LazyQuoteForm';

export interface CTABandProps {
  /** Band h2 — pass page-contextual copy; claim-free generic default. */
  heading?: string;
  sub?: string;
  defaultProduct?: QuoteFormProps['defaultProduct'];
  /** globals.phone — display format, rendered verbatim. */
  phone?: string;
  /** globals.phoneHref — e.g. "tel:+12136926437". */
  phoneHref?: string;
}

export function CTABand({
  heading = 'Ready to start your packaging project?',
  sub,
  defaultProduct,
  phone,
  phoneHref,
}: CTABandProps) {
  return (
    <section className="section bg-paper-50" aria-label="Request a custom quote">
      <div className="container-hm max-w-[980px]">
        <LazyQuoteForm
          action={submitQuote}
          defaultProduct={defaultProduct}
          heading={heading}
          description={sub}
        />
        {phone && phoneHref ? (
          <p className="mt-5 text-center text-sm text-slate-600">
            Prefer to talk?{' '}
            <a
              href={phoneHref}
              className="font-semibold text-terra-600 underline underline-offset-4"
            >
              Call {phone}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
