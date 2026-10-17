/** Business-confirmed USD unit-price range. Keep visible copy and schema aligned. */
export interface ProductPricing {
  currency: "USD";
  lowPrice: number;
  highPrice: number;
  note: string;
}

const DEFAULT_PRICING: ProductPricing = {
  currency: "USD",
  lowPrice: 0.10,
  highPrice: 50,
  note: "Price per unit varies with size, quantity, material, printing and finishes. Request a quote for your exact specifications and order quantity.",
};

/** Add product-specific ranges here as they become available. */
const PRODUCT_PRICING: Record<string, ProductPricing> = {};

export function getProductPricing(slug: string): ProductPricing {
  const pricing = PRODUCT_PRICING[slug] ?? DEFAULT_PRICING;
  if (!Number.isFinite(pricing.lowPrice) || !Number.isFinite(pricing.highPrice) ||
      pricing.lowPrice <= 0 || pricing.highPrice < pricing.lowPrice) {
    throw new Error(`Invalid product pricing: ${slug}`);
  }
  return { ...pricing };
}

export function formatProductPriceRange(pricing: ProductPricing): string {
  const format = new Intl.NumberFormat("en-US", {
    style: "currency", currency: pricing.currency,
  });
  return `${format.format(pricing.lowPrice)}–${format.format(pricing.highPrice)} USD per unit`;
}
