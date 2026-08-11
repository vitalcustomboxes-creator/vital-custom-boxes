/**
 * app/layout.tsx — root layout (BE-1).
 *
 * Contracts implemented here:
 *  - DESIGN_SPEC §0.3 / ISSUES (DESIGNER, data-js): the `data-js` inline
 *    script is the FIRST thing inside <head>. animations.css scopes every
 *    scroll-reveal hidden state under `html[data-js]`, so content is never
 *    invisible without JS.
 *  - DESIGN_SPEC §0.2: fonts must expose the CSS variables --font-poppins /
 *    --font-manrope (tokens.css aliases them to --font-display/--font-body).
 *    SANDBOX FALLBACK (ISSUES log, S3): fonts.googleapis.com is unreachable
 *    from the build sandbox (egress is npm-only — verified 2026-06-12), so
 *    next/font/google would hard-fail `next build`. tokens.css already
 *    declares safe fallback stacks: var(--font-poppins, 'Poppins', …) /
 *    var(--font-manrope, 'Manrope', …) — with the variables undefined those
 *    stacks apply. AT CUTOVER restore the spec snippet (network available):
 *
 *      import { Manrope, Poppins } from "next/font/google";
 *      const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"],
 *        variable: "--font-poppins", display: "swap" });
 *      const manrope = Manrope({ subsets: ["latin"],
 *        variable: "--font-manrope", display: "swap" });
 *      <html lang="en" suppressHydrationWarning
 *            className={`${poppins.variable} ${manrope.variable}`}>
 *
 *  - DESIGN_SPEC §3: skip link is the first child of <body>; <main id="main">
 *    is the target. §6.10: main gets pb-24 md:pb-0 to clear StickyMobileCTA.
 *  - Audit: Organization+LocalBusiness JSON-LD once, sitewide, via orgSchema().
 *  - Shared facts (phone/SLA/MOQ/promo) flow from content/globals.json via
 *    props (ISSUES, SEO-2 claims item) — components never hardcode them.
 *
 * NOTE: MobileNavDrawer is NOT rendered here — FE-2's Header owns it (the
 * drawer is controlled: `open`/`onClose` state lives in the Header client
 * component, which renders <MobileNavDrawer> itself).
 */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

import { toNavCategories } from "@/components/patterns/nav-types";
import { SiteChrome } from "@/components/patterns/SiteChrome";
import { SmoothScroll } from "@/components/patterns/SmoothScroll";
import { ToastProvider } from "@/components/ui";
import { getCategories, getGlobals } from "@/lib/content";
import {
  buildMetadata,
  JsonLd,
  METADATA_BASE,
  orgSchema,
  STATIC_PAGE_META,
} from "@/lib/seo";

import "react-phone-number-input/style.css";
import "../styles/globals.css";
import "lenis/dist/lenis.css";

const home = STATIC_PAGE_META["/"];

/**
 * Sitewide defaults (TECH_SEO §2.1: metadataBase set exactly once, here).
 * Every page exports its own buildMetadata(); these values only apply to
 * routes that have not shipped their metadata yet — BE-2: remember that the
 * canonical below ("/") is inherited too, so ALWAYS override per route.
 */
export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  ...buildMetadata({
    title: home.title,
    description: home.description,
    path: "/",
  }),
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101820", // ink-900
};

/** Footer "Popular categories" — curated 8 (Footer renders max 8). */
const POPULAR_CATEGORY_SLUGS = [
  "custom-boxes",
  "custom-mailer-boxes",
  "custom-pizza-boxes",
  "custom-bakery-boxes",
  "mylar-bags",
  "custom-rigid-boxes",
  "custom-cosmetics-boxes",
  "custom-gift-boxes",
];

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const globals = getGlobals();
  const categories = getCategories();
  const navCategories = toNavCategories(categories);
  const footerCategories = POPULAR_CATEGORY_SLUGS.flatMap((slug) => {
    const match = navCategories.find((c) => c.slug === slug);
    return match ? [match] : [];
  });

  return (
    /*
     * suppressHydrationWarning: the data-js script below mutates the <html>
     * element before React hydrates (standard pre-hydration bootstrap, same
     * pattern as next-themes). Suppression applies to this element only.
     */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DESIGN_SPEC §0.3 — MUST stay the first tag in <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-js','');if(location.hostname.toLowerCase().startsWith('admin.'))document.documentElement.setAttribute('data-admin-host','')",
          }}
        />
      </head>
      <body className="bg-paper-50 font-body text-base text-slate-600 antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <JsonLd data={orgSchema()} />
        {/* ToastProvider wired once at the root (ISSUES, FE-1 item) so any
            client component can useToast(); children stay server-rendered. */}
        <ToastProvider>
          <SiteChrome
            globals={globals}
            categories={navCategories}
            footerCategories={footerCategories}
          >
            {children}
          </SiteChrome>
        </ToastProvider>
        {/* Tawk.to live chat widget */}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/68f51361abd1d819558fb399/1j8b78kcq';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}