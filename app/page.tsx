import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Star } from 'lucide-react';
import { getPublicBeers, getPublicMenu, getCurrentSpecial, getSiteSettings } from '@/lib/public-data';

/**
 * North Hanover Grille — Beautiful Public Homepage
 * Now fully dynamic — powered by the admin back door.
 */

export default async function Home() {
  const [beers, categories, special, settings] = await Promise.all([
    getPublicBeers(6),
    getPublicMenu(),
    getCurrentSpecial(),
    getSiteSettings(),
  ]);

  const heroHeadline = settings.hero_headline || 'A Modern Grille.\nExceptional Food.\nWarm Hospitality.';
  const heroSub = settings.hero_subheadline || 'Craft beers on tap, a thoughtfully seasonal menu, and an atmosphere that feels like home.';
  const hoursText = settings.hours_text || 'Open Tue–Sun';
  const addressText = settings.address_text || '42 Hanover Street, Hanover, NH';
  const phone = settings.phone || '(717) 241-5517';
  const ig = settings.instagram_url || '';
  const fb = settings.facebook_url || '';

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Elegant fixed navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-[#0c0c0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            {/* Pure-code oval logo (matches the original deep red oval with white script + shadow, no extra white outside) */}
            <div className="flex h-9 w-[82px] items-center justify-center rounded-[40px] bg-[#6B1E3A] shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),0_2px_5px_rgba(0,0,0,0.5)] text-white">
              <span className="text-[8px] leading-[9px] font-serif tracking-[0.2px] text-center italic font-medium">
                N. HANOVER<br />GRILLE
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-10 text-sm font-medium md:flex">
            <Link href="#beers" className="hover:text-accent transition-colors">Beers on Tap</Link>
            <Link href="#menu" className="hover:text-accent transition-colors">Menu</Link>
            <Link href="#specials" className="hover:text-accent transition-colors">Specials</Link>
            <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">Admin</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="#order" className="btn btn-primary text-sm">
              Order Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="md:hidden btn btn-ghost p-2">Menu</button>
          </div>
        </div>
      </nav>

      {/* Hero — now dynamic */}
      <header className="relative flex min-h-[100dvh] items-center justify-center pt-16">
        {/* Cleaner hero background — solid dark at top so navbar doesn't show the grid texture (more polished than original) */}
        <div className="absolute inset-0 bg-[#0c0c0c]" />
        <div className="absolute inset-x-0 top-[30vh] h-[70vh] bg-[radial-gradient(#1f1f1f_0.8px,transparent_1px)] bg-[length:5px_5px] opacity-60" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1 text-xs tracking-[4px] text-text-secondary">
            HANOVER
          </div>

          <h1 className="section-title mb-6 text-balance whitespace-pre-line">
            {heroHeadline}
          </h1>
          
          <p className="mx-auto max-w-md text-xl text-text-secondary">
            {heroSub}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#beers" className="btn btn-primary w-full sm:w-auto text-base px-10">
              See What’s on Tap
            </Link>
            <Link href="#menu" className="btn btn-secondary w-full sm:w-auto text-base px-10">
              View Full Menu
            </Link>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> {hoursText}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> {addressText}
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="flex flex-col items-center text-[10px] tracking-[3px] text-text-muted">
            SCROLL TO EXPLORE
            <div className="mt-2 h-px w-8 bg-border" />
          </div>
        </div>
      </header>

      {/* Beers on Tap — now dynamic */}
      <section id="beers" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-accent text-sm tracking-[3px] font-medium">FRESH FROM THE TAP</div>
              <h2 className="section-title mt-2">Beers on Tap</h2>
            </div>
            <Link href="/beers" className="hidden md:flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              Full beer list <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {beers.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              Our tap list is being updated. Check back soon or ask the bar.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {beers.map((beer) => (
                <div key={beer.id} className="beer-card group">
                  <div className="aspect-[16/10] w-full rounded-2xl bg-surface-elevated mb-6 overflow-hidden">
                    {beer.asset ? (
                      <img
                        src={beer.asset.path}
                        alt={beer.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-text-muted">
                        <Star className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{beer.name}</h3>
                      <p className="text-text-secondary">{beer.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-medium tabular-nums">${beer.price.toFixed(2)}</div>
                    </div>
                  </div>
                  {beer.description && (
                    <p className="mt-4 text-sm leading-relaxed text-text-secondary">{beer.description}</p>
                  )}
                  {beer.abv && (
                    <div className="mt-2 text-xs text-text-muted">{beer.abv}% ABV</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/beers" className="btn btn-ghost">View all beers on tap →</Link>
          </div>
        </div>
      </section>

      {/* Menu Teaser — dynamic categories */}
      <section id="menu" className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="text-accent text-sm tracking-[3px] font-medium">THOUGHTFULLY CRAFTED</div>
            <h2 className="section-title mt-3">The Menu</h2>
            <p className="mt-4 max-w-md mx-auto text-text-secondary">
              Seasonal ingredients, classic techniques, and a few signature dishes we’re proud of.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center text-text-secondary py-8">Menu is being updated. Please check back soon.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {categories.slice(0, 4).map((cat) => (
                <div key={cat.id} className="card p-8">
                  <h3 className="font-semibold tracking-tight text-xl mb-6 border-b border-border pb-3">{cat.name}</h3>
                  <div className="space-y-5 text-sm">
                    {cat.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between gap-4 border-b border-border/60 pb-4 last:border-none last:pb-0">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-text-secondary text-xs mt-1">{item.description}</div>
                          )}
                        </div>
                        <div className="font-mono tabular-nums text-text-secondary shrink-0">${item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/menu" className="btn btn-secondary">View Full Menu</Link>
            {special && (
              <Link href="/specials" className="ml-3 btn btn-ghost">Today’s Specials PDF</Link>
            )}
          </div>
        </div>
      </section>

      {/* Daily Specials — dynamic */}
      <section id="specials" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-accent text-sm tracking-[3px]">TODAY’S KITCHEN</div>
          <h2 className="section-title mt-3 mb-4">Daily Specials</h2>
          <p className="text-text-secondary max-w-sm mx-auto">
            Chef’s daily creations. Check back often — these change frequently and go fast.
          </p>

          <div className="mt-10 rounded-3xl border border-border bg-background p-12">
            {special ? (
              <>
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated mb-4">
                  <Star className="h-6 w-6 text-gold" />
                </div>
                <p className="text-lg font-medium mb-2">{special.title}</p>
                <p className="text-text-secondary mb-6">Updated {new Date(special.updatedAt).toLocaleDateString()}</p>
                <Link href="/specials" className="btn btn-primary">View Today’s Specials PDF</Link>
              </>
            ) : (
              <>
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
                  <Star className="h-6 w-6 text-gold" />
                </div>
                <p className="mt-6 text-lg text-text-secondary">
                  Today’s specials are posted in the restaurant and updated regularly.
                </p>
                <Link href="/specials" className="mt-8 inline-block btn btn-secondary">Check Current Specials</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Order CTA + Footer */}
      <section id="order" className="py-20 text-center border-t border-border">
        <div className="mx-auto max-w-lg px-6">
          <h2 className="text-4xl font-semibold tracking-tighter">Ready to enjoy the Grille?</h2>
          <p className="mt-4 text-text-secondary">Order ahead for pickup or delivery. Payment integration coming soon.</p>
          
          <button className="mt-8 btn btn-primary text-lg px-14 py-4">
            Order Now <ArrowRight />
          </button>
          <div className="mt-3 text-xs text-text-muted">Future: Secure online payments &amp; reservations</div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface py-12 text-sm text-text-secondary">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-y-4">
          <div>© {new Date().getFullYear()} North Hanover Grille. All rights reserved.</div>
          <div className="flex gap-x-6">
            <a href="#" className="hover:text-text-primary">Instagram</a>
            <a href="#" className="hover:text-text-primary">Facebook</a>
            <Link href="/admin" className="hover:text-accent">Admin Back Door</Link>
          </div>
          <div>42 Hanover Street, Hanover, NH</div>
        </div>
      </footer>
    </div>
  );
}
