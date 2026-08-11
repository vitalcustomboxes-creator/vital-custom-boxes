'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

export interface HeroCarouselImage {
  src: string;
  alt: string;
}

export interface HeroImageCarouselProps {
  images: HeroCarouselImage[];
}

export function HeroImageCarousel({ images }: HeroImageCarouselProps) {
  const slides = useMemo(() => images.filter((image) => image.src), [images]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;

    const media =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    if (media?.matches) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [active, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const goTo = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  const goPrevious = () => {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActive((current) => (current + 1) % slides.length);
  };

  return (
    <div
      data-active-slide={active}
      className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink-900"
    >
      <Image
        key={slides[active].src}
        src={slides[active].src}
        alt={slides[active].alt}
        fill
        priority={active === 0}
        className="object-cover"
        sizes="(min-width: 1024px) 45vw, (min-width: 480px) 60vw, 100vw"
      />

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous packaging image"
            onClick={goPrevious}
            className="press absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-ink-900 shadow-e1 transition-colors duration-150 ease-brand hover:bg-white"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next packaging image"
            onClick={goNext}
            className="press absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-ink-900 shadow-e1 transition-colors duration-150 ease-brand hover:bg-white"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
            {slides.map((image, index) => (
              <button
                key={`${image.src}-dot-${index}`}
                type="button"
                aria-label={`Show packaging image ${index + 1}`}
                aria-current={index === active ? 'true' : undefined}
                onClick={() => goTo(index)}
                className={`h-2.5 w-8 rounded-full shadow-e1 transition-colors duration-200 ease-brand ${
                  index === active ? 'bg-terra-500' : 'bg-white/75 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default HeroImageCarousel;
