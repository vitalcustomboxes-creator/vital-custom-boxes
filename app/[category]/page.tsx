import { notFound, permanentRedirect } from "next/navigation";

import { getCategories, getCategory } from "@/lib/content";
import { categoryPath } from "@/lib/routes";

interface Params {
  category: string;
}

interface LegacyCategoryPageProps {
  params: Promise<Params>;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories().map((c) => ({ category: c.slug }));
}

export default async function LegacyCategoryPage({
  params,
}: LegacyCategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  permanentRedirect(categoryPath(category));
}
