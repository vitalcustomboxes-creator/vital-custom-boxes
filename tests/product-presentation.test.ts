import { describe, expect, it } from 'vitest';
import { productGallery, productSpecValue } from '../lib/product-presentation';
import { quoteFromFormData, quoteSchema } from '../lib/forms';
import type { Product } from '../lib/types';

const product: Product = {
  slug: 'custom-soap-boxes', name: 'Custom Soap Boxes', category: 'custom-cosmetics-boxes',
  description: 'Soap packaging', imageUrl: '/primary.webp', imageAlt: 'Primary soap carton', copyStatus: 'live',
};
describe('product presentation', () => {
  it('keeps a replaced primary image first and removes duplicated gallery URLs', () => {
    expect(productGallery({ ...product, images: [
      { src: '/gallery.webp', alt: 'Back panel' },
      { src: '/primary.webp', alt: 'Duplicate' },
      { src: '/gallery.webp', alt: 'Duplicate' },
      { src: '', alt: '' },
    ] })).toEqual([
      { src: '/primary.webp', alt: 'Primary soap carton' },
      { src: '/gallery.webp', alt: 'Back panel' },
    ]);
  });
  it('does not invent related-product gallery images', () => {
    expect(productGallery(product)).toHaveLength(1);
  });
  it('uses CMS materials without repeating empty or duplicate entries', () => {
    expect(productSpecValue(['Kraft', '', ' Kraft ', 'SBS'], 'Ask us')).toBe('Kraft; SBS');
    expect(productSpecValue([], 'Ask us')).toBe('Ask us');
  });
});
describe('quote shipping destination', () => {
  it('keeps a full address longer than 80 characters separate from country', () => {
    const fd = new FormData();
    const address = '123 Example Road, Building 2, Suite 100, Customer Receiving Department, Albuquerque, NM 87110';
    Object.entries({ name: 'Test Buyer', email: 'buyer@example.com', phone: '+16109988971', quantity: '25', country: 'United States', address }).forEach(([key, value]) => fd.set(key, value));
    const parsed = quoteSchema.parse(quoteFromFormData(fd));
    expect(parsed.address).toBe(address);
    expect(parsed.country).toBe('United States');
  });
});
