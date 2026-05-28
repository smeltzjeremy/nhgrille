'use client';

import { useState, useTransition } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { updateMultipleSettings } from './actions';
import type { SiteSettingKey } from './actions';

interface Props {
  initial: Record<string, string>;
}

export default function SettingsAdmin({ initial }: Props) {
  const [values, setValues] = useState({
    hero_headline: initial.hero_headline || 'A Modern Grille.\nExceptional Food.\nWarm Hospitality.',
    hero_subheadline: initial.hero_subheadline || 'Craft beers on tap, a thoughtfully seasonal menu, and an atmosphere that feels like home.',
    hours_text: initial.hours_text || 'Open Tue–Sun',
    address_text: initial.address_text || '42 Hanover Street, Hanover, NH',
    phone: initial.phone || '(717) 241-5517',
    instagram_url: initial.instagram_url || 'https://instagram.com/n_hanover_grille',
    facebook_url: initial.facebook_url || 'https://facebook.com/p/North-Hanover-Grille-100063744092978',
  });

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function setField(key: keyof typeof values, val: string) {
    setValues(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateMultipleSettings(values as Record<SiteSettingKey, string>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Site Settings</h1>
          <p className="text-text-secondary mt-1">Edit the text that appears on the public homepage and footer. Changes are live instantly.</p>
        </div>
        <a href="/" target="_blank" className="btn btn-secondary gap-2 text-sm">
          View Public Site <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="space-y-8">
        {/* Hero */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Hero Section</h2>
          <p className="text-sm text-text-secondary mb-6">The big text on the landing page.</p>

          <div className="space-y-5">
            <div>
              <label className="label">Headline (use line breaks for the stacked look)</label>
              <textarea
                value={values.hero_headline}
                onChange={e => setField('hero_headline', e.target.value)}
                className="input min-h-[90px] font-medium text-lg"
              />
            </div>
            <div>
              <label className="label">Subheadline</label>
              <textarea
                value={values.hero_subheadline}
                onChange={e => setField('hero_subheadline', e.target.value)}
                className="input min-h-[70px]"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Contact &amp; Hours</h2>
          <p className="text-sm text-text-secondary mb-6">Shown in the footer and hero area.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Hours Text</label>
              <input
                type="text"
                value={values.hours_text}
                onChange={e => setField('hours_text', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={values.address_text}
                onChange={e => setField('address_text', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                value={values.phone}
                onChange={e => setField('phone', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Social Links</h2>
          <p className="text-sm text-text-secondary mb-6">Leave blank to hide the link.</p>

          <div className="space-y-5">
            <div>
              <label className="label">Instagram URL</label>
              <input
                type="url"
                value={values.instagram_url}
                onChange={e => setField('instagram_url', e.target.value)}
                className="input"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="label">Facebook URL</label>
              <input
                type="url"
                value={values.facebook_url}
                onChange={e => setField('facebook_url', e.target.value)}
                className="input"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn btn-primary gap-2 text-base px-10"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving…' : 'Save All Changes'}
        </button>

        {saved && <span className="text-emerald-400 text-sm">Saved! Changes are live on the public site.</span>}
      </div>

      <div className="mt-6 text-xs text-text-muted">
        These values are stored in the database (SiteSetting table) and update the homepage + footer immediately.
      </div>
    </div>
  );
}
