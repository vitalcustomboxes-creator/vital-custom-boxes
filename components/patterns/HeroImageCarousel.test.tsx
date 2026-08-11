import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroImageCarousel } from './HeroImageCarousel';

const images = [
  { src: '/img/hm/wp-content/uploads/one.webp', alt: 'One' },
  { src: '/img/hm/wp-content/uploads/two.webp', alt: 'Two' },
  { src: '/img/hm/wp-content/uploads/three.webp', alt: 'Three' },
];

describe('HeroImageCarousel', () => {
  it('advances and reverses with arrow controls', () => {
    const { container } = render(<HeroImageCarousel images={images} />);
    const root = container.querySelector('[data-active-slide]');

    expect(root).toHaveAttribute('data-active-slide', '0');

    fireEvent.click(screen.getByRole('button', { name: 'Next packaging image' }));
    expect(root).toHaveAttribute('data-active-slide', '1');

    fireEvent.click(screen.getByRole('button', { name: 'Previous packaging image' }));
    expect(root).toHaveAttribute('data-active-slide', '0');
  });

  it('jumps to a selected dot', () => {
    const { container } = render(<HeroImageCarousel images={images} />);
    const root = container.querySelector('[data-active-slide]');

    fireEvent.click(screen.getByRole('button', { name: 'Show packaging image 3' }));

    expect(root).toHaveAttribute('data-active-slide', '2');
    expect(screen.getByRole('button', { name: 'Show packaging image 3' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
