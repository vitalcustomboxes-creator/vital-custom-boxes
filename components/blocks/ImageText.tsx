/**
 * ImageText — Server Component (FE-3 blocks). Split image + copy section
 * body (e.g. Materials/Sustainability split on Home, About sections).
 * Pages own the <section class="section bg-…"> wrapper and bg alternation.
 */
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export interface ImageTextProps {
  image: { src: string; alt: string };
  eyebrow?: string;
  title: string;
  /** Paragraphs separated by "\n\n"; rendered as <p> runs. */
  body?: string;
  /** Extra custom content below the body (lists, chips, …). */
  children?: ReactNode;
  cta?: { label: string; href: string };
  /** Image on the right instead of the left (alternate sections). */
  reverse?: boolean;
  /** Visual heading level: render h2 (default) or h3 (audit: single H1). */
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

export function ImageText({
  image,
  eyebrow,
  title,
  body,
  children,
  cta,
  reverse = false,
  headingLevel = 'h2',
  className,
}: ImageTextProps) {
  const Heading = headingLevel;

  return (
    <Reveal
      as="div"
      className={cn('grid items-center gap-10 lg:grid-cols-2 lg:gap-16', className)}
    >
      <div
        className={cn(
          'card-media relative aspect-[4/3] overflow-hidden rounded-lg bg-kraft-100',
          reverse && 'lg:order-2',
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className={cn('flex flex-col items-start gap-4', reverse && 'lg:order-1')}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading>{title}</Heading>
        {body &&
          body.split('\n\n').map((paragraph, i) => (
            <p key={i} className="max-w-[65ch] text-slate-600">
              {paragraph}
            </p>
          ))}
        {children}
        {cta && (
          <Button href={cta.href} variant="secondary" size="md" className="mt-2">
            {cta.label}
          </Button>
        )}
      </div>
    </Reveal>
  );
}

export default ImageText;
