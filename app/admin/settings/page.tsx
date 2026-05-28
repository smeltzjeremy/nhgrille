import { getSettings } from './actions';
import SettingsAdmin from './SettingsAdmin';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const initial = await getSettings();
  return <SettingsAdmin initial={initial} />;
}
