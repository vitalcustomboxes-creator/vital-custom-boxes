/**
 * components/patterns/Hero.tsx — Server Components. Owner: FE-2.
 *
 * Exports:
 *  - <Hero>          home variant (DESIGN_SPEC §6.5) — owns THE page <h1>,
 *                    CTA pair, trust row from globals (via props), optional
 *                    REAL rating strip, kraft visual panel with the inlined
 *                    dieline draw-in (+ optional product image layered on top).
 *  - <InteriorHero>  kraft band for T2/T3/content pages (§6.6) — breadcrumb
 *                    slot, <h1>, short sub. No dieline, no sheen.
 *
 * NO client wrapper is needed for the entrance animation: `.hero-enter`,
 * `.hero-enter-visual` and `.draw-in` are pure-CSS one-time animations
 * (styles/animations.css) that run with or without JS — adding a client
 * component would only ship dead JS. Reduced motion is handled globally.
 *
 * Audit rules honoured: single <h1> per page (these own it); all SLA/MOQ/
 * shipping/claim text arrives via props sourced from content/globals.json
 * (server page composes the strings); rating renders ONLY from real props —
 * nothing here invents numbers.
 */

import { Check } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Button, Rating } from '@/components/ui';
import { Dieline } from './Dieline';
import { HeroImageCarousel, type HeroCarouselImage } from './HeroImageCarousel';

export interface HeroCta {
  label: string;
  href: string;
}

/** Real aggregate review data only (content/ratings.json — 4.9 / 100+). The
 *  aggregateRating JSON-LD is emitted from lib/seo.ts orgSchema(), not here. */
export interface HeroRating {
  /** e.g. 4.8 (real source value). */
  value: number;
  /** Number of reviews behind the value. */
  count: number;
  /** Where the strip links to (e.g. globals.social.trustpilot or /reviews/). */
  href?: string;
  /** Link text, e.g. "Reviews on Trustpilot". */
  label?: string;
}

export interface HeroProps {
  /** Kicker above the h1, e.g. "Premium custom packaging". */
  eyebrow?: string;
  /** THE page <h1>. */
  heading?: ReactNode;
  /** Lead paragraph text. */
  sub?: ReactNode;
  /** Primary CTA button config. */
  primaryCta?: HeroCta;
  /** Secondary CTA button config. */
  secondaryCta?: HeroCta;
  /** Trust row items. */
  trustItems?: string[];
  /** Optional rating strip. */
  rating?: HeroRating;
  /** Optional product image. */
  image?: { src: string; alt: string };
  /** Optional carousel images. */
  images?: HeroCarouselImage[];
  /** Optional showcase graphic URL. */
  showcaseImage?: string;
  /** Theme variant ('navy' for landing page hero, 'paper' for light theme). */
  variant?: 'navy' | 'paper';
}

const DEFAULT_PRIMARY: HeroCta = {
  label: 'Get Free Quote',
  href: '/get-custom-quote/',
};

