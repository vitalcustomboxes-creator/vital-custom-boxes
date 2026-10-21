import type { Product } from './types';

/** Never substitute another product's photo for a missing product gallery. */
export function productGallery(product: Product): { src: string; alt: string }[] {
  const seen = new Set<string>();
  return [
    { src: product.imageUrl, alt: product.imageAlt || `${product.name} packaging` },
    ...(product.images ?? []),
  ].filter((image) => {
    if (!image.src?.trim() || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  }).map((image) => ({ ...image, alt: image.alt?.trim() || `${product.name} packaging` }));
}

export function productSpecValue(items: string[] | undefined, fallback: string): string {
  const unique = Array.from(new Set((items ?? []).map((item) => item.trim()).filter(Boolean)));
  return unique.length ? unique.join('; ') : fallback;
}
