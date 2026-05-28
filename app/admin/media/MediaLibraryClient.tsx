'use client';

import { useState, useTransition } from 'react';
import { Upload, Image as ImageIcon, Trash2, Camera, FolderOpen } from 'lucide-react';
import { uploadPhotos, deleteAsset } from './actions';
import type { Asset, AssetFolder } from '@prisma/client';

const FOLDERS: { key: AssetFolder; label: string; color: string }[] = [
  { key: 'BEERS', label: 'Beers on Tap', color: 'text-amber-400' },
  { key: 'MENU', label: 'Menu Items', color: 'text-emerald-400' },
  { key: 'SPECIALS', label: 'Daily Specials', color: 'text-rose-400' },
  { key: 'GENERAL', label: 'General / Other', color: 'text-sky-400' },
];

export default function MediaLibraryClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [activeFolder, setActiveFolder] = useState<AssetFolder | 'ALL'>('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState<AssetFolder>('BEERS');
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');

  const filteredAssets = assets
    .filter(a => activeFolder === 'ALL' || a.folder === activeFolder)
    .filter(a => !search || a.original.toLowerCase().includes(search.toLowerCase()) || a.filename.toLowerCase().includes(search.toLowerCase()));

  async function handleFiles(files: FileList | null, targetFolder: AssetFolder) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    formData.append('folder', targetFolder);

    startTransition(async () => {
      const res = await uploadPhotos(formData);
      if (res.results) {
        const newOnes = res.results.filter((r: any) => r.success && r.asset).map((r: any) => r.asset);
        setAssets(prev => [...newOnes, ...prev]);
      }
    });
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files, selectedFolderForUpload);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files, selectedFolderForUpload);
    e.target.value = '';
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo? It will be removed from the library.')) return;

    startTransition(async () => {
      await deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    });
  }

  function triggerCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => handleFiles(input.files, selectedFolderForUpload);
    input.click();
  }

  function triggerGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => handleFiles(input.files, selectedFolderForUpload);
    input.click();
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Media Library</h1>
          <p className="text-text-secondary mt-1">Upload photos from your phone. Organize by category. Pick them when creating beers or menu items.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={triggerCamera} className="btn btn-secondary gap-2">
            <Camera className="h-4 w-4" /> Take Photo
          </button>
          <button onClick={triggerGallery} className="btn btn-primary gap-2">
            <Upload className="h-4 w-4" /> Upload from Gallery
          </button>
        </div>
      </div>

      {/* Folder tabs + upload target selector */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveFolder('ALL')}
          className={`rounded-2xl px-4 py-1.5 text-sm transition ${activeFolder === 'ALL' ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`}
        >
          All Photos
        </button>
        {FOLDERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFolder(f.key)}
            className={`rounded-2xl px-4 py-1.5 text-sm transition ${activeFolder === f.key ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`}
          >
            <span className={f.color}>{f.label}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-text-muted">Upload new photos to:</span>
          <select
            value={selectedFolderForUpload}
            onChange={e => setSelectedFolderForUpload(e.target.value as AssetFolder)}
            className="rounded-xl border border-border bg-surface px-3 py-1 text-sm focus:border-accent"
          >
            {FOLDERS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`mb-8 rounded-3xl border-2 border-dashed p-10 text-center transition ${isDragging ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
          <FolderOpen className="h-6 w-6 text-accent" />
        </div>
        <p className="mt-4 text-lg font-medium">Drop photos here</p>
        <p className="text-sm text-text-secondary">or use the buttons above. Works great from your phone camera roll or camera.</p>
        <p className="mt-1 text-[10px] tracking-widest text-text-muted">Photos are stored locally in this project • organized by folder</p>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search photos by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <div className="text-xs text-text-muted">{filteredAssets.length} photos</div>
        {isPending && <div className="text-xs text-accent">Processing…</div>}
      </div>

      {/* Photo grid */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <p className="text-text-secondary">No photos in this folder yet. Upload some from your phone.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {filteredAssets.map(asset => {
            const folderInfo = FOLDERS.find(f => f.key === asset.folder)!;
            return (
              <div key={asset.id} className="group relative overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="aspect-square overflow-hidden bg-black/40">
                  <img
                    src={asset.path}
                    alt={asset.original}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium" title={asset.original}>{asset.original}</div>
                      <div className="text-[10px] text-text-muted">
                        {folderInfo.label} • {formatSize(asset.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="rounded-full p-1.5 text-text-muted opacity-60 hover:bg-danger/10 hover:text-danger hover:opacity-100"
                      title="Delete photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                      {asset.path}
                    </div>
                  </div>
                </div>

                {/* Quick action overlay */}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(asset.path);
                      alert('Path copied: ' + asset.path);
                    }}
                    className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black hover:bg-white"
                  >
                    Copy path
                  </button>
                  <button
                    onClick={() => alert('Photo picker will be wired when we build the Beers and Menu editors.\nFor now the path is ready to use: ' + asset.path)}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-light"
                  >
                    Use this photo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 text-xs text-text-secondary">
        <strong className="text-text-primary">Pro tip for staff:</strong> Use “Take Photo” on your phone for instant uploads straight from the kitchen or bar. Organize into the right folder so they’re easy to find when you’re adding new beers or menu items later. All photos stay private to this admin until you attach them.
      </div>
    </div>
  );
}
