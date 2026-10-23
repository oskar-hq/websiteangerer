import type { APIRoute } from 'astro';
import { withBase } from '../lib/works';

/** Alle Suchmaschinen dürfen alles lesen; Verweis auf die Sitemap */
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('sitemap.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
