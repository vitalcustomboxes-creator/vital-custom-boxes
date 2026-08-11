'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/patterns/Footer';
import { Header } from '@/components/patterns/Header';
import { PromoBar } from '@/components/patterns/PromoBar';
import { RevealProvider } from '@/components/patterns/RevealProvider';
import { StickyMobileCTA } from '@/components/patterns/StickyMobileCTA';
import { WhatsAppButton } from '@/components/patterns/WhatsAppButton';
import type { NavCategory } from '@/components/patterns/nav-types';
import type { Globals } from '@/lib/types';

interface SiteChromeProps {
  children: ReactNode;
  globals: Globals;
  categories: NavCategory[];
  footerCategories: NavCategory[];
}

export function SiteChrome({
  children,
  globals,
  categories,
  footerCategories,
}: SiteChromeProps) {
  const pathname = usePathname();
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    setIsAdminHost(window.location.hostname.toLowerCase().startsWith('admin.'));
  }, []);

  const isAdmin = pathname.startsWith('/admin') || isAdminHost;

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <div data-public-site-chrome="header" className="contents">
        <PromoBar globals={globals} />
        <Header globals={globals} categories={categories} />
      </div>
      <main id="main" className="pb-24 md:pb-0">
        {children}
      </main>
      <div data-public-site-chrome="footer" className="contents">
        <Footer globals={globals} categories={footerCategories} />
        <StickyMobileCTA globals={globals} />
        <WhatsAppButton globals={globals} />
        <RevealProvider />
      </div>
    </>
  );
}
