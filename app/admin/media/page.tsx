import { getAssets } from './actions';
import MediaLibrary from './MediaLibraryClient';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const initialAssets = await getAssets();
  return <MediaLibrary initialAssets={initialAssets} />;
}
