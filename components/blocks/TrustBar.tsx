/**
 * TrustBar — Server Component (FE-3 blocks). Compact trust strip rendered
 * directly under the Home hero (section-owning: renders its own
 * `.section-compact` band; pass bg overrides via className).
 *
 * Audit rules baked in:
 *  - Free-shipping / MOQ / SLA chips read VERBATIM from props fed by
 *    content/globals.json — never hardcoded here.
 *  - Payment methods are a PLAIN-TEXT label list — no fake trust badges,
 *    no third-party seals.
 */
import { Clock, Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrustBarProps {
  /** globals.shipping */
  shipping: string;
  /** globals.moq */
  moq: string;
  /** globals.sla */
  sla: string;
  /** Real accepted payment methods, rendered as text. */
  paymentMethods?: string[];
  /** Lands on the <section>. */
  className?: string;
}

const DEFAULT_PAYMENT_METHODS = [
  'Visa',
  'Mastercard',
  'Amex',
  'Discover',
  'PayPal',
];

export function TrustBar({
  shipping,
  moq,
  sla,
  paymentMethods = DEFAULT_PAYMENT_METHODS,
  className,
}: TrustBarProps) {
  const chips = [
    { icon: Truck, text: shipping },
    { icon: Package, text: `MOQ: ${moq}` },
    { icon: Clock, text: sla },
  ];

  return (
    <section
      className={cn(
        'section-compact border-y border-ink-100 bg-paper-50',
        className,
      )}
    >
      <div className="container-hm flex flex-col items-center gap-3">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 text-sm font-semibold text-ink-700"
            >
              <Icon size={18} className="shrink-0 text-terra-600" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        {/* Plain text payment labels (audit: no fake badge graphics). */}
        <p className="text-xs text-slate-600">
          We accept: {paymentMethods.join(' · ')}
        </p>
      </div>
    </section>
  );
}

export default TrustBar;
