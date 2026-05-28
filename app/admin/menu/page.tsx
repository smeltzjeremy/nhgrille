import { getMenuData, getMenuPhotos } from './actions';
import MenuAdmin from './MenuAdmin';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const [initialCategories, menuPhotos] = await Promise.all([
    getMenuData(),
    getMenuPhotos(),
  ]);

  return <MenuAdmin initialCategories={initialCategories} menuPhotos={menuPhotos} />;
}
