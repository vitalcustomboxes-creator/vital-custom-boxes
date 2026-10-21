import { ProductEditorWorkspace } from '@/components/admin/AdminWorkspace';
import { getCategories } from '@/lib/content';
import { createEmptyAdminProduct } from '@/lib/admin-product';

export default function CreateProductPage() {
  const categories = getCategories().map(({ slug, name }) => ({ slug, name }));
  return <ProductEditorWorkspace mode="create" initialProduct={createEmptyAdminProduct(categories[0])} categories={categories} />;
}
