# North Hanover Grille — Modern Web App

A beautiful, modern, full-stack Progressive Web App replacing the old basic site.

Built from the project brief with clean, attractive, professional code.

## Goals (from PROJECT-BRIEF.md)

- Dark, elegant, mobile-first restaurant experience
- Dynamic beers on tap with photos + metadata
- Full menu + daily specials (PDF support)
- Powerful yet simple admin “back door”
- Excellent photo management (easy uploads from phone)
- All content respects hide/show toggles that update instantly
- 100% custom code + PWA capabilities

## Current Status

**Phase 1 complete**: Modern project structure + foundation.

- Next.js 15 + TypeScript + Tailwind (beautiful dark restaurant theme)
- Prisma + SQLite ready for data persistence
- Clean component + admin architecture
- Working password-protected admin area (`/admin`)
- Elegant public homepage with all major sections
- PWA manifest + installable
- Photo upload folder structure organized by category
- Professional admin sidebar and quick actions

Next phases will implement:
- Real CRUD + photo attachment for beers
- Media Library (drag & drop, phone camera, folder views)
- Menu & Specials management with live PDF
- Beautiful red/green visibility toggles everywhere
- Seeding, ordering improvements, etc.

## Getting Started (Local Development)

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set a strong `ADMIN_PASSWORD`.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:push
   # Optional seed (once implemented)
   # npm run db:seed
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Visit:
   - Public site: http://localhost:3000
   - Admin back door: http://localhost:3000/admin

   Use the password you set in `.env`.

## Key Folders

- `app/` — Next.js App Router (public + /admin sections)
- `app/admin/*` — All admin tools (media, beers, menu, specials)
- `components/` — Reusable beautiful UI (public + admin)
- `lib/prisma.ts` — Database client
- `prisma/schema.prisma` — Data model (Beers, Assets, Menu, Specials, Settings)
- `public/uploads/` — All user-uploaded photos & PDFs (organized by folder)

## Tech Highlights

- Modern dark palette with warm copper/amber accents
- Framer Motion ready for delightful micro-interactions
- Server Actions + Prisma for fast, type-safe data
- Simple but effective cookie-based admin auth (easy to harden)
- Fully responsive + PWA-ready

## Future Enhancements (per brief)

- Real photo library with selection when editing items
- One-tap colorful hide/show toggles
- PDF upload + preview for specials
- “Order Now” payment readiness
- Better realtime (or smart revalidation)

---

Built with care for an excellent customer and staff experience.
