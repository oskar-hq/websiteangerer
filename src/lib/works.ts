import { getCollection, type CollectionEntry } from 'astro:content';
import { disciplines } from '../site.config';

export type Work = CollectionEntry<'works'>;

export async function getWorks(): Promise<Work[]> {
  const all = await getCollection('works');
  // Reihe: Bilder 2 und 3 stehen direkt hinter Bild 1, egal welche order sie selbst haben
  const key = (w: Work) => {
    const first = w.data.row ? all.find((x) => x.data.row === w.data.row && x.data.rowIndex === 1) : undefined;
    return first?.data.order ?? w.data.order;
  };
  return all.sort((a, b) => key(a) - key(b) || (a.data.rowIndex ?? 0) - (b.data.rowIndex ?? 0));
}

export function disciplineLabel(id: string) {
  return disciplines.find((d) => d.id === id)?.label ?? id;
}

export function countBy(works: Work[]) {
  const map: Record<string, number> = {};
  for (const w of works) map[w.data.discipline] = (map[w.data.discipline] ?? 0) + 1;
  return map;
}

/** Pfad unter public/ mit GitHub-Pages-Base verbinden */
export function withBase(p: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${p.replace(/^\//, '')}`;
}

/** Arbeit über das Ende ihrer Datei-ID finden, z. B. "plakat-knabe" */
export function pick(works: Work[], key: string): Work {
  const w = works.find((x) => x.id.endsWith(key));
  if (!w) throw new Error(`Arbeit "${key}" nicht gefunden`);
  return w;
}

/** Video-Quelle für die Lightbox: YouTube wird eingebettet, Dateien laufen im <video>-Element */
export function videoSource(v?: string) {
  if (!v) return undefined;
  const yt = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  if (yt) return { type: 'youtube' as const, src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1` };
  return { type: 'file' as const, src: withBase(v) };
}
