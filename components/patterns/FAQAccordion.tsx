'use client';

/**
 * FAQAccordion — Client Component (FE-3), thin wrapper around the ui
 * Accordion. DESIGN_SPEC §6.14.
 *
 * AUDIT RULE: exactly ONE FAQ block per page — page templates must render at
 * most one <FAQAccordion>. The matching FAQPage JSON-LD is emitted by the
 * page via lib/seo.ts from the SAME items (server-side) — this component
 * renders no schema itself.
 */
import { Accordion } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/types';

export interface FAQAccordionProps {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  /**
   * Section-owning component (spec §6.14: section + container + max-w-800) —
   * className lands on the <section> (pass the band bg, e.g. "bg-kraft-100").
   */
  className?: string;
}

export function FAQAccordion({
  faqs,
  eyebrow = 'FAQs',
  title = 'Frequently asked questions',
  className,
}: FAQAccordionProps) {
  if (faqs.length === 0) return null;

  return (
    <section className={cn('section', className)}>
      <div className="container-hm">
        <div className="mx-auto max-w-[800px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <Accordion
            className="mt-10"
            items={faqs.map((faq, i) => ({
              id: faq.slug ?? `faq-${i}`,
              title: faq.question,
              content: faq.answer,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

export default FAQAccordion;
