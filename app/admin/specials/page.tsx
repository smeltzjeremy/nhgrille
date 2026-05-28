import { getSpecials } from './actions';
import SpecialsAdmin from './SpecialsAdmin';

export const dynamic = 'force-dynamic';

export default async function SpecialsPage() {
  const initialSpecials = await getSpecials();
  return <SpecialsAdmin initialSpecials={initialSpecials} />;
}
