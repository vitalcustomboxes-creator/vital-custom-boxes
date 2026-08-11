/**
 * ProcessSteps — Server Component (FE-3). DESIGN_SPEC §6.12.
 *
 * Numbered "how it works" rail with lucide icons, staggered reveal, and a
 * connector hairline ≥1024px (canonical 4-step layout only). Content-level:
 * pages own the surrounding <section>/<container>.
 *
 * Two usages:
 *  - Canonical (Home etc.): pass `sla` + `shipping` (globals.json via props —
 *    audit: the ONLY turnaround/shipping source) → renders the 4 canonical
 *    steps: Quote → Design → Production (SLA) → Delivery (shipping).
 *  - Custom (e.g. /how-it-works 6-step rail): pass `steps`; any SLA/shipping
 *    wording inside MUST come from getGlobals() at the call site.
 */
import type { LucideIcon } from 'lucide-react';
import { Boxes, MessageSquareText, PenTool, Truck } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export interface ProcessStep {
  title: string;
  body: string;
  /** Optional lucide icon rendered beside the number chip. */
  icon?: LucideIcon;
}

export type ProcessStepsProps = { className?: string } & (
  | {
      /** Custom steps (SLA/shipping strings must come from globals). */
      steps: ProcessStep[];
      sla?: undefined;
      shipping?: undefined;
    }
  | {
      steps?: undefined;
      /** globals.sla — rendered verbatim in the Production step. */
      sla: string;
      /** globals.shipping — rendered verbatim in the Delivery step. */
      shipping: string;
    }
);

function canonicalSteps(sla: string, shipping: string): ProcessStep[] {
  return [
    {
      icon: Boxes,
      title: 'Select Your Box Style',
      body: 'Browse our range of packaging styles and pick the structure that fits your product and brand.',
    },
    {
      icon: MessageSquareText,
      title: 'Get a Free Quote',
      body: 'Share your size, stock, print, and quantity by form, phone, or live chat for fast wholesale pricing.',
    },
    {
      icon: PenTool,
      title: 'Approve Your 3D Design',
      body: 'Our designers prepare your dieline and a 3D digital mockup with free design support — you approve before press.',
    },
    {
      icon: Truck,
      title: 'Production & Free Delivery',
      body: `We print, cut, and quality-check your boxes. Turnaround: ${sla}. ${shipping}.`,
    },
  ];
}

export function ProcessSteps(props: ProcessStepsProps) {
  const steps =
    props.steps ?? canonicalSteps(props.sla as string, props.shipping as string);
  // Connector hairline only fits the canonical single-row 4-up layout.
  const showConnector = steps.length === 4;
  const lgCols =
    steps.length % 3 === 0 && steps.length % 4 !== 0
      ? 'lg:grid-cols-3'
      : 'lg:grid-cols-4';

  return (
    <Reveal
      as="ol"
      stagger
      className={cn('grid gap-8 md:grid-cols-2', lgCols, props.className)}
    >
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          // Reveal injects --stagger-i per child; li is the stagger child.
          <li
            key={step.title}
            className={cn(
              'relative',
              showConnector &&
                'lg:after:absolute lg:after:left-[64px] lg:after:right-[-16px] lg:after:top-6 lg:after:h-px lg:after:bg-ink-100 lg:last:after:hidden',
            )}
          >
            <div className="relative flex flex-col items-start gap-3">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-terra-100 font-display text-lg font-bold text-terra-600"
                >
                  {i + 1}
                </span>
                {Icon && (
                  <Icon size={22} className="text-terra-600" aria-hidden="true" />
                )}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Step {i + 1}
              </span>
              <h3 className="h4">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.body}</p>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}

export default ProcessSteps;
