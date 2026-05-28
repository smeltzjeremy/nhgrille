import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'North Hanover Grille',
    short_name: 'NH Grille',
    description: 'Modern American grille. Craft beers on tap, seasonal menu, and warm hospitality in Carlisle, PA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['food', 'restaurant', 'bar'],
    orientation: 'any',
    shortcuts: [
      {
        name: 'Beers on Tap',
        short_name: 'Beers',
        url: '/beers',
      },
      {
        name: 'Admin Back Door',
        short_name: 'Admin',
        url: '/admin',
      },
    ],
  };
}
