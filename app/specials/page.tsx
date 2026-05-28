import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { getCurrentSpecial } from '@/lib/public-data';

export const metadata = {
  title: 'Daily Specials',
};

export default async function SpecialsPage() {
  const special = await getCurrentSpecial();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="font-semibold tracking-tight">Today’s Specials</div>
          <Link href="/admin" className="text-xs text-text-muted hover:text-accent">Admin</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-accent text-sm tracking-[3px]">
            <FileText className="h-4 w-4" /> TODAY’S KITCHEN
          </div>
          <h1 className="section-title mt-3">Daily Specials</h1>
          {special && <p className="text-text-secondary mt-2">{special.title}</p>}
        </div>

        {special ? (
          <div className="rounded-3xl border border-border bg-surface overflow-hidden">
            <object
              data={special.pdfPath}
              type="application/pdf"
              className="w-full h-[80vh] min-h-[600px]"
            >
              <div className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-secondary mb-4">Your browser can’t preview PDFs inline.</p>
                <a href={special.pdfPath} target="_blank" className="btn btn-primary">
                  Open PDF in New Tab
                </a>
              </div>
            </object>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl">
            <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-secondary">No specials PDF is currently posted.</p>
            <p className="text-sm mt-2 text-text-muted">Please ask your server for today’s offerings.</p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-text-muted">
          Specials change frequently. This sheet is updated directly from the kitchen via the admin back door.
        </div>
      </div>
    </div>
  );
}
