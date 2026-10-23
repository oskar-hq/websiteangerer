import type { APIRoute } from 'astro';
import { site } from '../site.config';
import { withBase } from '../lib/works';

/** Web-Manifest: Name und Icons, wenn die Seite auf den Homescreen gelegt wird */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.short,
      description: site.claim,
      start_url: withBase('/'),
      display: 'standalone',
      background_color: '#f2f2f3',
      theme_color: '#f2f2f3',
      icons: [
        { src: withBase('icons/192.png'), sizes: '192x192', type: 'image/png' },
        { src: withBase('icons/512.png'), sizes: '512x512', type: 'image/png' },
      ],
    }, null, 2),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
