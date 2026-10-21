import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GalleryLightbox } from './GalleryLightbox';

const images = [{ src: '/one.webp', alt: 'Front panel' }, { src: '/two.webp', alt: 'Back panel' }];
describe('product gallery accessibility', () => {
  it('supports keyboard navigation and returns focus when the viewer closes', () => {
    render(<GalleryLightbox images={images} alt="Soap carton" />);
    const opener = screen.getByRole('button', { name: 'Open image viewer for Soap carton' });
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Show image 2 of 2' })).toHaveAttribute('aria-current', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
  it('keeps a valid main image after the selected gallery image is removed', () => {
    const { rerender } = render(<GalleryLightbox images={images} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show image 2 of 2' }));
    rerender(<GalleryLightbox images={images.slice(0, 1)} />);
    expect(screen.getByRole('img', { name: 'Front panel' })).toBeInTheDocument();
  });
});
