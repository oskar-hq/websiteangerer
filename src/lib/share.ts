/**
 * Teilen-Bild und App-Icons – werden beim Build mit sharp erzeugt (src/pages/og.jpg.ts, src/pages/icons/…).
 * Das Bild zeigt den Orbit der Startseite als Standbild: gekippte Squircles mit Logos und Creator-Fotos
 * auf einer geneigten Ellipse, vorne größer, hinten blasser, in der Mitte die Kontaktkarte.
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { orbit, orbitAngle } from './orbit';
import { site } from '../site.config';

const root = process.cwd();
const fontfile = resolve(root, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2');
const C = { bg: '#f2f2f3', fg: '#1d1d1f', muted: '#6e6e73', soft: '#8e8e93', blue: '#007aff' };

const dataUri = (buf: Buffer) => `data:image/png;base64,${buf.toString('base64')}`;
const f = (n: number) => n.toFixed(2);

/** Logo bzw. Foto eines Eintrags aus src/content/clients als PNG */
async function client(id: string) {
  const file = resolve(root, 'src/content/clients', `${id}.json`);
  return { file, data: JSON.parse(await readFile(file, 'utf8')) };
}
async function tileImage({ file, data }: Awaited<ReturnType<typeof client>>, px: number) {
  if (data.logo) {
    const src = await readFile(resolve(root, 'public', data.logo));
    const png = await sharp(src, { density: 400 }).resize(px, px, { fit: 'inside' }).png().toBuffer();
    return { logo: true, aspect: data.aspect ?? 1, png };
  }
  const src = await readFile(resolve(dirname(file), data.photo));
  return { logo: false, aspect: 1, png: await sharp(src).resize(px, px, { fit: 'cover' }).png().toBuffer() };
}

/** Text in Geist als PNG (Pango) – liefert Bild und Maße */
async function text(str: string, size: number, weight: number, color: string) {
  const esc = str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const img = sharp({
    text: {
      text: `<span foreground="${color}" font_weight="${weight}" letter_spacing="${Math.round(size * -0.025 * 1024)}">${esc}</span>`,
      font: `Geist Variable ${size}`, fontfile, rgba: true, dpi: 72,
    },
  });
  const { data, info } = await img.png().toBuffer({ resolveWithObject: true });
  return { png: data, w: info.width, h: info.height };
}

/** Eine Kachel: Glasrahmen, innen Logo (eingepasst) oder Foto (füllend), alles leicht gedreht */
function tileSvg(i: number, img: Awaited<ReturnType<typeof tileImage>>, w: number) {
  const inner = w - 10, ri = inner * 0.29, rf = w * 0.32, h = inner / 2;
  const logo = img.logo ? inner * (img.aspect > 3 ? 0.78 : 0.62) : inner;
  return `
    <rect x="${f(-w / 2)}" y="${f(-w / 2)}" width="${f(w)}" height="${f(w)}" rx="${f(rf)}" fill="url(#frame)" filter="url(#tileShadow)"/>
    <rect x="${f(-w / 2 + 0.5)}" y="${f(-w / 2 + 0.5)}" width="${f(w - 1)}" height="${f(w - 1)}" rx="${f(rf)}" fill="none" stroke="#fff" stroke-opacity=".85"/>
    <clipPath id="c${i}"><rect x="${f(-h)}" y="${f(-h)}" width="${f(inner)}" height="${f(inner)}" rx="${f(ri)}"/></clipPath>
    <g clip-path="url(#c${i})">
      <rect x="${f(-h)}" y="${f(-h)}" width="${f(inner)}" height="${f(inner)}" fill="${img.logo ? '#fbfbfc' : '#f2f2f4'}"/>
      <image href="${dataUri(img.png)}" x="${f(-logo / 2)}" y="${f(-logo / 2)}" width="${f(logo)}" height="${f(logo)}" preserveAspectRatio="xMidYMid ${img.logo ? 'meet' : 'slice'}"/>
      <rect x="${f(-h)}" y="${f(-h)}" width="${f(inner)}" height="${f(inner)}" fill="url(#gloss)"/>
    </g>`;
}

