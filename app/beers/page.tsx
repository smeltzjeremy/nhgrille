import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { getPublicBeers } from '@/lib/public-data';

export const metadata = {
  title: 'Beers on Tap',
};

export default async function BeersPage() {
  const beers = await getPublicBeers();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="font-semibold tracking-tight">Beers on Tap • North Hanover Grille</div>
          <Link href="/admin" className="text-xs text-text-muted hover:text-accent">Admin</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <div className="text-accent text-sm tracking-[3px] font-medium">WHAT’S POURING RIGHT NOW</div>
          <h1 className="section-title mt-2">Beers on Tap</h1>
          <p className="mt-3 max-w-md text-text-secondary">
            15+ rotating microbrews and imports. Ask the bar for the latest or check back here — our list updates in real time from the kitchen.
          </p>
        </div>

        {beers.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            Tap list is being updated. Please check back soon or ask your server.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beers.map((beer) => (
              <div key={beer.id} className="beer-card">
                <div className="aspect-[16/10] rounded-2xl bg-surface-elevated mb-6 overflow-hidden">
                  {beer.asset ? (
                    <img src={beer.asset.path} alt={beer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Star className="h-10 w-10 text-text-muted opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{beer.name}</h3>
                    <p className="text-text-secondary">{beer.type}</p>
                  </div>
                  <div className="font-mono text-2xl font-medium tabular-nums text-accent">
                    ${beer.price.toFixed(2)}
                  </div>
                </div>

                {beer.description && (
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">{beer.description}</p>
                )}
                {beer.abv && <div className="mt-2 text-xs text-text-muted">{beer.abv}% ABV</div>}
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center text-sm text-text-secondary">
          Rotating selection of 15+ micro and import drafts. Tuesday wing night + happy hour features.
        </div>
      </div>
    </div>
  );
}
