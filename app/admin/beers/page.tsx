import { getBeers, getBeerPhotos } from './actions';
import BeersAdmin from './BeersAdmin';

export const dynamic = 'force-dynamic';

export default async function BeersPage() {
  const [initialBeers, beerPhotos] = await Promise.all([
    getBeers(),
    getBeerPhotos(),
  ]);

  return <BeersAdmin initialBeers={initialBeers} beerPhotos={beerPhotos} />;
}