export function Hero({
  eyebrow,
  heading,
  sub,
  primaryCta = DEFAULT_PRIMARY,
  secondaryCta,
  trustItems = [],
  rating,
  image,
  images,
  showcaseImage = '/img/landingpage-hero-img.png',
  variant = 'navy',
}: HeroProps) {
  if (variant === 'paper') {
    return (
      <section className="relative overflow-hidden bg-paper-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(242,236,227,0.95),transparent)]"
        />
        <div className="container-hm relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-enter flex flex-col items-start gap-5">
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h1 className="max-w-[16ch]">{heading}</h1>
            {sub ? <p className="lead max-w-[52ch] text-slate-600">{sub}</p> : null}
            <div className="flex w-full flex-wrap gap-3">
              <Button
                href={primaryCta.href}
                variant="primary"
                size="lg"
                sheen
                className="w-full min-[480px]:w-auto"
              >
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  variant="secondary"
                  size="lg"
                  className="w-full min-[480px]:w-auto"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
            {trustItems.length > 0 ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {trustItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={16} className="shrink-0 text-terra-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {rating ? (
              <div className="flex flex-wrap items-center gap-2">
                <Rating value={rating.value} count={rating.count} showValue />
                {rating.href ? (
                  <a
                    href={rating.href}
                    target={rating.href.startsWith('http') ? '_blank' : undefined}
                    rel={rating.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="text-sm font-semibold text-terra-600 transition-colors duration-150 ease-brand hover:text-terra-500"
                  >
                    {rating.label ?? 'Read our reviews'}
                  </a>
                ) : rating.label ? (
                  <span className="text-sm text-slate-600">{rating.label}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="hero-enter-visual w-full max-w-[420px] justify-self-center lg:max-w-none">
            {images && images.length > 0 ? (
              <HeroImageCarousel images={images} />
            ) : image ? (
              <div className="relative overflow-hidden rounded-lg bg-kraft-100 p-6 md:p-8">
                <Dieline
                  draw
                  className="pointer-events-none absolute -bottom-14 -left-14 w-[320px] text-ink-700 opacity-30"
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 45vw, (min-width: 480px) 60vw, 100vw"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-kraft-100 p-8 md:p-12">
                <Dieline draw className="mx-auto w-full max-w-[520px] text-ink-700" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default Navy theme (Landing page hero using project theme tokens: ink-700 brand navy + terra-500 logo amber)
  const defaultHeading = (
    <>
      Custom boxes made<br className="hidden sm:inline" /> easy{' '}
      <span className="text-terra-500">for retail</span>
    </>
  );

  const defaultSub = (
    <>
      Supercharge your brand through the power of{' '}
      <strong className="font-semibold text-white">custom boxes</strong> and{' '}
      <strong className="font-semibold text-white">custom packaging</strong> that&apos;s
      big on wow-factor. With low minimums, free design expertise, super fast delivery
      and unlimited customization, our packaging specialists will help you create eye-catching{' '}
      <strong className="font-semibold text-white">custom shipping boxes</strong> that stand out from the crowd.
    </>
  );

  return (
    <section className="relative overflow-hidden bg-ink-700 text-white">
      {/* Decorative subtle dieline outline at bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 overflow-hidden opacity-20"
      >
        <Dieline draw className="h-96 w-96 text-terra-500/20" />
      </div>

      <div className="container-hm relative grid items-center gap-10 py-14 sm:py-18 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Left Column: Heading, Subtitle & CTA */}
        <div className="hero-enter flex flex-col items-start gap-6 text-left">
          {eyebrow ? (
            <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-wider text-terra-100">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-display text-4xl font-bold tracking-tight text-white leading-[1.12] sm:text-5xl lg:text-[56px]">
            {heading ?? defaultHeading}
          </h1>
          <p className="max-w-[56ch] font-normal text-base leading-relaxed text-ink-100 sm:text-lg sm:leading-relaxed">
            {sub ?? defaultSub}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              href={primaryCta.href}
              variant="primary"
              size="lg"
              sheen
            >
              {primaryCta.label}
            </Button>
          </div>

          {trustItems.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-100">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} className="shrink-0 text-terra-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          {rating ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-100">
              <Rating value={rating.value} count={rating.count} showValue />
              {rating.href ? (
                <a
                  href={rating.href}
                  target={rating.href.startsWith('http') ? '_blank' : undefined}
                  rel={rating.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="font-semibold text-terra-500 transition-colors hover:text-white"
                >
                  {rating.label ?? 'Read our reviews'}
                </a>
              ) : rating.label ? (
                <span>{rating.label}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right Column: Packaging Showcase Visual */}
        <div className="hero-enter-visual relative flex w-full justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px] lg:max-w-none">
            <Image
              src={showcaseImage}
              alt="Custom retail packaging display featuring custom boxes, pop-up containers, mailers, and printed boxes"
              width={580}
              height={350}
              priority
              className="h-auto w-full object-contain filter drop-shadow-2xl"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export interface InteriorHeroProps {
  /** THE page <h1> (line-clamped upstream where needed). */
  heading: string;
  /** Short sub/lede under the title. */
  sub?: string;
  /** FE-3 <Breadcrumbs> goes here (visual only; JSON-LD via lib/seo.ts). */
  breadcrumbs?: ReactNode;
  /** Extra content under the sub (badges, meta row…). Keep it light. */
  children?: ReactNode;
  /** Entrance stagger (default on; pure CSS). */
  animate?: boolean;
}

export function InteriorHero({
  heading,
  sub,
  breadcrumbs,
  children,
  animate = true,
}: InteriorHeroProps) {
  return (
    <section className="border-b border-ink-100 bg-kraft-100">
      <div className="container-hm py-10 md:py-14">
        <div className={animate ? 'hero-enter' : undefined}>
          {breadcrumbs ? <div className="mb-4">{breadcrumbs}</div> : null}
          <h1 className="max-w-[24ch]">{heading}</h1>
          {sub ? <p className="lead mt-3 max-w-[60ch] text-slate-600">{sub}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
