'use client';

/**
 * Sitewide Lenis smooth scrolling for public pages.
 *
 * Native scrolling remains the source of truth for reduced-motion users and
 * the admin workspace. Touch scrolling also stays native (`syncTouch: false`).
 */
import type { LenisOptions } from 'lenis';
import dynamic from 'next/dynamic';

const ReactLenis = dynamic(() => import('lenis/react').then((module) => module.ReactLenis), { ssr: false });
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const OPTIONS: LenisOptions = {
  autoRaf: true,
  smoothWheel: true,
  syncTouch: false,
  lerp: 0.1,
  anchors: { offset: -88 },
  stopInertiaOnNavigate: true,
};

export function SmoothScroll() {
  const pathname = usePathname();
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncPreference = () => setMotionAllowed(!media.matches);

    syncPreference();
    media.addEventListener('change', syncPreference);
    return () => media.removeEventListener('change', syncPreference);
  }, []);

  if (!motionAllowed || pathname?.startsWith('/admin')) return null;

  return <ReactLenis root options={OPTIONS} />;
}

export default SmoothScroll;
