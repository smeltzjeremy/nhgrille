'use client';

import { useState, useTransition } from 'react';
import { Upload, FileText, Eye, Trash2, Calendar } from 'lucide-react';
import type { Special } from '@prisma/client';
import {
  uploadSpecialsPdf,
  toggleSpecialVisibility,
  deleteSpecial,
  updateSpecialTitle,
} from './actions';

interface Props {
  initialSpecials: Special[];
}

export default function SpecialsAdmin({ initialSpecials }: Props) {
  const [specials, setSpecials] = useState<Special[]>(initialSpecials);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('Daily Specials');
  const [dragOver, setDragOver] = useState(false);

  const current = specials[0]; // newest one is treated as current

  async function handlePdfUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file only.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    startTransition(async () => {
      const res = await uploadSpecialsPdf(formData);
      if (res.success && res.special) {
        setSpecials(prev => [res.special!, ...prev]);
      } else if (res.error) {
        alert(res.error);
      }
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handlePdfUpload(e.dataTransfer.files);
  }

  async function toggle(id: string, visible: boolean) {
    // optimistic
    setSpecials(prev => prev.map(s => s.id === id ? { ...s, isVisible: visible } : s));
    startTransition(() => toggleSpecialVisibility(id, visible));
  }

  async function remove(id: string) {
    if (!confirm('Delete this specials PDF?')) return;
    setSpecials(prev => prev.filter(s => s.id !== id));
    startTransition(() => deleteSpecial(id));
  }

  async function rename(id: string, newTitle: string) {
    setSpecials(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    startTransition(() => updateSpecialTitle(id, newTitle));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter">Daily Specials</h1>
        <p className="text-text-secondary mt-1">
          Upload the current specials PDF. One big red/green toggle controls whether it shows on the public site.
        </p>
      </div>

      {/* Current / Latest Special */}
      <div className="card p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-gold" />
            <div>
              <div className="font-semibold text-xl">Current Specials Sheet</div>
              <div className="text-sm text-text-muted">This is what appears on the public site when visible</div>
            </div>
          </div>

          {current && (
            <button
              onClick={() => toggle(current.id, !current.isVisible)}
              className="toggle"
              data-visible={current.isVisible}
            >
              <div className="toggle-thumb">{current.isVisible ? 'LIVE' : 'HIDDEN'}</div>
            </button>
          )}
        </div>

        {!current ? (
          <div className="text-text-secondary py-8 text-center border border-dashed border-border rounded-2xl">
            No specials PDF uploaded yet. Use the uploader below.
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={current.title}
                onChange={e => rename(current.id, e.target.value)}
                onBlur={e => rename(current.id, e.target.value)}
                className="input text-lg font-medium max-w-md"
              />
              <div className="text-xs text-text-muted">
                {new Date(current.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* PDF Preview */}
            <div className="rounded-2xl border border-border overflow-hidden bg-surface-elevated">
              <object
                data={current.pdfPath}
                type="application/pdf"
                className="w-full h-[420px]"
              >
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-text-muted mb-3" />
                  <p className="text-text-secondary">PDF preview not available in this browser.</p>
                  <a
                    href={current.pdfPath}
                    target="_blank"
                    className="inline-block mt-3 text-accent hover:underline"
                  >
                    Open PDF in new tab →
                  </a>
                </div>
              </object>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={current.pdfPath}
                target="_blank"
                className="btn btn-secondary text-sm"
              >
                <Eye className="h-4 w-4" /> View Full PDF
              </a>
              <button onClick={() => remove(current.id)} className="btn btn-ghost text-sm text-danger hover:bg-danger/10">
                <Trash2 className="h-4 w-4" /> Delete this sheet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload / Replace zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-3xl border-2 border-dashed p-12 text-center transition ${dragOver ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
          <Upload className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight mb-2">Upload New Specials PDF</h3>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          Drop a PDF here or click the button. This will become the new live specials sheet.
        </p>

        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input max-w-xs text-center"
            placeholder="Daily Specials"
          />

          <label className="btn btn-primary cursor-pointer">
            <Upload className="h-4 w-4" />
            Choose PDF File
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => handlePdfUpload(e.target.files)}
            />
          </label>
        </div>

        <p className="mt-4 text-[10px] text-text-muted tracking-widest">
          Only PDF files • Previous sheets are kept in history below
        </p>
      </div>

      {/* History list */}
      {specials.length > 1 && (
        <div className="mt-10">
          <h3 className="text-sm font-medium tracking-widest text-text-muted mb-3">PREVIOUS SHEETS</h3>
          <div className="space-y-2">
            {specials.slice(1).map(s => (
              <div key={s.id} className="card flex items-center justify-between p-4 text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-text-muted" />
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-text-muted">{new Date(s.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={s.pdfPath} target="_blank" className="btn btn-ghost px-3 py-1 text-xs">View</a>
                  <button onClick={() => toggle(s.id, !s.isVisible)} className="toggle scale-75" data-visible={s.isVisible}>
                    <div className="toggle-thumb">{s.isVisible ? 'ON' : 'OFF'}</div>
                  </button>
                  <button onClick={() => remove(s.id)} className="text-danger p-1 hover:bg-danger/10 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 text-xs text-text-secondary">
        <strong className="text-text-primary">How it works for staff:</strong> Upload a new PDF whenever the kitchen changes the daily specials. Flip the big toggle to hide or show it on the website instantly. The most recent upload becomes the “current” sheet.
      </div>
    </div>
  );
}
