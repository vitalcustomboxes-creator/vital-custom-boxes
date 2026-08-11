'use client';

/**
 * components/patterns/Header.tsx — Client shell. Owner: FE-2.
 *
 * New IA (PM brief — replaces the live header; "Locations" is intentionally
 * REMOVED, its old URLs 308 via lib/redirects.ts):
 *   Home · By Industry ▾ · By Material ▾ · By Style ▾ · Portfolio · Contact
 *   + search (inline GET /shop/?q=) · Get Free Quote.
 *
 * - Mega menus: one full-width panel per group with category image tiles from
 *   content/categories.json (passed as NavCategory props) + "View all" tail.
 *   Open on hover (150ms intent) AND click/Enter/ArrowDown; close on Escape
 *   (focus → trigger), outside click, focus leaving, route change. `.menu-pop`
 *   200ms animation, aria-haspopup/aria-expanded/aria-controls per spec §3.
 *   Panel contents mount on first open so 22 remote images never load eagerly.
 * - Sticky with blur-in: `data-scrolled` set past 80px scroll (rAF-throttled);
 *   styles flip via `data-[scrolled]:` variants.
 * - Content arrives via props (globals + categories) — lib/content.ts is
 *   server-only and must never be imported here (ISSUES #13/#15).
 *
 * Usage (BE-1 layout):
 *   <Header globals={getGlobals()} categories={toNavCategories(getCategories())} />
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { categoryPath } from '@/lib/routes';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from 'react';
import { Button } from '@/components/ui';
import type { Globals } from '@/lib/types';
import { MobileNavDrawer } from './MobileNavDrawer';
import {
  DEFAULT_LOGO_URL,
  groupNavCategories,
  LOGO_HEIGHT,
  LOGO_WIDTH,
  type NavCategory,
  type NavGroup,
} from './nav-types';

export interface HeaderProps {
  globals: Globals;
  /** All 22 categories as light projections — Header groups them itself. */
  categories: NavCategory[];
  logoUrl?: string;
}

const HOVER_INTENT_MS = 150;

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

const navLinkClass =
  'flex h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-[15px] font-semibold text-ink-700 transition-colors duration-150 ease-brand hover:text-terra-600';
const iconButtonClass =
  'press flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-700 transition-colors duration-150 ease-brand hover:bg-ink-100';
const tileClass =
  'group/tile relative z-10 flex items-center gap-3 rounded-md p-2 transition-colors duration-150 ease-brand focus-visible:bg-paper-50';

type MegaIndicator = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Compare a link href against the current pathname (trailing-slash safe). */
function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const norm = (s: string) => (s.endsWith('/') ? s : `${s}/`);
  return norm(pathname) === norm(href);
}

