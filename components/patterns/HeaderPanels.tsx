'use client';

/** Loaded only after the first menu/search interaction; header controls stay lightweight. */
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { categoryPath } from '@/lib/routes';
import type { NavGroup } from './nav-types';

const loadNavFeatures = () => import('./nav-animation-features').then((module) => module.default);
/* Apple-style mega-menu motion. The shell morphs its height (0 ↔ measured
   content, and group-to-group) on this soft, weighty deceleration curve; the
   content crossfades while links cascade up. Keep in sync with --dur-nav /
   --ease-nav in tokens.css. */
const NAV_EASE = [0.32, 0.72, 0, 1] as const;
const NAV_PANEL_TRANSITION = { duration: 0.44, ease: NAV_EASE, type: 'tween' as const };

/* Entrance is a per-item cascade (the group stays opaque and only orchestrates);
   on exit the whole group fades fast so a group→group switch reads as a crossfade
   layered over the height morph. */
const megaGroupVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { delayChildren: 0.03, staggerChildren: 0.02 } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: NAV_EASE } },
};
/** Sub-orchestrator so the eyebrow leads and the tiles cascade after it. */
const megaListVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.022 } },
  exit: {},
};
/** Each cascading row (eyebrow + every tile): rises + fades into place. */
const megaItemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: NAV_EASE } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const tileClass =
  'group/tile relative z-10 flex items-center gap-3 rounded-md p-2 transition-colors duration-150 ease-brand focus-visible:bg-paper-50';

type MegaIndicator = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
};


