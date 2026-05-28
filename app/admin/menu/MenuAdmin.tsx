'use client';

import { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Camera } from 'lucide-react';
import type { MenuCategory, MenuItem, Asset } from '@prisma/client';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemVisibility,
  reorderCategories,
  reorderItemsInCategory,
} from './actions';

type CategoryWithItems = MenuCategory & {
  items: (MenuItem & { asset: Asset | null })[];
};

interface Props {
  initialCategories: CategoryWithItems[];
  menuPhotos: Asset[];
}

export default function MenuAdmin({ initialCategories, menuPhotos }: Props) {
  const [categories, setCategories] = useState<CategoryWithItems[]>(initialCategories);
  const [photos] = useState<Asset[]>(menuPhotos);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: MenuCategory | null }>({ open: false });
  const [itemModal, setItemModal] = useState<{ open: boolean; editing?: any; categoryId?: string }>({ open: false });
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  // Forms
  const [catForm, setCatForm] = useState({ name: '' });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    assetId: null as string | null,
  });

  // Category modal
  function openNewCategory() {
    setCatForm({ name: '' });
    setCatModal({ open: true, editing: null });
  }
  function openEditCategory(cat: MenuCategory) {
    setCatForm({ name: cat.name });
    setCatModal({ open: true, editing: cat });
  }
  function closeCatModal() {
    setCatModal({ open: false });
  }

  // Item modal
  function openNewItem(categoryId: string) {
    setItemForm({ name: '', description: '', price: '', assetId: null });
    setItemModal({ open: true, editing: null, categoryId });
    setShowPhotoPicker(false);
  }
  function openEditItem(item: any, categoryId: string) {
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      assetId: item.assetId,
    });
    setItemModal({ open: true, editing: item, categoryId });
    setShowPhotoPicker(false);
  }
  function closeItemModal() {
    setItemModal({ open: false });
    setShowPhotoPicker(false);
  }

  const selectedItemPhoto = photos.find(p => p.id === itemForm.assetId);

  // Submit handlers
  async function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    startTransition(async () => {
      if (catModal.editing) {
        const updated = await updateCategory(catModal.editing.id, catForm.name);
        setCategories(prev => prev.map(c => c.id === updated.id ? { ...c, name: updated.name } : c));
      } else {
        const created = await createCategory(catForm.name);
        setCategories(prev => [...prev, { ...created, items: [] } as any]);
      }
      closeCatModal();
    });
  }

  async function submitItem(e: React.FormEvent) {
    e.preventDefault();
    const { categoryId } = itemModal;
    if (!categoryId || !itemForm.name.trim() || !itemForm.price) return;

    const payload = {
      categoryId,
      name: itemForm.name,
      description: itemForm.description || undefined,
      price: parseFloat(itemForm.price),
      assetId: itemForm.assetId || undefined,
    };

    startTransition(async () => {
      if (itemModal.editing) {
        const updated = await updateMenuItem(itemModal.editing.id, payload);
        setCategories(prev => prev.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map(it => it.id === updated.id ? { ...updated, asset: updated.asset || null } as any : it),
          };
        }));
      } else {
        const created = await createMenuItem(payload);
        setCategories(prev => prev.map(cat => {
          if (cat.id !== categoryId) return cat;
          return { ...cat, items: [...cat.items, { ...created, asset: created.asset || null } as any] };
        }));
      }
      closeItemModal();
    });
  }

  // Toggles
  async function toggleCat(cat: MenuCategory) {
    const newVis = !cat.isVisible;
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isVisible: newVis } : c));
    startTransition(() => toggleCategoryVisibility(cat.id, newVis));
  }

  async function toggleItem(item: MenuItem, catId: string) {
    const newVis = !item.isVisible;
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(it => it.id === item.id ? { ...it, isVisible: newVis } : it),
      };
    }));
    startTransition(() => toggleMenuItemVisibility(item.id, newVis));
  }

  // Deletes
  async function deleteCat(cat: MenuCategory) {
    if (!confirm(`Delete category "${cat.name}" and ALL its items?`)) return;
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    startTransition(() => deleteCategory(cat.id));
  }

  async function deleteItem(item: MenuItem, catId: string) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, items: cat.items.filter(it => it.id !== item.id) };
    }));
    startTransition(() => deleteMenuItem(item.id));
  }

  // Reordering
  async function moveCategory(index: number, dir: 'up' | 'down') {
    const ni = dir === 'up' ? index - 1 : index + 1;
    if (ni < 0 || ni >= categories.length) return;
    const arr = [...categories];
    const [m] = arr.splice(index, 1);
    arr.splice(ni, 0, m);
    setCategories(arr);
    startTransition(() => reorderCategories(arr.map(c => c.id)));
  }

  async function moveItem(catId: string, itemIndex: number, dir: 'up' | 'down') {
    const catIdx = categories.findIndex(c => c.id === catId);
    const items = [...categories[catIdx].items];
    const ni = dir === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (ni < 0 || ni >= items.length) return;
    const [m] = items.splice(itemIndex, 1);
    items.splice(ni, 0, m);

    const newCats = [...categories];
    newCats[catIdx] = { ...newCats[catIdx], items };
    setCategories(newCats);

    startTransition(() => reorderItemsInCategory(catId, items.map(i => i.id)));
  }

  function selectItemPhoto(id: string) {
    setItemForm(f => ({ ...f, assetId: id }));
    setShowPhotoPicker(false);
  }

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Menu Management</h1>
          <p className="text-text-secondary mt-1">
            {categories.length} categories • {totalItems} items. Use red/green toggles to hide sold-out dishes instantly.
          </p>
        </div>
        <button onClick={openNewCategory} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-text-secondary">No categories yet. Create Appetizers, Mains, etc.</p>
          <button onClick={openNewCategory} className="btn btn-primary mt-4">Create First Category</button>
        </div>
      )}

      <div className="space-y-8">
        {categories.map((cat, catIndex) => (
          <div key={cat.id} className="card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">{cat.name}</h2>
                <button
                  onClick={() => toggleCat(cat)}
                  className="toggle"
                  data-visible={cat.isVisible}
                >
                  <div className="toggle-thumb">{cat.isVisible ? 'ON' : 'OFF'}</div>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => moveCategory(catIndex, 'up')} disabled={catIndex === 0} className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => moveCategory(catIndex, 'down')} disabled={catIndex === categories.length - 1} className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => openEditCategory(cat)} className="btn btn-ghost px-3 py-1.5 text-sm ml-2">
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => deleteCat(cat)} className="btn btn-ghost px-3 py-1.5 text-sm text-danger hover:bg-danger/10">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => openNewItem(cat.id)} className="btn btn-primary text-sm px-4 py-1.5 ml-2">
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
            </div>

            {cat.items.length === 0 && (
              <div className="text-sm text-text-muted py-4">No items yet in this category.</div>
            )}

            <div className="space-y-2">
              {cat.items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-surface-elevated p-4 border border-border/60">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/30 flex-shrink-0 border border-border">
                    {item.asset ? (
                      <img src={item.asset.path} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">No photo</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <div className="font-medium text-lg">{item.name}</div>
                      <div className="font-mono text-accent tabular-nums">${item.price.toFixed(2)}</div>
                    </div>
                    {item.description && <div className="text-sm text-text-secondary line-clamp-1">{item.description}</div>}
                  </div>

                  <button onClick={() => toggleItem(item, cat.id)} className="toggle" data-visible={item.isVisible}>
                    <div className="toggle-thumb">{item.isVisible ? 'ON' : 'OFF'}</div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button onClick={() => moveItem(cat.id, idx, 'up')} disabled={idx === 0} className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button onClick={() => moveItem(cat.id, idx, 'down')} disabled={idx === cat.items.length - 1} className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditItem(item, cat.id)} className="btn btn-ghost px-3 py-1.5 text-sm">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteItem(item, cat.id)} className="btn btn-ghost px-3 py-1.5 text-sm text-danger hover:bg-danger/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-background p-7">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
              {catModal.editing ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={submitCategory} className="space-y-4">
              <div>
                <label className="label">Category Name</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={e => setCatForm({ name: e.target.value })}
                  className="input"
                  placeholder="Appetizers"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeCatModal} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? 'Saving…' : catModal.editing ? 'Save' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-background p-7">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
              {itemModal.editing ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>

            <form onSubmit={submitItem} className="space-y-5">
              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="Buffalo Wings"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={itemForm.price}
                    onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Photo (optional)</label>
                  <div className="flex items-center gap-2">
                    {selectedItemPhoto ? (
                      <div className="flex items-center gap-2 rounded-xl border border-border p-1 pr-3 text-xs">
                        <img src={selectedItemPhoto.path} className="h-8 w-8 rounded-lg object-cover" />
                        <span className="truncate max-w-[90px]">{selectedItemPhoto.original}</span>
                        <button type="button" onClick={() => setItemForm(f => ({ ...f, assetId: null }))} className="text-danger">×</button>
                      </div>
                    ) : <span className="text-xs text-text-muted">None</span>}
                    <button type="button" onClick={() => setShowPhotoPicker(!showPhotoPicker)} className="btn btn-secondary text-xs px-3 py-1.5">
                      <Camera className="h-3.5 w-3.5" /> Choose
                    </button>
                  </div>
                </div>
              </div>

              {showPhotoPicker && (
                <div className="rounded-2xl border border-border bg-surface p-3 max-h-48 overflow-auto">
                  <div className="grid grid-cols-5 gap-2">
                    {photos.length === 0 && <div className="col-span-5 text-xs text-text-muted">Upload menu photos in the Media Library first (MENU folder).</div>}
                    {photos.map(p => (
                      <button key={p.id} type="button" onClick={() => selectItemPhoto(p.id)} className={`rounded-lg overflow-hidden border ${itemForm.assetId === p.id ? 'ring-2 ring-accent' : ''}`}>
                        <img src={p.path} className="aspect-square w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  value={itemForm.description}
                  onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                  className="input min-h-[70px]"
                  placeholder="Served with celery &amp; blue cheese"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeItemModal} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? 'Saving…' : itemModal.editing ? 'Save Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
