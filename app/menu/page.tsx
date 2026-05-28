import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPublicMenu, getCurrentSpecial } from '@/lib/public-data';

export const metadata = {
  title: 'Menu',
};

export default async function MenuPage() {
  const [categories, special] = await Promise.all([
    getPublicMenu(),
    getCurrentSpecial(),
  ]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="font-semibold tracking-tight">Menu • North Hanover Grille</div>
          <Link href="/admin" className="text-xs text-text-muted hover:text-accent">Admin</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-accent text-sm tracking-[3px]">THOUGHTFULLY CRAFTED</div>
          <h1 className="section-title mt-2">The Menu</h1>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            Classic American bar &amp; grill with Greek influences. Everything is made fresh.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">Menu is being updated. Please ask your server for today’s offerings.</div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <div key={cat.id}>
                <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b border-border pb-3">{cat.name}</h2>
                <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {item.asset && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                          <img src={item.asset.path} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 pt-1">
                        <div className="flex items-baseline justify-between">
                          <div className="font-medium text-lg">{item.name}</div>
                          <div className="font-mono text-accent tabular-nums">${item.price.toFixed(2)}</div>
                        </div>
                        {item.description && (
                          <div className="text-sm text-text-secondary mt-1 leading-snug">{item.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {special && (
          <div className="mt-16 text-center border-t border-border pt-10">
            <Link href="/specials" className="btn btn-primary text-base px-8">
              View Today’s Specials PDF
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
