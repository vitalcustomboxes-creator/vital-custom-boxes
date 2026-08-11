/**
 * components/patterns/Footer.tsx — Server Component. Owner: FE-2.
 * DESIGN_SPEC §6.3: `.dark-section` footer, 4 columns (About / Quick Links /
 * Trending categories / Get in touch), payment methods as a PLAIN labeled
 * text row (audit: no fake security badges), auto © year, legal bottom bar.
 *
 * Audit/content rules: every contact fact (address, phone, email, socials,
 * compliance disclaimer) renders from `globals` props — nothing hardcoded.
 * NOTE: lucide-react v1 removed brand icons, so the social glyphs are tiny
 * inline SVGs (aria-hidden) inside labeled links (logged in ISSUES).
 *
 * Usage (BE-1 layout):
 *   <Footer globals={getGlobals()} categories={toNavCategories(getCategories())} />
 */

import { CreditCard, Mail, MapPin, Phone, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { categoryPath } from '@/lib/routes';
import type { Globals } from '@/lib/types';
import {
  DEFAULT_LOGO_URL,
  LOGO_HEIGHT,
  LOGO_WIDTH,
  type NavCategory,
} from './nav-types';

export interface FooterProps {
  globals: Globals;
  /** Trending/popular categories (rendered max 8 — pass a curated slice). */
  categories: NavCategory[];
  /** Short brand blurb (claim-free default; SLA/MOQ text belongs to globals). */
  blurb?: string;
  logoUrl?: string;
}

const QUICK_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'About Us', href: '/about-us/' },
  { label: 'How It Works', href: '/how-it-works/' },
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'FAQs', href: '/faqs/' },
  { label: 'Samples', href: '/samples/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
];

const LEGAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Terms & Conditions', href: '/terms-conditions/' },
  { label: 'Shipping Policy', href: '/shipping-policy/' },
  { label: 'Return Policy', href: '/return-policy/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Sitemap', href: '/sitemap/' },
];

const DEFAULT_BLURB =
  'Vital Custom Boxes designs and manufactures premium custom boxes, bags, and retail packaging — made to order for your brand, from first dieline to doorstep.';

/* Brand glyphs (lucide v1 dropped these) — decorative, links carry labels. */
function SocialGlyph({ network }: { network: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
    focusable: false as const,
  };
  switch (network) {
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.75 8.43-4.92 8.43-9.94Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.744 2.282a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.222-.334.134-1.25-.581-2.03-2.408-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.868-.835 1.958-1.243 2.621.936.29 1.93.446 2.962.446 5.522 0 10-4.477 10-10S17.523 2 12 2Z" />
        </svg>
      );
    default:
      return null;
  }
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  pinterest: 'Pinterest',
};

const columnHeading =
  'mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-heading)]';
const footerLink =
  'block py-1.5 text-sm text-[var(--color-text)] transition-colors duration-150 ease-brand hover:text-[var(--color-link)]';

export function Footer({
  globals,
  categories,
  blurb = DEFAULT_BLURB,
  logoUrl = DEFAULT_LOGO_URL,
}: FooterProps) {
  // globals.address still carries a "(TODO client: …)" marker from content —
  // strip the parenthetical for display only (logged in ISSUES for the client).
  const address = globals.address.replace(/\s*\(TODO[^)]*\)/i, '').trim();
  const socials = (['facebook', 'instagram', 'linkedin', 'x', 'pinterest'] as const)
    .map((key) => ({ key, href: globals.social[key] }))
    .filter((s) => Boolean(s.href));

  return (
    <footer className="dark-section">
      <div className="container-hm reveal-stagger grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* 1 — About */}
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Vital Custom Boxes — home">
            <Image
              src={logoUrl}
              alt="Vital Custom Boxes"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mt-4 max-w-[36ch] text-sm text-[var(--color-text)]">{blurb}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {socials.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={SOCIAL_LABELS[key]}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors duration-150 ease-brand hover:border-[var(--color-border-strong)] hover:text-white"
                >
                  <SocialGlyph network={key} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 2 — Quick links */}
        <nav aria-label="Quick links">
          <h2 className={columnHeading}>Quick Links</h2>
          <ul>
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={footerLink}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3 — Trending shop sections */}
        <nav aria-label="Trending shop sections">
          <h2 className={columnHeading}>Trending Shop</h2>
          <ul>
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <Link href={categoryPath(category)} className={footerLink}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 4 — Get in touch */}
        <div>
          <h2 className={columnHeading}>Get in Touch</h2>
          <ul>
            {address ? (
              <li className="flex items-start gap-2.5 py-1.5 text-sm text-[var(--color-text)]">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {address}
              </li>
            ) : null}
            <li>
              <a href={globals.phoneHref} className={`${footerLink} flex items-center gap-2.5`}>
                <Phone size={16} className="shrink-0" aria-hidden="true" />
                {globals.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${globals.email}`} className={`${footerLink} flex items-center gap-2.5`}>
                <Mail size={16} className="shrink-0" aria-hidden="true" />
                {globals.email}
              </a>
            </li>
            <li>
              <a
                href={globals.social.trustpilot}
                target="_blank"
                rel="noreferrer"
                className={`${footerLink} flex items-center gap-2.5`}
              >
                <Star size={16} className="shrink-0" aria-hidden="true" />
                Review us on Trustpilot
              </a>
            </li>
          </ul>
          {/* Payment methods — labeled plain-text row (audit: no fake badges) */}
          <p className="mt-5 flex items-center gap-2.5 text-xs text-[var(--color-text-muted)]">
            <CreditCard size={16} className="shrink-0" aria-hidden="true" />
            We accept: Visa · Mastercard · Amex · Discover · PayPal
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="container-hm flex flex-col gap-3 py-6 text-xs text-[var(--color-text-muted)]">
          {globals.complianceDisclaimer ? (
            <p className="max-w-[110ch]">{globals.complianceDisclaimer}</p>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} Vital Custom Boxes. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {LEGAL_LINKS.map(({ label, href }) => (
                  <li key={`${href}${label}`}>
                    <Link
                      href={href}
                      className="transition-colors duration-150 ease-brand hover:text-[var(--color-link)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
