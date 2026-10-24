import type { APIRoute } from 'astro';
import { appIcon } from '../../lib/share';

/** Favicon als PNG mit runden Ecken – Google verlangt ein Vielfaches von 48 px */
export const getStaticPaths = () => ['48', '96'].map((size) => ({ params: { size } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await appIcon(Number(params.size), true)), { headers: { 'Content-Type': 'image/png' } });
