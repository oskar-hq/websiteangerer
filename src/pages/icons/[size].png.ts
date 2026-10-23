import type { APIRoute } from 'astro';
import { appIcon } from '../../lib/share';

/** App-Icons: 180 (Apple), 192 und 512 (Android / Web-Manifest) */
export const getStaticPaths = () => ['180', '192', '512'].map((size) => ({ params: { size } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await appIcon(Number(params.size))), { headers: { 'Content-Type': 'image/png' } });
