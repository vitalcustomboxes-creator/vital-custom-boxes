/**
 * components/blocks/PageHero.tsx — interior page hero used by BE-2's content
 * routes (owner: BE-2).
 *
 * Thin composition over FE-2's <InteriorHero> (DESIGN_SPEC §6.6) + FE-1's
 * <Breadcrumbs>: pages pass ONE `crumbs` array which feeds the visual
 * breadcrumbs here and `breadcrumbSchema()` (lib/seo) on the page — keeping
 * the two in lockstep. The hero owns the page's single <h1> (audit rule).
 */
import type { ReactNode } from "react";
import Image from "next/image";
import { InteriorHero } from "@/components/patterns/Hero";
import { Breadcrumbs } from "@/components/ui";

export interface Crumb {
  name: string;
  /** Trailing-slash route path (also feeds breadcrumbSchema on the page). */
  href: string;
}

export interface PageHeroProps {
  /** The page's single H1 (audit rule) — use the H1 string from lib/seo maps. */
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  image?: {
    src: string;
    alt: string;
  };
  children?: ReactNode;
}

const DEFAULT_HERO_IMAGES: Record<string, { src: string; alt: string }> = {
  "/about-us/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Product-Packaging-Boxes.webp",
    alt: "Assorted custom product packaging boxes",
  },
  "/how-it-works/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Mailer-Boxes.webp",
    alt: "Custom printed mailer boxes",
  },
  "/portfolio/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Gift-Boxes.webp",
    alt: "Custom printed gift boxes",
  },
  "/case-studies/": {
    src: "/img/hm/wp-content/uploads/2025/03/countertop-display-neba-01-1000px.jpg",
    alt: "Custom printed countertop display packaging",
  },
  "/reviews/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Gift-Boxes.webp",
    alt: "Premium custom gift boxes used for customer packaging projects",
  },
  "/blog/": {
    src: "/img/hm/wp-content/uploads/2025/06/blogs-hero-img.png",
    alt: "Custom packaging examples for packaging guides and articles",
  },
  "/faqs/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Mailer-Boxes.webp",
    alt: "Custom mailer boxes used to explain packaging options",
  },
  "/samples/": {
    src: "/img/hm/wp-content/uploads/2025/04/sample-page-hero-img.png",
    alt: "Packaging stock and finish sample reference",
  },
  "/contact/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Retail-Boxes.webp",
    alt: "Retail packaging boxes ready for quote support",
  },
  "/privacy-policy/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Mailer-Boxes.webp",
    alt: "Custom packaging prepared for private quote handling",
  },
  "/terms-conditions/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Rigid-Boxes.webp",
    alt: "Rigid custom boxes representing order terms and proofs",
  },
  "/shipping-policy/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Printed-Bags.webp",
    alt: "Custom packaging prepared for delivery",
  },
  "/return-policy/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Insert-Boxes.webp",
    alt: "Protective custom inserts for accurate made-to-order packaging",
  },
  "/sitemap/": {
    src: "/img/hm/wp-content/uploads/2025/11/Custom-Display-Boxes.webp",
    alt: "Custom display packaging representing site sections",
  },
};

export function PageHero({ title, lead, crumbs, image, children }: PageHeroProps) {
  const inferredImage =
    image ??
    (crumbs && crumbs.length > 0
      ? DEFAULT_HERO_IMAGES[crumbs[crumbs.length - 1]?.href]
      : undefined);

  if (inferredImage) {
    return (
      <section className="overflow-hidden border-b border-ink-100 bg-kraft-100">
        <div className="container-hm grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_0.72fr] lg:gap-12">
          <div className="hero-enter">
            {crumbs && crumbs.length > 1 ? (
              <div className="mb-4">
                <Breadcrumbs items={crumbs} />
              </div>
            ) : null}
            <h1 className="max-w-[24ch]">{title}</h1>
            {lead ? (
              <p className="lead mt-3 max-w-[60ch] text-slate-600">{lead}</p>
            ) : null}
            {children}
          </div>
          <div className="hero-enter-visual relative">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-lg bg-paper-50"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-e2">
              <Image
                src={inferredImage.src}
                alt={inferredImage.alt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 36vw, (min-width: 768px) 70vw, 100vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,37,54,0.18),transparent_55%)]"
              />
            </div>
            <div className="absolute -bottom-4 left-5 right-5 hidden rounded-lg border border-white/70 bg-white/90 px-5 py-3 shadow-e1 backdrop-blur md:block">
              <p className="font-display text-sm font-semibold text-ink-900">
                Custom packaging, built around your product
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <InteriorHero
      heading={title}
      sub={lead}
      breadcrumbs={
        crumbs && crumbs.length > 1 ? <Breadcrumbs items={crumbs} /> : undefined
      }
    >
      {children}
    </InteriorHero>
  );
}
