export interface ProductReview {
  author: string;
  rating: number;
  body: string;
  datePublished: string;
  sourceUrl?: string;
}

export interface ProductReviewSummary {
  reviews: ProductReview[];
  ratingValue: number;
  reviewCount: number;
}

/** Genuine product-specific reviews only. Company reviews are not product reviews. */
const PRODUCT_REVIEWS: Record<string, ProductReview[]> = {
  "custom-mailer-boxes": [],
  "custom-soap-boxes": [],
  "custom-clothing-boxes": [],
};

export function getProductReviews(slug: string): ProductReview[] {
  return (PRODUCT_REVIEWS[slug] ?? []).filter((review) => {
    const date = new Date(`${review.datePublished}T00:00:00Z`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(review.datePublished) &&
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === review.datePublished &&
      date.getTime() <= Date.now();
    const validSource = !review.sourceUrl || /^https?:\/\//i.test(review.sourceUrl);
    return review.author.trim().length > 0 && review.body.trim().length > 0 &&
      Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5 &&
      validDate && validSource;
  });
}

export function getProductReviewSummary(slug: string): ProductReviewSummary | undefined {
  const reviews = getProductReviews(slug);
  if (!reviews.length) return undefined;
  return {
    reviews,
    ratingValue: Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length * 10) / 10,
    reviewCount: reviews.length,
  };
}
