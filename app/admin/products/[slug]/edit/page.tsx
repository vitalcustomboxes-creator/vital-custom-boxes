import { ProductEditorWorkspace } from '@/components/admin/AdminWorkspace';
import { createEmptyAdminProduct, toAdminProduct } from '@/lib/admin-product';
import { getCategories, getProducts } from '@/lib/content';

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = getCategories().map(({ slug: categorySlug, name }) => ({ slug: categorySlug, name }));
  const product = getProducts().find((item) => item.slug === slug);
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const initialProduct = product
    ? toAdminProduct(product, categoryNames.get(product.category))
    : { ...createEmptyAdminProduct(categories[0]), slug };
  return <ProductEditorWorkspace mode="edit" initialProduct={initialProduct} categories={categories} />;
}
