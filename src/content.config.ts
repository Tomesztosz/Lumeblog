import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { COLUMN_KEYS, LANGS } from './i18n/ui';

/* Egy poszt = egy Markdown-fájl a src/content/posts/<nyelv>/ alatt. */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** Cikk címe. */
    title: z.string(),
    /** Felvezető — a listákban és a <meta description>-ben is ez megy. */
    description: z.string(),
    /** Megjelenés dátuma (ISO: 2026-07-24). */
    date: z.coerce.date(),
    /** Rovat: 'in-hand' | 'origins' | 'movement' — nyelvfüggetlen kulcs. */
    column: z.enum(COLUMN_KEYS),
    /** A poszt nyelve. */
    lang: z.enum(LANGS),
    /** URL-szelet; ha nincs megadva, a fájlnév. */
    slug: z.string().optional(),
    /** Olvasási idő percben; ha nincs, a szövegből számoljuk. */
    minutes: z.number().int().positive().optional(),
    /** Ugyanaz a cikk a másik nyelven — a nyelvváltó ez alapján talál át. */
    translationKey: z.string().optional(),
    /** Piszkozat: nem kerül bele a buildbe. */
    draft: z.boolean().default(false),
    /** Források — a research pontossága kötelező, ezért a sablon kéri. */
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url().optional(),
        })
      )
      .default([]),
  }),
});

export const collections = { posts };
