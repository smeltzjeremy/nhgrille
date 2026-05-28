import Link from 'next/link';
import { LogOut, LayoutDashboard, Beer, Image, UtensilsCrossed, FileText, Settings } from 'lucide-react';
import InstallPrompt from '@/components/InstallPrompt';

/**
 * Admin Layout — Modern, clean "back door" shell
 * Self-explanatory navigation focused on the key tasks from the brief:
 * Photo management, Beers, Menu, Specials, instant toggles.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-8">
          {/* Pure-code oval logo (deep red oval + white script + shadow, no extra white outside) */}
          <div className="flex h-9 w-[82px] items-center justify-center rounded-[40px] bg-[#6B1E3A] shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),0_2px_5px_rgba(0,0,0,0.5)] text-white">
            <span className="text-[8px] leading-[9px] font-serif tracking-[0.2px] text-center italic font-medium">
              N. HANOVER<br />GRILLE
            </span>
          </div>
          <div>
            <div className="font-semibold tracking-tight">North Hanover Grille</div>
            <div className="text-[10px] text-accent tracking-[2px]">ADMIN BACK DOOR</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 text-sm">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/admin/media" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <Image className="h-4 w-4" /> Media Library
          </Link>
          <Link href="/admin/beers" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <Beer className="h-4 w-4" /> Beers on Tap
          </Link>
          <Link href="/admin/menu" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <UtensilsCrossed className="h-4 w-4" /> Menu
          </Link>
          <Link href="/admin/specials" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <FileText className="h-4 w-4" /> Daily Specials
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-surface-elevated text-text-primary">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        <div className="border-t border-border p-4">
          <a 
            href="/" 
            target="_blank" 
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-xs tracking-widest hover:bg-surface-elevated"
          >
            VIEW PUBLIC SITE <span aria-hidden>↗</span>
          </a>
          <form action="/api/auth/logout" method="post" className="mt-2">
            <button 
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs text-danger hover:bg-surface-elevated"
            >
              <LogOut className="h-3.5 w-3.5" /> LOG OUT
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="font-semibold">Admin</div>
          </div>
          <div className="hidden md:block text-sm text-text-secondary">
            Changes you make appear instantly on the public site.
          </div>
          <div className="text-xs rounded-full bg-surface-elevated px-3 py-1 text-text-secondary">
            Logged in as Admin
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 admin-scroll overflow-auto">
          {children}
        </main>

        {/* PWA install prompt — very useful for staff phones */}
        <InstallPrompt />
      </div>
    </div>
  );
}
