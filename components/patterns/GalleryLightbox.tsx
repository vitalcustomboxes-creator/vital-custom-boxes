'use client';

/**
 * GalleryLightbox — Client Component (FE-3). DESIGN_SPEC §6.16 (T3 product).
 *
 * Inline gallery (main image button + thumb rail) that opens a full-screen
 * lightbox. Dialog semantics per spec §3: role="dialog" aria-modal, Escape
 * closes, ←/→ navigate, focus is trapped while open and returned to the
 * opener on close, body scroll locked. Alt text = product name (+ index).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  /** Local or remote image URL. Product content uses localized /img/... assets. */
  src: string;
  /** Per-image alt; falls back to the gallery-level `alt`. */
  alt?: string;
}

export interface GalleryLightboxProps {
  /** Image URLs or {src, alt} objects. */
  images: Array<string | GalleryImage>;
  /** Base alt text — the product name (fallback for images without alt). */
  alt?: string;
  className?: string;
}

export function GalleryLightbox({ images, alt, className }: GalleryLightboxProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const items: GalleryImage[] = images.map((img) =>
    typeof img === 'string' ? { src: img } : img,
  );
  const count = items.length;
  const baseAlt = alt ?? items[0]?.alt ?? 'Product image';
  const imageAlt = (i: number) => {
    const itemAlt = items[i]?.alt ?? baseAlt;
    return count > 1 ? `${itemAlt} — image ${i + 1} of ${count}` : itemAlt;
  };

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);

  const moveZoom = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    setZoomOrigin({
      x: Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100)),
    });
  };

  // Keyboard + scroll lock while the lightbox is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowRight' && count > 1) {
        e.preventDefault();
        next();
        return;
      }
      if (e.key === 'ArrowLeft' && count > 1) {
        e.preventDefault();
        prev();
        return;
      }
      // Minimal focus trap: cycle Tab within the dialog.
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !dialog.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, count, close, next, prev]);

  if (count === 0) return null;

  const navButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-brand hover:bg-white/20';

  return (
    <div className={className}>
      {/* ----------------------------- inline gallery ---------------------------- */}
      <button
        ref={openerRef}
        type="button"
        onClick={() => {
          setZoomed(false);
          setOpen(true);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          moveZoom(event);
          setZoomed(true);
        }}
        onPointerMove={moveZoom}
        onPointerLeave={() => setZoomed(false)}
        onPointerCancel={() => setZoomed(false)}
        aria-label="Open image viewer"
        aria-haspopup="dialog"
        className="card-media relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border border-ink-100 bg-white"
      >
        <Image
          key={items[index].src}
          src={items[index].src}
          alt={imageAlt(index)}
          fill
          priority
          unoptimized={items[index].src.startsWith('/api/product-images/')}
          sizes="100vw"
          className={cn(
            'object-cover transition-transform duration-200 ease-out motion-reduce:transition-none',
            zoomed && 'scale-[2.25]',
          )}
          style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
        />
        <span
          className={cn(
            'gallery-zoom-hint pointer-events-none absolute bottom-3 right-3 items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-e1 backdrop-blur-sm transition-opacity',
            zoomed && 'opacity-0',
          )}
          aria-hidden="true"
        >
          <ZoomIn size={15} />
          Hover to zoom
        </span>
      </button>

      {count > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {items.map(({ src }, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => {
                setZoomed(false);
                setZoomOrigin({ x: 50, y: 50 });
                setIndex(i);
              }}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === index ? 'true' : undefined}
              data-active={i === index || undefined}
              className="relative aspect-square overflow-hidden rounded-md border border-ink-100 bg-white transition-colors duration-150 ease-brand hover:border-slate-400 data-[active]:border-terra-500 data-[active]:shadow-[0_0_0_1px_var(--color-terra-500)]"
            >
              <Image
                src={src}
                alt=""
                fill
                unoptimized={src.startsWith('/api/product-images/')}
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* -------------------------------- lightbox ------------------------------- */}
      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${baseAlt} — image viewer`}
          className="fixed inset-0 z-[var(--z-modal)]"
        >
          <div
            className="anim-fade-in absolute inset-0 bg-[rgba(11,37,54,0.85)]"
            onClick={close}
            aria-hidden="true"
          />

          <div className="pointer-events-none fixed inset-0 grid place-items-center p-4 md:p-12">
            <Image
              key={index}
              src={items[index].src}
              alt={imageAlt(index)}
              width={1200}
              height={900}
              unoptimized={items[index].src.startsWith('/api/product-images/')}
              sizes="100vw"
              className="anim-fade-in pointer-events-auto h-auto max-h-[85vh] w-auto rounded-md"
            />
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close image viewer"
            className={cn(navButtonClass, 'absolute right-4 top-4')}
          >
            <X size={24} aria-hidden="true" />
          </button>

          {count > 1 && (
            <>
              {/* ≥768: prev/next pinned to the sides */}
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className={cn(
                  navButtonClass,
                  'absolute left-4 top-1/2 hidden -translate-y-1/2 md:flex',
                )}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className={cn(
                  navButtonClass,
                  'absolute right-4 top-1/2 hidden -translate-y-1/2 md:flex',
                )}
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>

              {/* ≤767: controls row bottom-center */}
              <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4 md:bottom-8">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className={cn(navButtonClass, 'md:hidden')}
                >
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
                <p className="text-sm text-white/70" aria-live="polite">
                  {index + 1} / {count}
                </p>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className={cn(navButtonClass, 'md:hidden')}
                >
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GalleryLightbox;
