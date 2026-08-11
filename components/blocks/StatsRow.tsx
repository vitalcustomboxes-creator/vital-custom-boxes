'use client';

/**
 * StatsRow — Client Component (FE-3 blocks). Count-up stat band.
 *
 * Runs its own IntersectionObserver (same thresholds as <Reveal>): on first
 * intersection it sets data-inview (reusing the .reveal CSS) and animates the
 * numbers 0 → value over ~900ms (rAF, ease-out cubic). Under
 * prefers-reduced-motion (or without IO support) the final values render
 * immediately. Screen readers always get the FINAL value (animated digits
 * are aria-hidden).
 *
 * AUDIT RULE — NO fabricated aggregate numbers: this component ships with no
 * default stats. Every value must be a real, client-approved figure passed in
 * by the page; never invent counts ("500+ brands", "100+ reviews").
 *
 * Color-adaptive: uses semantic tokens, so it works on light bands and
 * inside `.dark-section` (the Home stats band) without changes.
 */
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Stat {
  /** Real, client-approved figure only (audit: no fabricated numbers). */
  value: number;
  /** e.g. "+", "%", "M". */
  suffix?: string;
  prefix?: string;
  label: string;
}

export interface StatsRowProps {
  stats: Stat[];
  /**
   * Section-owning: renders the page's ONE dark band (`.dark-section`,
   * compact) — className lands on the <section>.
   */
  className?: string;
}

const DURATION_MS = 900;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function StatsRow({ stats, className }: StatsRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const start = () => {
      el.setAttribute('data-inview', '');
      if (reduceMotion) {
        setProgress(1);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION_MS);
        setProgress(easeOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className={cn('dark-section section-compact', className)}>
      <div
        ref={rootRef}
        className={cn(
          'container-hm reveal grid grid-cols-2 gap-8 text-center lg:grid-cols-4',
          stats.length < 4 && 'lg:grid-cols-3',
          stats.length < 3 && 'lg:grid-cols-2',
        )}
      >
        {stats.map((stat) => {
          const current = Math.round(stat.value * progress);
          const final = `${stat.prefix ?? ''}${stat.value.toLocaleString('en-US')}${stat.suffix ?? ''}`;
          return (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <p className="font-display text-4xl font-bold text-[var(--color-heading)] md:text-[44px] md:leading-[1.15]">
                {/* Animated digits are decorative; SRs read the final value. */}
                <span aria-hidden="true">
                  {stat.prefix}
                  {current.toLocaleString('en-US')}
                  {stat.suffix}
                </span>
                <span className="sr-only">{final}</span>
              </p>
              <p className="text-sm text-[var(--color-text)]">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StatsRow;
