/**
 * components/patterns/PromoBar.tsx — Server Component. Owner: FE-2.
 * DESIGN_SPEC §6.4 + audit: the WHOLE bar is a link to promo.href and the
 * code is shown verbatim — text/code/href all come from globals.json via
 * props (never hardcoded). Dismissal is handled by the client shell.
 *
 * Usage (BE-1 root layout):
 *   const globals = getGlobals();
 *   <PromoBar globals={globals} />
 */

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import type { Globals, Promo } from '@/lib/types';
import { PromoBarDismissible } from './PromoBarDismissible';

export type PromoBarProps =
  | { globals: Globals; promo?: never }
  | { promo: Promo; globals?: never };

export function PromoBar(props: PromoBarProps) {
  // Accepts the whole globals object (preferred) or just globals.promo —
  // either way the data originates in content/globals.json (audit §0.8).
  const promo = props.promo ?? props.globals?.promo;
  const globals = 'globals' in props ? props.globals : undefined;
  if (!promo?.text || !promo.href) return null;

  return (
    <PromoBarDismissible>
      <div className="header-container-hm grid min-h-10 items-center gap-2 py-2 text-[13px] font-semibold text-ink-100 md:grid-cols-[1fr_auto_1fr]">
        {globals?.email ? (
          <a
            href={`mailto:${globals.email}`}
            className="hidden min-w-0 items-center gap-2 transition-colors duration-150 ease-brand hover:text-white md:flex"
          >
            <Mail size={15} aria-hidden="true" />
            <span className="truncate">{globals.email}</span>
          </a>
        ) : (
          <span className="hidden md:block" aria-hidden="true" />
        )}
        <Link
          href={promo.href}
          className="justify-self-center text-center transition-colors duration-150 ease-brand hover:text-white"
        >
          <span>{promo.text}</span>
        </Link>
        {globals?.phone && globals.phoneHref ? (
          <a
            href={globals.phoneHref}
            className="hidden items-center justify-end gap-2 transition-colors duration-150 ease-brand hover:text-white md:flex"
          >
            <Phone size={15} aria-hidden="true" />
            <span>{globals.phone}</span>
          </a>
        ) : (
          <span className="hidden md:block" aria-hidden="true" />
        )}
      </div>
    </PromoBarDismissible>
  );
}
