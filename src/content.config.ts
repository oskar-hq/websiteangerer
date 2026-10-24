import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Eine Datei pro Arbeit in src/content/works/*.md
 * Bild: relativer Pfad zu src/assets/works/… (wird automatisch optimiert)
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      discipline: z.enum(['design', 'video', 'social', 'management', 'software', 'consulting']),
      medium: z.enum(['image', 'video']),
      /** Art der Arbeit, z. B. "Thumbnail", "Plakat", "Reel" */
      kind: z.string(),
      /** Vorschaubild bzw. Poster – das Seitenverhältnis bestimmt die Kachel (hoch, quer, quadratisch) */
      image: image(),
      /** Video: YouTube-Link oder Datei unter public/ (z. B. "videos/spot.mp4") – Kachel bekommt Play-Button */
      video: z.string().optional(),
      /** Referenz aus src/content/clients (Datei-Name ohne .json) – zeigt Logo/Profilbild auf der Kachel */
      reference: z.string().optional(),
      order: z.number(),
      /** Kachel bekommt das Label "Platzhalter" */
      placeholder: z.boolean().default(true),
      /** Hervorgehobene Kachel (größer auf Desktop) */
      featured: z.boolean().default(false),
      /** Name einer Reihe: Arbeiten mit gleichem Namen stehen als ein Block (3 Bilder nebeneinander) über die volle Breite */
      row: z.string().optional(),
      /** Position in der Reihe (1–3) – die order der Reihe ist die des Bildes mit rowIndex 1 */
      rowIndex: z.number().optional(),
    }),
});

/**
 * Kunden & Creator für das Lineup. Eine JSON-Datei pro Marke in src/content/clients/.
 * tier 1 = Headliner (groß), tier 2 = übriges Lineup.
 */
const clients = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/clients' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      kind: z.enum(['brand', 'creator']),
      /** true = vorerst ausgeblendet (z. B. Kunde noch nicht abgeschlossen) – auf false setzen, dann ist er wieder überall da */
      hidden: z.boolean().default(false),
      tier: z.union([z.literal(1), z.literal(2)]),
      order: z.number(),
      /** Logo-Datei unter public/ (SVG/PNG in Originalfarben) – nur bei kind: brand */
      logo: z.string().optional(),
      /** Profilbild – nur bei kind: creator */
      photo: image().optional(),
      /** Optischer Größenausgleich des Logos (1 = Standard) */
      scale: z.number().default(1),
      /** Seitenverhältnis des Logos (Breite/Höhe) – für optischen Flächenausgleich */
      aspect: z.number().default(1),
      items: z.array(z.object({ what: z.string(), who: z.string(), discipline: z.string() })),
      /** Verweise auf Arbeiten (Ende der Datei-ID in src/content/works) */
      works: z.array(z.string()).default([]),
    }),
});

export const collections = { works, clients };
