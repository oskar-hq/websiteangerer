import { getCollection, type CollectionEntry } from 'astro:content';
import { disciplines } from '../site.config';

export type Work = CollectionEntry<'works'>;

export async function getWorks(): Promise<Work[]> {
  const all = await getCollection('works');
  return all.sort((a, b) => a.data.order - b.data.order);
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
