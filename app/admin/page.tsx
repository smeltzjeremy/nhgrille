import Link from 'next/link';
import { Beer, Image, UtensilsCrossed, FileText, ArrowRight } from 'lucide-react';

/**
 * Admin Dashboard
 * Clean overview with quick actions. Emphasizes the most important flows:
 * Photo management and content toggles.
 */
export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-10">
        <div className="text-accent text-sm tracking-[3px] font-medium">WELCOME BACK</div>
        <h1 className="text-5xl font-semibold tracking-tighter mt-1">Admin Dashboard</h1>
        <p className="mt-3 max-w-prose text-lg text-text-secondary">
          Everything you change here updates the public site in real time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Quick action cards */}
        {[
          {
            title: "Media Library",
            desc: "Upload photos from your phone. Organize into folders. Pick for beers & menu items.",
            href: "/admin/media",
            icon: Image,
            cta: "Manage Photos",
          },
          {
            title: "Beers on Tap",
            desc: "Add, edit, reorder, and toggle visibility of every beer. Attach beautiful photos.",
            href: "/admin/beers",
            icon: Beer,
            cta: "Edit Beer List",
          },
          {
            title: "Menu",
            desc: "Manage categories and items. Hide sold-out dishes instantly.",
            href: "/admin/menu",
            icon: UtensilsCrossed,
            cta: "Update Menu",
          },
          {
            title: "Daily Specials",
            desc: "Upload a new PDF specials sheet. Toggle it live with one tap.",
            href: "/admin/specials",
            icon: FileText,
            cta: "Manage Specials",
          },
        ].map((card, index) => (
          <Link key={index} href={card.href} className="card group p-7 flex flex-col">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-accent">
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">{card.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{card.desc}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-accent group-hover:gap-3 transition-all">
              {card.cta} <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-border bg-surface p-8 text-sm text-text-secondary">
        <strong className="text-text-primary">Pro tip:</strong> Use the Media Library first. Upload your best photos from your phone, then attach them when creating beers or menu items. All visibility toggles are big, colorful, and one-tap.
      </div>
    </div>
  );
}
