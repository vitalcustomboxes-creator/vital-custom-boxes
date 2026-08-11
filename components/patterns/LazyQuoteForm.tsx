'use client';

import dynamic from 'next/dynamic';
import type { QuoteFormProps } from './QuoteForm';

const QuoteForm = dynamic(
  () => import('./QuoteForm').then((module) => module.QuoteForm),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[420px] animate-pulse rounded-lg border border-ink-100 bg-kraft-100"
        aria-label="Loading quote form"
      />
    ),
  },
);

export function LazyQuoteForm(props: QuoteFormProps) {
  return <QuoteForm {...props} />;
}
