import type { APIRoute } from 'astro';
import { shareImage } from '../lib/share';

/** Teilen-Bild – wird beim Build erzeugt */
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await shareImage()), { headers: { 'Content-Type': 'image/jpeg' } });
