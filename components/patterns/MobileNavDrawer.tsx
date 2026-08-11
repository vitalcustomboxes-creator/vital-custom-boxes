'use client';

/**
 * components/patterns/MobileNavDrawer.tsx — Client Component. Owner: FE-2.
 *
 * Mobile nav content inside the FE-1 <Drawer> shell, which owns: portal,
 * overlay, dialog semantics + accessible name (title), focus trap, Esc,
 * scroll lock, focus return, the head row and its 44px close button.
 * This component owns the nav content:
 *  - FULL-ROW tappable rows ≥44px — one <button>/<Link> spans the whole row,
 *    so label AND chevron both toggle the submenu (PM brief / audit).
 *  - Group rows push a slide-in sub-panel (transform-only + ease-brand,
 *    neutralised under prefers-reduced-motion globally) with a Back row;
 *    focus moves Back-button ↔ group row; the off-screen panel is `inert`.
 *  - Foot: Call (globals.phoneHref; label = globals.phone VERBATIM display
 *    format), Get Free Quote CTA, email link. All contact facts via props.
 *
 * Header owns open state + the burger trigger (aria-controls="mobile-nav");
 * route changes close it via Header's pathname effect.
 */

import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer } from '@/components/ui';
import { categoryPath } from '@/lib/routes';
import type { Globals } from '@/lib/types';
import { groupNavCategories, type NavCategory } from './nav-types';

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  globals: Globals;
  categories: NavCategory[];
  /** Must match the burger's aria-controls. */
  id?: string;
}

const rowClass =
  'flex min-h-[44px] w-full items-center justify-between gap-3 px-5 py-2.5 text-left text-base font-semibold text-ink-900 active:bg-paper-50';
const subRowClass =
  'flex min-h-[44px] w-full items-center px-5 py-2.5 text-[15px] text-slate-600 active:bg-paper-50';

export function MobileNavDrawer({
  open,
  onClose,
  globals,
  categories,
  id = 'mobile-nav',
}: MobileNavDrawerProps) {
  const groups = useMemo(() => groupNavCategories(categories), [categories]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeGroup = groups.find((g) => g.key === activeKey) ?? null;

  const backRef = useRef<HTMLButtonElement | null>(null);
  const groupRowRefs = useRef(new Map<string, HTMLButtonElement>());

  // Always (re)open at the root level.
  useEffect(() => {
    if (open) setActiveKey(null);
  }, [open]);

  const openGroup = (key: string) => {
    setActiveKey(key);
    requestAnimationFrame(() => backRef.current?.focus());
  };
  const goBack = () => {
    const key = activeKey;
    setActiveKey(null);
    if (key) {
      requestAnimationFrame(() => groupRowRefs.current.get(key)?.focus());
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      id={id}
      title="Menu"
      closeLabel="Close menu"
      // Drawer's content area defaults to p-5 + cx is a plain join, so the
      // padding needs the important override for full-bleed rows.
      contentClassName="flex flex-col !p-0"
    >
      {/* Sliding panels */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Root panel */}
        <nav
          aria-label="Mobile main"
          inert={activeKey !== null || undefined}
          className={`absolute inset-0 overflow-y-auto py-2 transition-transform duration-300 ease-brand ${
            activeKey ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <ul className="divide-y divide-ink-100">
            <li>
              <Link href="/" className={rowClass}>
                Home
              </Link>
            </li>
            {groups.map((group) => (
              <li key={group.key}>
                {/* Whole row is ONE button — label and chevron both toggle */}
                <button
                  ref={(el) => {
                    if (el) groupRowRefs.current.set(group.key, el);
                    else groupRowRefs.current.delete(group.key);
                  }}
                  type="button"
                  aria-expanded={activeKey === group.key}
                  aria-controls="mobile-nav-subpanel"
                  onClick={() => openGroup(group.key)}
                  className={rowClass}
                >
                  {group.label}
                  <ChevronRight
                    size={20}
                    className="shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
            <li>
              <Link href="/about-us/" className={rowClass}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/portfolio/" className={rowClass}>
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/contact/" className={rowClass}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sub-panel (slide-in with Back) */}
        <div
          id="mobile-nav-subpanel"
          inert={activeKey === null || undefined}
          className={`absolute inset-0 overflow-y-auto bg-white pb-2 transition-transform duration-300 ease-brand ${
            activeKey ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button
            ref={backRef}
            type="button"
            onClick={goBack}
            className="flex min-h-[44px] w-full items-center gap-2 border-b border-ink-100 px-4 py-2.5 text-left text-base font-semibold text-ink-900 active:bg-paper-50"
          >
            <ChevronLeft size={20} className="shrink-0 text-slate-400" aria-hidden="true" />
            Back
          </button>
          {activeGroup ? (
            <>
              <p className="eyebrow px-5 pb-1 pt-4">{activeGroup.label}</p>
              <ul className="divide-y divide-ink-100">
                <li>
                  <Link
                    href={activeGroup.viewAllHref}
                    className={`${subRowClass} justify-between font-semibold text-terra-600`}
                  >
                    {activeGroup.viewAllLabel}
                    <ChevronRight size={16} className="shrink-0" aria-hidden="true" />
                  </Link>
                </li>
                {activeGroup.categories.map((category) => (
                  <li key={category.slug}>
                    <Link href={categoryPath(category)} className={subRowClass}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      {/* Foot — phone (display format verbatim from globals), quote, email */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-ink-100 p-5">
        <Button
          href={globals.phoneHref}
          variant="secondary"
          size="md"
          fullWidth
          iconLeft={<Phone size={18} />}
        >
          {globals.phone}
        </Button>
        <Button href="/get-custom-quote/" variant="primary" size="md" fullWidth>
          Get Free Quote
        </Button>
        <a
          href={`mailto:${globals.email}`}
          className="text-center text-sm text-slate-600 transition-colors duration-150 ease-brand hover:text-terra-600"
        >
          {globals.email}
        </a>
      </div>
    </Drawer>
  );
}
