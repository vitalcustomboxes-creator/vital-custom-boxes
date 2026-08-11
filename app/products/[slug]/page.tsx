import { notFound, permanentRedirect } from "next/navigation";

import { getProducts } from "@/lib/content";
import { getPublicProduct } from "@/lib/public-products";
import { productPath } from "@/lib/routes";

interface Params {
  slug: string;
}

interface LegacyProductPageProps {
  params: Promise<Params>;
}

export const dynamicParams = true;

export function generateStaticParams(): Params[] {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export default async function LegacyProductPage({
  params,
}: LegacyProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) notFound();

  permanentRedirect(productPath(product));
}
