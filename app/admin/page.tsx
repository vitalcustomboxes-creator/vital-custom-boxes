import { AdminPortal } from '@/components/admin/AdminPortal';
import { toAdminProductListItem } from '@/lib/admin-product';
import { getCategories } from '@/lib/content';
import { getPublicProducts } from '@/lib/public-products';

/**
 * The product list is server-rendered from the published R2 snapshot rather
 * than read from Firestore in the browser. The snapshot holds exactly the same
 * products, is rewritten on every admin save, and costs zero Firestore reads —
 * so opening the portal no longer bills one read per product in the catalog.
 *
 * Only the columns the table draws are sent to the client; the editor fetches
 * the full product for the single item being edited.
 */
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const categories = getCategories().map(({ slug, name }) => ({ slug, name }));
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const products = (await getPublicProducts()).map((product) =>
    toAdminProductListItem(product, categoryNames.get(product.category)),
  );

  return <AdminPortal initialProducts={products} categories={categories} />;
}
