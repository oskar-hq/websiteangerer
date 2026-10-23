import type { APIRoute } from 'astro';
import { withBase } from '../lib/works';

/** Sitemap für Google & Co. – listet automatisch jede Seite unter src/pages/*.astro */
const pages = Object.keys(import.meta.glob('./**/*.astro'))
  .map((f) => f.replace(/^\.\//, '').replace(/(index)?\.astro$/, ''))
  .map((p) => withBase(p ? `${p}/` : '/'))
  .sort();

export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => `  <url><loc>${new URL(p, site).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