interface HeaderPanelsProps {
  openMenu: string | null;
  activeGroup: NavGroup | null;
  searchOpen: boolean;
  focusPanel: boolean;
  onPanelFocused: () => void;
  onPanelEnter: (event: ReactPointerEvent) => void;
  onZoneLeave: (event: ReactPointerEvent) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function HeaderPanels({ openMenu, activeGroup, searchOpen, focusPanel, onPanelFocused, onPanelEnter, onZoneLeave, onSearchSubmit }: HeaderPanelsProps) {
  const panelInnerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [megaIndicator, setMegaIndicator] = useState<MegaIndicator | null>(null);
  /* Group actually rendered in the panel. While open it tracks the active group
     (crisp switching). On CLOSE we hold the last group so its content rides the
     height collapse in flow — clipped, not popped out — then unmount once the
     panel has finished closing (see onAnimationComplete). This is what makes the
     close read as a single smooth collapse instead of "content vanishes, blank
     strip shrinks". */
  const [heldGroup, setHeldGroup] = useState<NavGroup | null>(null);
  useEffect(() => {
    if (activeGroup) setHeldGroup(activeGroup);
  }, [activeGroup]);
  const displayGroup = activeGroup ?? heldGroup;

  /* Reduced motion: neutralise the morph + cascade to instant reveals (Framer
     ignores the CSS prefers-reduced-motion block, so gate it here). */
  const reduceMotion = useReducedMotion();
  const { panelT, groupV, listV, itemV } = useMemo(() => {
    if (reduceMotion) {
      const instant = { duration: 0 };
      return {
        panelT: instant,
        groupV: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: instant } },
        listV: { initial: {}, animate: {}, exit: {} },
        itemV: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 1 } },
      };
    }
    return {
      panelT: NAV_PANEL_TRANSITION,
      groupV: megaGroupVariants,
      listV: megaListVariants,
      itemV: megaItemVariants,
    };
  }, [reduceMotion]);

  /* ---------------- Apple-style height morph ------------------------------ */
  /* Track the active group's rendered height so the shared panel can animate
     0 ↔ content on open/close AND morph smoothly between groups. ResizeObserver
     is the source of truth: it settles after popLayout has pulled the outgoing
     group out of flow, so it always reads the incoming group's height — no
     effect-ordering guesswork, and it re-measures on viewport resize too. */
  useEffect(() => {
    const el = panelInnerRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(el.offsetHeight);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [displayGroup?.key]);

  const onMegaTileEnter = (key: string) => (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const list = e.currentTarget.closest<HTMLElement>('[data-mega-list]');
    if (!list) return;

    const itemRect = e.currentTarget.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setMegaIndicator({
      key,
      left: itemRect.left - listRect.left,
      top: itemRect.top - listRect.top,
      width: itemRect.width,
      height: itemRect.height,
    });
  };

  const megaIndicatorStyle = (key: string): CSSProperties => {
    if (!megaIndicator || megaIndicator.key !== key) {
      return { opacity: 0 };
    }

    return {
      opacity: 1,
      transform: `translate3d(${megaIndicator.left}px, ${megaIndicator.top}px, 0)`,
      width: megaIndicator.width,
      height: megaIndicator.height,
    };
  };


  // These effects also run after the async panel chunk arrives: keyboard focus
  // must not depend on the module finishing within a single animation frame.
  useEffect(() => {
    if (!searchOpen) return;
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [searchOpen]);

  useEffect(() => {
    if (!focusPanel || !activeGroup) return;
    const frame = requestAnimationFrame(() => {
      panelInnerRef.current?.querySelector<HTMLElement>('a')?.focus();
      onPanelFocused();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusPanel, activeGroup, onPanelFocused]);

  return <LazyMotion features={loadNavFeatures} strict>
        {/* Mega panel — Apple-style. The shared shell morphs its height (0 ↔ the
            measured active-group height, and group→group) on --ease-nav, so it
            opens, resizes, and closes in place instead of collapsing. Groups
            crossfade via `popLayout` (outgoing pulled out of flow so the panel
            sizes to the incoming one), and the links cascade up on reveal. */}
        <m.div
          id="mega-menu-panel"
          data-open={openMenu ? '' : undefined}
          onPointerEnter={onPanelEnter}
          onPointerLeave={onZoneLeave}
          className="menu-pop-shell absolute inset-x-0 top-full hidden lg:block"
          initial={false}
          animate={{ height: openMenu ? panelHeight : 0 }}
          transition={panelT}
          onAnimationComplete={() => {
            // Panel finished collapsing — now it's safe to unmount the held group.
            if (!openMenu) setHeldGroup(null);
          }}
          style={{ pointerEvents: openMenu ? 'auto' : 'none' }}
        >
          <div ref={panelInnerRef} className="menu-pop-inner border-t border-ink-100 bg-white shadow-e3">
            <AnimatePresence mode="popLayout" initial={false}>
              {displayGroup ? (
                <m.div
                  key={displayGroup.key}
                  variants={groupV}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="container-hm py-8"
                >
                  <m.p variants={itemV} className="eyebrow mb-4">
                    {displayGroup.label}
                  </m.p>
                  <m.ul
                    variants={listV}
                    data-mega-list
                    className="relative grid grid-cols-3 gap-1 xl:grid-cols-4"
                    onPointerLeave={() => setMegaIndicator(null)}
                  >
                    <span
                      aria-hidden="true"
                      style={megaIndicatorStyle(displayGroup.key)}
                      className="pointer-events-none absolute left-0 top-0 z-0 rounded-md bg-paper-50 opacity-0 transition-[transform,width,height,opacity] duration-300 ease-brand"
                    />
                    {displayGroup.categories.map((category) => (
                      <m.li key={category.slug} variants={itemV}>
                        <Link
                          href={categoryPath(category)}
                          className={tileClass}
                          onPointerEnter={onMegaTileEnter(displayGroup.key)}
                        >
                          <span className="relative z-10 h-14 w-14 shrink-0 overflow-hidden rounded-md bg-kraft-100">
                            <Image
                              src={category.imageUrl}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </span>
                          <span className="relative z-10 text-sm font-semibold text-ink-700 transition-colors duration-150 ease-brand group-hover/tile:text-terra-600">
                            {category.name}
                          </span>
                        </Link>
                      </m.li>
                    ))}
                    <m.li variants={itemV}>
                      <Link
                        href={displayGroup.viewAllHref}
                        className={tileClass}
                        onPointerEnter={onMegaTileEnter(displayGroup.key)}
                      >
                        <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-kraft-100 text-ink-700">
                          <ArrowRight size={18} aria-hidden="true" />
                        </span>
                        <span className="relative z-10 text-sm font-semibold text-terra-600 transition-colors duration-150 ease-brand group-hover/tile:text-terra-500">
                          {displayGroup.viewAllLabel}
                        </span>
                      </Link>
                    </m.li>
                  </m.ul>
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        </m.div>

        {/* Inline search popover (GET /shop/?q=). It uses the same height morph
            and content reveal as the desktop mega menus so switching between
            navigation actions feels like one coherent system. */}
        <m.div
          id="header-search"
          data-open={searchOpen ? '' : undefined}
          className="menu-pop-shell absolute inset-x-0 top-full"
          initial={false}
          animate={{ height: searchOpen ? 'auto' : 0 }}
          transition={panelT}
          style={{ pointerEvents: searchOpen ? 'auto' : 'none' }}
        >
          <div className="menu-pop-inner border-t border-ink-100 bg-white shadow-e3">
            <AnimatePresence initial={false}>
              {searchOpen ? (
                <m.form
                  key="header-search-form"
                  role="search"
                  action="/shop/"
                  method="get"
                  onSubmit={onSearchSubmit}
                  variants={groupV}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="container-hm flex flex-wrap items-end gap-3 py-4"
                >
                  <m.div variants={itemV} className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                    {/* Visible label — placeholders are never labels (audit). */}
                    <label htmlFor="header-search-input" className="text-sm font-semibold text-ink-700">
                      Search products
                    </label>
                    <input
                      ref={searchInputRef}
                      id="header-search-input"
                      name="q"
                      type="search"
                      placeholder="e.g. mailer boxes"
                      className="h-11 w-full rounded-md border border-ink-100 bg-white px-4 text-base text-ink-900 transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-slate-400 hover:border-slate-400 focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)] focus:outline-none"
                    />
                  </m.div>
                  <m.div variants={itemV}>
                    <Button type="submit" variant="primary" size="md">
                      Search
                    </Button>
                  </m.div>
                </m.form>
              ) : null}
            </AnimatePresence>
          </div>
        </m.div>
  </LazyMotion>;
}