/** Teilen-Bild 1200 × 630 (Open Graph, WhatsApp, LinkedIn, X …) */
export async function shareImage() {
  const W = 1200, H = 630, cx = W / 2, cy = 300;
  const rx = 485, ry = 210, base = 104;
  // Startwinkel so gedreht, dass vorne unten Lücken für Karte und Schriftzug bleiben
  const spin = 6;

  // Ausgeblendete Kunden fehlen auch hier
  const entries = (await Promise.all(orbit.map(async (o) => ({ ...o, entry: await client(o.client) }))))
    .filter((o) => !o.entry.data.hidden);
  const tiles = await Promise.all(entries.map(async (o, i) => {
    const a = ((orbitAngle(i, entries.length) + spin) * Math.PI) / 180, z = Math.sin(a);
    const depth = 0.8 + (z + 1) * 0.14;
    return {
      ...o, i, z,
      x: cx + Math.cos(a) * rx, y: cy + z * ry,
      w: base * o.s * depth,
      opacity: 0.6 + (z + 1) * 0.2,
      img: await tileImage(o.entry, 360),
    };
  }));
  tiles.sort((a, b) => a.z - b.z);

  // Kontaktkarte wie auf der Seite (Größe „end“)
  const name = await text(site.name, 34, 600, C.fg);
  const sub = await text('Lass uns sprechen', 17, 450, C.muted);
  const pad = 13, photo = 92, gap = 24, call = 82;
  const textW = Math.max(name.w, sub.w) + 10;
  const cw = pad + photo + gap + textW + gap + call + pad, ch = photo + pad * 2;
  const kx = cx - cw / 2, ky = cy - ch / 2;
  const marvin = await sharp(await readFile(resolve(root, 'src/assets/people/marvin.jpg'))).resize(240, 240, { fit: 'cover' }).png().toBuffer();
  const px = kx + pad + photo / 2, pyc = cy, callX = kx + cw - pad - call / 2;
  const g = call * 0.46 / 24;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="b1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="b2"><stop offset="0" stop-color="#dcdce0"/><stop offset="1" stop-color="#dcdce0" stop-opacity="0"/></radialGradient>
      <linearGradient id="frame" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".36"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <filter id="tileShadow" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity=".16"/></filter>
      <filter id="cardShadow" x="-20%" y="-60%" width="140%" height="260%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".16"/><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity=".06"/></filter>
      <clipPath id="photo"><circle cx="${f(px)}" cy="${f(pyc)}" r="${photo / 2}"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <circle cx="180" cy="40" r="560" fill="url(#b1)"/>
    <circle cx="1080" cy="120" r="460" fill="url(#b2)"/>
    <circle cx="560" cy="430" r="380" fill="url(#b1)"/>
    <circle cx="60" cy="640" r="380" fill="url(#b2)"/>
    ${tiles.map((t) => `<g transform="translate(${f(t.x)} ${f(t.y)}) rotate(${t.r})" opacity="${f(t.opacity)}">${tileSvg(t.i, t.img, t.w)}</g>`).join('')}
    <rect x="${f(kx)}" y="${f(ky)}" width="${f(cw)}" height="${ch}" rx="${ch / 2}" fill="#fff" filter="url(#cardShadow)"/>
    <circle cx="${f(px)}" cy="${f(pyc)}" r="${photo / 2 + 2.5}" fill="#e6e6e8"/>
    <circle cx="${f(px)}" cy="${f(pyc)}" r="${photo / 2 + 2}" fill="#fff"/>
    <image href="${dataUri(marvin)}" x="${f(px - photo / 2)}" y="${f(pyc - photo / 2)}" width="${photo}" height="${photo}" clip-path="url(#photo)" preserveAspectRatio="xMidYMid slice"/>
    <circle cx="${f(callX)}" cy="${f(cy)}" r="${call / 2}" fill="#f2f2f4"/>
    <path transform="translate(${f(callX - 12 * g)} ${f(cy - 12 * g)}) scale(${f(g)})" fill="${C.blue}" d="M19.23 15.26l-2.54-.29a1.99 1.99 0 0 0-1.64.57l-1.84 1.84a15.05 15.05 0 0 1-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64l-.29-2.52a2 2 0 0 0-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.73c.01-1.01-.75-1.86-1.76-1.98Z"/>
  </svg>`;

  const tx = Math.round(kx + pad + photo + gap);
  const blockH = name.h + 4 + sub.h;
  const ty = Math.round(cy - blockH / 2);
  return sharp(Buffer.from(svg))
    .composite([
      { input: name.png, left: tx, top: ty },
      { input: sub.png, left: tx, top: ty + name.h + 4 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

/**
 * Icons aus public/favicon.svg. App-Icons (Homescreen) randlos – die Ecken rundet das System selbst;
 * Favicons (Browser-Tab, Google, WhatsApp) behalten die runden Ecken.
 */
export async function appIcon(size: number, rounded = false) {
  let svg = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
  if (!rounded) svg = svg.replace(/ rx="8"/, '');
  return sharp(Buffer.from(svg), { density: Math.ceil((size / 32) * 72) }).resize(size, size).png().toBuffer();
}

/** favicon.ico mit 16, 32 und 48 px (PNG-Einträge) – für Apps und Crawler, die kein SVG lesen */
export async function faviconIco() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => appIcon(s, true)));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  return Buffer.concat([head, ...pngs]);
}
