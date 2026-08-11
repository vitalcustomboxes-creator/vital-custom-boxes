'use client';

/**
 * components/patterns/PromoBarDismissible.tsx — client shell for the
 * server-rendered PromoBar content. Owner: FE-2.
 *
 * The promo/contact content itself stays a Server Component (passed as
 * children); this wrapper keeps the blue strip styling consistent.
 */

import { type ReactNode } from 'react';

export function PromoBarDismissible({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-[var(--z-promo)] bg-ink-900">
      {children}
    </div>
  );
}
