'use client';

/** Two-row Vital header: brand/contact row, dark navigation and existing mega menus. */

import dynamic from 'next/dynamic';
import { ChevronDown, Mail, Menu, Phone, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Button } from '@/components/ui/button';
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

const HeaderPanels = dynamic(() => import('./HeaderPanels').then((module) => module.HeaderPanels), { ssr: false });

export interface HeaderProps {
  globals: Globals;
  /** All 22 categories as light projections — Header groups them itself. */
  categories: NavCategory[];
  logoUrl?: string;
}

const HOVER_INTENT_MS = 150;

const navLinkClass =
  'flex h-12 items-center gap-1 whitespace-nowrap px-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white xl:px-3 xl:text-sm';
const iconButtonClass =
  'press flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-700 transition-colors duration-150 ease-brand hover:bg-ink-100';
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
  const whatsappDigits = '16109988971';
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hi! I would like a custom packaging quote.')}`
    : null;

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelsActivated, setPanelsActivated] = useState(false);
  const [focusPanel, setFocusPanel] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeGroup = useMemo(() => groups.find((group) => group.key === openMenu) ?? null, [groups, openMenu]);

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

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onBreakpoint = () => {
      setOpenMenu(null);
      setSearchOpen(false);
      if (media.matches) setDrawerOpen(false);
    };
    media.addEventListener('change', onBreakpoint);
    return () => media.removeEventListener('change', onBreakpoint);
  }, []);

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

  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const open = (key: string) => {
    setPanelsActivated(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSearchOpen(false);
    setOpenMenu(key);
  };

  const closeMenus = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
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
    setFocusPanel(true);
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
      headerRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-controls="header-search"]').forEach((button) => {
        if (button.getClientRects().length) button.focus();
      });
    }
  };

  /* Focus leaving the header closes any open panel (spec §6.1). */
  const onHeaderBlur = (e: ReactFocusEvent) => {
    const next = e.relatedTarget;
    if (next instanceof Node && headerRef.current?.contains(next)) return;
    setOpenMenu(null);
  };

  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Progressive enhancement: plain GET works without JS; with JS we keep
    // client-side navigation. Empty queries just go to the shop hub.
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    setSearchOpen(false);
    router.push(q ? `/shop/?q=${encodeURIComponent(q)}` : '/shop/');
  };

  const toggleSearch = () => {
    setPanelsActivated(true);
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
        className="sticky top-0 z-[var(--z-header)] bg-white shadow-sm [--header-h:72px] lg:[--header-h:124px]"
      >
        {/* Upper row: brand and direct contact options. */}
        <div className="header-container-hm flex h-[72px] items-center justify-between gap-3 lg:h-[76px]">
          <Link href="/" className="shrink-0 rounded-md" aria-label="Vital Custom Boxes — home">
            <Image
              src={logoUrl}
              alt="Vital Custom Boxes"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              sizes="(min-width: 1024px) 150px, 120px"
              className="h-auto w-[120px] lg:w-[150px]"
            />
          </Link>

          <div className="ml-auto hidden items-center gap-4 lg:flex xl:gap-6">
            <a href={globals.phoneHref} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink-900 hover:text-terra-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-terra-500 text-white"><Phone size={17} aria-hidden="true" /></span>
              {globals.phone}
            </a>
            <a href={`mailto:${globals.email}`} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink-900 hover:text-terra-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-terra-500 text-white"><Mail size={18} aria-hidden="true" /></span>
              {globals.email}
            </a>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Chat with Vital Custom Boxes on WhatsApp" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white transition-colors hover:bg-[#128C7E]">
                <svg viewBox="0 0 32 32" width="27" height="27" fill="currentColor" aria-hidden="true">
                  <path d="M16.04 4C9.96 4 5 8.95 5 15.02c0 2.12.6 4.1 1.64 5.79L5 28l7.36-1.6a11 11 0 0 0 3.68.63h.01C22.13 27.03 27.1 22.08 27.1 16 27.1 8.95 22.12 4 16.04 4Zm0 20.2c-1.13 0-2.24-.2-3.28-.6l-.24-.1-4.37.95.93-4.26-.16-.25a9.1 9.1 0 0 1-1.4-4.85c0-5.03 4.1-9.12 9.13-9.12 2.44 0 4.73.95 6.45 2.67a9.06 9.06 0 0 1 2.68 6.46c0 5.03-4.1 9.12-9.13 9.12Zm5.01-6.83c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.18-.52-.32Z" />
                </svg>
              </a>
            ) : null}
            <Button href="/get-custom-quote/" variant="primary" size="md">Get Quote</Button>
          </div>

          {/* Compact touch controls retain the existing drawer and search. */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button type="button" aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-search" onClick={toggleSearch} className={iconButtonClass}>
              <Search size={21} aria-hidden="true" />
            </button>
            <Button href="/get-custom-quote/" variant="primary" size="md" className="hidden min-[480px]:inline-flex">Get Quote</Button>
            <button type="button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={drawerOpen} aria-controls="mobile-nav" onClick={() => setDrawerOpen(true)} className={iconButtonClass}>
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Lower row: full-width brand-dark navigation. */}
        <div className="hidden bg-[#101820] lg:block">
          <div className="header-container-hm flex h-12 items-center">
            <nav aria-label="Main" className="flex h-full min-w-0 flex-1 items-center gap-1">
              <Link href="/" className={navLinkClass} aria-current={isActivePath(pathname, '/') ? 'page' : undefined}>Home</Link>
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
                  {`Boxes ${group.label.toLowerCase()}`}
                  <ChevronDown size={15} className="chevron text-terra-500" aria-hidden="true" />
                </button>
              ))}
              {[
                { name: 'Blog', href: '/blog/' },
                { name: 'About Us', href: '/about-us/' },
                { name: 'Reviews', href: '/reviews/' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass} aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}>{link.name}</Link>
              ))}
            </nav>
            <button ref={searchButtonRef} type="button" aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-search" onClick={toggleSearch} className="flex h-12 w-14 shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white">
              <Search size={24} aria-hidden="true" />
            </button>
            <Link href="/portfolio/" aria-current={isActivePath(pathname, '/portfolio/') ? 'page' : undefined} className="flex h-12 shrink-0 items-center justify-center bg-terra-500 px-7 text-sm font-bold text-white transition-colors hover:bg-terra-600">Portfolio</Link>
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

        {panelsActivated ? (
          <HeaderPanels
            openMenu={openMenu}
            activeGroup={activeGroup}
            searchOpen={searchOpen}
            focusPanel={focusPanel}
            onPanelFocused={() => setFocusPanel(false)}
            onPanelEnter={onPanelEnter}
            onZoneLeave={onZoneLeave}
            onSearchSubmit={onSearchSubmit}
          />
        ) : null}
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