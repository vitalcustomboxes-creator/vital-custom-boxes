import type { Product } from '@/lib/types';

export interface AdminImage {
  src: string;
  alt: string;
}

export interface AdminFaq {
  question: string;
  answer: string;
}

export interface AdminProduct {
  slug: string;
  name: string;
  title: string;
  category: string;
  categoryName: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  images: AdminImage[];
  sku: string;
  copyStatus: 'live' | 'derived';
  related: string[];
  highlights: string[];
  materials: string[];
  finishes: string[];
  bestFor: string[];
  faqs: AdminFaq[];
}

export interface CategoryOption {
  slug: string;
  name: string;
}

/**
 * What the admin product table actually renders and searches — nothing more.
 *
 * The full `AdminProduct` carries the description, FAQs, highlights, materials,
 * finishes and gallery for all 285 products; shipping that to the dashboard is
 * ~775 KB of payload to draw a list of names and thumbnails. This is ~68 KB.
 * The editor still loads the complete product for the one item being edited.
 */
export interface AdminProductListItem {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  imageUrl: string;
  sku: string;
}

export function toAdminProductListItem(product: Product, categoryName?: string): AdminProductListItem {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryName: categoryName ?? product.category,
    imageUrl: product.imageUrl,
    sku: product.sku ?? '',
  };
}

/**
 * Build the catalog slug for a product name. The slug is the Firestore document
 * id and the public URL, so admins never type it — a product is identified by
 * its name and the routing follows from that.
 */
export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toAdminProduct(product: Product, categoryName?: string): AdminProduct {
  return {
    slug: product.slug,
    name: product.name,
    title: product.title ?? product.name,
    category: product.category,
    categoryName: categoryName ?? product.category,
    description: product.description,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt ?? product.name,
    images: product.images ?? [],
    sku: product.sku ?? '',
    copyStatus: product.copyStatus,
    related: product.related ?? [],
    highlights: product.highlights ?? [],
    materials: product.materials ?? [],
    finishes: product.finishes ?? [],
    bestFor: product.bestFor ?? [],
    faqs: product.faqs ?? [],
  };
}

export function createEmptyAdminProduct(category?: CategoryOption): AdminProduct {
  return {
    slug: '',
    name: '',
    title: '',
    category: category?.slug ?? '',
    categoryName: category?.name ?? '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    images: [],
    sku: '',
    copyStatus: 'derived',
    related: [],
    highlights: [],
    materials: [],
    finishes: [],
    bestFor: [],
    faqs: [],
  };
}
