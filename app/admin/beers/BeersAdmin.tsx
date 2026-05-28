'use client';

import { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Camera } from 'lucide-react';
import type { Beer, Asset } from '@prisma/client';
import {
  createBeer,
  updateBeer,
  deleteBeer,
  toggleBeerVisibility,
  reorderBeers,
} from './actions';

type BeerWithAsset = Beer & { asset: Asset | null };

interface Props {
  initialBeers: BeerWithAsset[];
  beerPhotos: Asset[];
}

export default function BeersAdmin({ initialBeers, beerPhotos }: Props) {
  const [beers, setBeers] = useState<BeerWithAsset[]>(initialBeers);
  const [photos] = useState<Asset[]>(beerPhotos);
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeer, setEditingBeer] = useState<BeerWithAsset | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    type: '',
    price: '',
    abv: '',
    description: '',
    assetId: '' as string | null,
  });

  function openNew() {
    setEditingBeer(null);
    setForm({ name: '', type: '', price: '', abv: '', description: '', assetId: null });
    setIsModalOpen(true);
    setShowPhotoPicker(false);
  }

  function openEdit(beer: BeerWithAsset) {
    setEditingBeer(beer);
    setForm({
      name: beer.name,
      type: beer.type,
      price: beer.price.toString(),
      abv: beer.abv?.toString() || '',
      description: beer.description || '',
      assetId: beer.assetId,
    });
    setIsModalOpen(true);
    setShowPhotoPicker(false);
  }

  function closeModal() {
    setIsModalOpen(false);
    setShowPhotoPicker(false);
  }

  function selectPhoto(assetId: string) {
    setForm(prev => ({ ...prev, assetId }));
    setShowPhotoPicker(false);
  }

  function clearPhoto() {
    setForm(prev => ({ ...prev, assetId: null }));
  }

  const selectedPhoto = photos.find(p => p.id === form.assetId) || (editingBeer?.asset ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      price: parseFloat(form.price),
      abv: form.abv ? parseFloat(form.abv) : undefined,
      description: form.description.trim() || undefined,
      assetId: form.assetId || undefined,
    };

    if (!payload.name || !payload.type || !payload.price) {
      alert('Name, type, and price are required.');
      return;
    }

    startTransition(async () => {
      if (editingBeer) {
        const updated = await updateBeer(editingBeer.id, payload);
        setBeers(prev => prev.map(b => (b.id === updated.id ? { ...updated, asset: updated.asset || null } as any : b)));
      } else {
        const created = await createBeer(payload);
        setBeers(prev => [...prev, { ...created, asset: created.asset || null } as any]);
      }
      closeModal();
    });
  }

  async function handleToggle(beer: BeerWithAsset) {
    const newVisible = !beer.isVisible;
    setBeers(prev => prev.map(b => (b.id === beer.id ? { ...b, isVisible: newVisible } : b)));

    startTransition(async () => {
      await toggleBeerVisibility(beer.id, newVisible);
    });
  }

  async function handleDelete(beer: BeerWithAsset) {
    if (!confirm(`Delete "${beer.name}"? This cannot be undone.`)) return;

    setBeers(prev => prev.filter(b => b.id !== beer.id));
    startTransition(async () => {
      await deleteBeer(beer.id);
    });
  }

  async function moveBeer(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= beers.length) return;

    const newBeers = [...beers];
    const [moved] = newBeers.splice(index, 1);
    newBeers.splice(newIndex, 0, moved);

    setBeers(newBeers);

    startTransition(async () => {
      await reorderBeers(newBeers.map(b => b.id));
    });
  }

  const visibleCount = beers.filter(b => b.isVisible).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Beers on Tap</h1>
          <p className="text-text-secondary mt-1">
            {beers.length} beers • {visibleCount} visible on the public site. Changes appear instantly.
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add New Beer
        </button>
      </div>

      {beers.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-secondary mb-4">No beers yet. Add your first tap list item.</p>
          <button onClick={openNew} className="btn btn-primary">Add First Beer</button>
        </div>
      ) : (
        <div className="space-y-3">
          {beers.map((beer, index) => {
            const photo = beer.asset;
            return (
              <div key={beer.id} className="card beer-admin-card flex flex-col md:flex-row md:items-center gap-4 p-5">
                <div className="w-full md:w-36 h-28 rounded-2xl overflow-hidden bg-surface-elevated flex-shrink-0 border border-border">
                  {photo ? (
                    <img src={photo.path} alt={beer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      No photo
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight">{beer.name}</h3>
                        <div className="font-mono text-xl text-accent tabular-nums">${beer.price.toFixed(2)}</div>
                      </div>
                      <div className="text-text-secondary">{beer.type} {beer.abv && `• ${beer.abv}% ABV`}</div>
                    </div>

                    <button
                      onClick={() => handleToggle(beer)}
                      className="toggle"
                      data-visible={beer.isVisible}
                      title={beer.isVisible ? 'Visible on public site' : 'Hidden from public site'}
                    >
                      <div className="toggle-thumb">
                        {beer.isVisible ? 'ON' : 'OFF'}
                      </div>
                    </button>
                  </div>

                  {beer.description && (
                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">{beer.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                    {photo && <span>Photo attached</span>}
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-2 md:gap-1.5 flex-shrink-0">
                  <button onClick={() => moveBeer(index, 'up')} className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30" disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveBeer(index, 'down')} className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30" disabled={index === beers.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  <button onClick={() => openEdit(beer)} className="btn btn-ghost px-3 py-2 text-sm">
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(beer)} className="btn btn-ghost px-3 py-2 text-sm text-danger hover:bg-danger/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                {editingBeer ? 'Edit Beer' : 'Add New Beer'}
              </h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Beer Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Style / Type</label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Price ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">ABV % (optional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.abv}
                  onChange={e => setForm({ ...form, abv: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Photo (from Beers folder in Media Library)</label>
                <div className="flex items-center gap-2">
                  {selectedPhoto ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-border p-1 pr-3">
                      <img src={selectedPhoto.path} className="h-9 w-9 rounded-xl object-cover" alt="" />
                      <span className="text-xs truncate max-w-[120px]">{selectedPhoto.original}</span>
                      <button type="button" onClick={clearPhoto} className="ml-1 text-danger">×</button>
                    </div>
                  ) : (
                    <div className="text-xs text-text-muted">No photo selected</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                    className="btn btn-secondary text-xs px-3 py-1.5"
                  >
                    <Camera className="h-3.5 w-3.5" /> {selectedPhoto ? 'Change' : 'Choose from Media'}
                  </button>
                </div>
              </div>

              {showPhotoPicker && (
                <div className="rounded-2xl border border-border bg-surface p-4 max-h-64 overflow-auto">
                  <div className="text-xs mb-2 text-text-muted">Click a photo from the Beers folder</div>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.length === 0 && <div className="col-span-4 text-xs text-text-muted">No beer photos yet. Upload some in the Media Library first (Beers folder).</div>}
                    {photos.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPhoto(p.id)}
                        className={`rounded-xl overflow-hidden border ${form.assetId === p.id ? 'ring-2 ring-accent border-accent' : 'border-border hover:border-accent/50'}`}
                      >
                        <img src={p.path} className="aspect-square w-full object-cover" alt={p.original} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input min-h-[80px] resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? 'Saving…' : editingBeer ? 'Save Changes' : 'Add to Tap List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
