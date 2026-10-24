import type { APIRoute } from 'astro';
import { faviconIco } from '../lib/share';

/** /favicon.ico – wird beim Build aus public/favicon.svg erzeugt */
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await faviconIco()), { headers: { 'Content-Type': 'image/x-icon' } });
