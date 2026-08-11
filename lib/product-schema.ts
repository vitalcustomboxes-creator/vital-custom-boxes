/**
 * Runtime shape of a catalog product, shared by the two places that ingest
 * untrusted product data:
 *  - app/api/admin/publish-catalog — validating documents read from Firestore
 *  - lib/public-products           — validating the snapshot read back from R2
 *
 * Kept free of `server-only` and of any fs/network import so both can use it.
 */
import { z } from 'zod';

import type { Product } from '@/lib/types';

const image = z.object({ src: z.string().min(1), alt: z.string() });
const faq = z.object({ question: z.string(), answer: z.string() });

export const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  description: z.string(),
  imageUrl: z.string().min(1),
  imageAlt: z.string().optional(),
  images: z.array(image).optional(),
  category: z.string().min(1),
  sku: z.string().optional(),
  faqs: z.array(faq).optional(),
  highlights: z.array(z.string()).optional(),
  bestFor: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  finishes: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  copyStatus: z.enum(['live', 'derived']),
});

/** Drops malformed entries rather than failing the whole catalog. */
export function parseProducts(raw: unknown[]): Product[] {
  return raw.flatMap((entry) => {
    const parsed = productSchema.safeParse(entry);
    return parsed.success ? [parsed.data as Product] : [];
  });
}
