import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Eine Datei pro Arbeit in src/content/works/*.md
 * Bild: relativer Pfad zu src/assets/works/… (wird automatisch optimiert)
 * Video: Pfad unter public/ (z. B. "media/reel-1.mp4"), plus "image" als Poster.
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      discipline: z.enum(['design', 'video', 'social', 'management', 'software']),
      medium: z.enum(['image', 'video']),
      /** Art der Arbeit, z. B. "Thumbnail", "Plakat", "Reel" */
      kind: z.string(),
      image: image(),
      video: z.string().optional(),
      order: z.number(),
      /** Kachel bekommt das Label "Platzhalter" */
      placeholder: z.boolean().default(true),
      /** Hervorgehobene Kachel (größer auf Desktop) */
      featured: z.boolean().default(false),
    }),
});

export const collections = { works };