export function Header({ globals, categories, logoUrl = DEFAULT_LOGO_URL }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = useMemo(() => groupNavCategories(categories), [categories]);

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaIndicator, setMegaIndicator] = useState<MegaIndicator | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  const headerRef = useRef<HTMLElement | null>(null);
  const panelInnerRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeGroup = useMemo(() => groups.find((group) => group.key === openMenu) ?? null, [groups, openMenu]);

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

  /* ---------------- sticky blur-in after 80px (rAF-throttled) ------------- */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------------- close everything on route change ---------------------- */
  useEffect(() => {
    setOpenMenu(null);
    setSearchOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  /* ---------------- outside click closes menus/search --------------------- */
  useEffect(() => {
    if (!openMenu && !searchOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = headerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpenMenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openMenu, searchOpen]);

  /* ---------------- focus management for the search popover --------------- */
  useEffect(() => {
    if (!searchOpen) return;
    const raf = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [searchOpen]);

  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

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
  }, []);

  const open = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSearchOpen(false);
    setOpenMenu(key);
  };

  const closeMenus = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    setMegaIndicator(null);
    setOpenMenu(null);
  };

  /* Hover intent — mouse only; touch relies on click toggling. */
  const onTriggerEnter = (key: string) => (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => open(key), HOVER_INTENT_MS);
  };
  const onZoneLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (openTimer.current) clearTimeout(openTimer.current);
    setMegaIndicator(null);
    closeTimer.current = setTimeout(() => setOpenMenu(null), HOVER_INTENT_MS);
  };
  const onPanelEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const toggleMenu = (key: string) => {
    if (openMenu === key) setOpenMenu(null);
    else open(key);
  };

  const openAndFocusPanel = (group: NavGroup) => {
    open(group.key);
    requestAnimationFrame(() => {
      document
        .getElementById('mega-menu-panel')
        ?.querySelector<HTMLElement>('a')
        ?.focus();
    });
  };

  const onTriggerKeyDown = (group: NavGroup) => (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAndFocusPanel(group);
    }
  };

  /* Escape: close + return focus to the disclosure trigger (spec §3). */
  const onHeaderKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Escape') return;
    if (openMenu) {
      const trigger = triggerRefs.current.get(openMenu);
      closeMenus();
      trigger?.focus();
    }
    if (searchOpen) {
      setSearchOpen(false);
      searchButtonRef.current?.focus();
    }
  };

  /* Focus leaving the header closes any open panel (spec §6.1). */
  const onHeaderBlur = (e: ReactFocusEvent) => {
    const next = e.relatedTarget;
    if (next instanceof Node && headerRef.current?.contains(next)) return;
    setMegaIndicator(null);
    setOpenMenu(null);
  };

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

  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Progressive enhancement: plain GET works without JS; with JS we keep
    // client-side navigation. Empty queries just go to the shop hub.
    e.preventDefault();
    const q = searchInputRef.current?.value.trim() ?? '';
    setSearchOpen(false);
    router.push(q ? `/shop/?q=${encodeURIComponent(q)}` : '/shop/');
  };

  const toggleSearch = () => {
    setOpenMenu(null);
    setSearchOpen((v) => !v);
  };

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={scrolled ? '' : undefined}
        onKeyDown={onHeaderKeyDown}
        onBlur={onHeaderBlur}
        className="sticky top-0 z-[var(--z-header)] h-[var(--header-h)] border-b border-transparent bg-paper-50 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ease-brand data-[scrolled]:border-ink-100 data-[scrolled]:bg-[var(--header-bg-blur)] data-[scrolled]:shadow-e1"
      >
        <div className="header-container-hm flex h-full items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0 rounded-md" aria-label="Vital Custom Boxes — home">
            <Image
              src={logoUrl}
              alt="Vital Custom Boxes"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              className="h-9 w-auto md:h-10"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className={`${navLinkClass} ${isActivePath(pathname, '/') ? 'text-terra-600' : ''}`}
              aria-current={isActivePath(pathname, '/') ? 'page' : undefined}
            >
              Home
            </Link>
            {groups.map((group) => (
              <button
                key={group.key}
                ref={(el) => {
                  if (el) triggerRefs.current.set(group.key, el);
                  else triggerRefs.current.delete(group.key);
                }}
                type="button"
                aria-haspopup="true"
                aria-expanded={openMenu === group.key}
                aria-controls="mega-menu-panel"
                onPointerEnter={onTriggerEnter(group.key)}
                onPointerLeave={onZoneLeave}
                onClick={() => toggleMenu(group.key)}
                onKeyDown={onTriggerKeyDown(group)}
                className={navLinkClass}
              >
                {group.label}
                <ChevronDown size={16} className="chevron text-slate-400" aria-hidden="true" />
              </button>
            ))}

            <Link
              href="/about-us/"
              className={`${navLinkClass} ${isActivePath(pathname, '/about-us/') ? 'text-terra-600' : ''}`}
              aria-current={isActivePath(pathname, '/about-us/') ? 'page' : undefined}
            >
              About Us
            </Link>
            <Link
              href="/portfolio/"
              className={`${navLinkClass} ${isActivePath(pathname, '/portfolio/') ? 'text-terra-600' : ''}`}
              aria-current={isActivePath(pathname, '/portfolio/') ? 'page' : undefined}
            >
              Portfolio
            </Link>
            <Link
              href="/contact/"
              className={`${navLinkClass} ${isActivePath(pathname, '/contact/') ? 'text-terra-600' : ''}`}
              aria-current={isActivePath(pathname, '/contact/') ? 'page' : undefined}
            >
              Contact
            </Link>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              ref={searchButtonRef}
              type="button"
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-controls="header-search"
              onClick={toggleSearch}
              className={iconButtonClass}
            >
              <Search size={20} aria-hidden="true" />
            </button>
            <Button
              href="/get-custom-quote/"
              variant="primary"
              size="md"
              className="hidden min-[480px]:inline-flex"
            >
              Get Free Quote
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav"
              onClick={() => setDrawerOpen(true)}
              className={`${iconButtonClass} lg:hidden`}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Backdrop scrim — dims + blurs the page below the header while a
            mega menu or the search popover is open (Apple-style focus).
            Rendered before the panels so they paint on top of it; lives inside
            <header> so it sits above page content but under the panels. */}
        <div
          aria-hidden="true"
          data-open={openMenu !== null || searchOpen ? '' : undefined}
          onClick={() => {
            closeMenus();
            setSearchOpen(false);
          }}
          onPointerEnter={onZoneLeave}
          className="menu-scrim"
        />

        {/* Mega panel — Apple-style. The shared shell morphs its height (0 ↔ the
            measured active-group height, and group→group) on --ease-nav, so it
            opens, resizes, and closes in place instead of collapsing. Groups
            crossfade via `popLayout` (outgoing pulled out of flow so the panel
            sizes to the incoming one), and the links cascade up on reveal. */}
        <motion.div
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
                <motion.div
                  key={displayGroup.key}
                  variants={groupV}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="container-hm py-8"
                >
                  <motion.p variants={itemV} className="eyebrow mb-4">
                    {displayGroup.label}
                  </motion.p>
                  <motion.ul
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
                      <motion.li key={category.slug} variants={itemV}>
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
                      </motion.li>
                    ))}
                    <motion.li variants={itemV}>
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
                    </motion.li>
                  </motion.ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Inline search popover (GET /shop/?q=). It uses the same height morph
            and content reveal as the desktop mega menus so switching between
            navigation actions feels like one coherent system. */}
        <motion.div
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
                <motion.form
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
                  <motion.div variants={itemV} className="flex min-w-[200px] flex-1 flex-col gap-1.5">
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
                  </motion.div>
                  <motion.div variants={itemV}>
                    <Button type="submit" variant="primary" size="md">
                      Search
                    </Button>
                  </motion.div>
                </motion.form>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </header>

      {/* Mobile nav drawer — portaled to <body> by the FE-1 Drawer shell */}
      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        globals={globals}
        categories={categories}
      />
    </>
  );
}
