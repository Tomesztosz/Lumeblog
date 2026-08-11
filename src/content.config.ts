import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { COLUMN_KEYS, LANGS } from './i18n/ui';

/* Egy poszt = egy Markdown-fájl a src/content/posts/<nyelv>/ alatt. */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      /** Cikk címe. */
      title: z.string(),
      /** Látható felvezető — listákban és a cikk elején; SEO-leírás híján meta fallback. */
      description: z.string(),
      /** Keresőtalálati cím. A látható szerkesztői címet nem változtatja meg. */
      seoTitle: z.string().optional(),
      /** Keresőtalálati leírás. A cikk látható felvezetőjét nem változtatja meg. */
      seoDescription: z.string().optional(),
      /** Megjelenés dátuma (ISO: 2026-08-03). */
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

      /**
       * Nyitókép. Ha nincs megadva, a rovat SVG-motívuma jelenik meg helyette.
       * A fájl a `src/content/posts/_images/` alá kerül, hivatkozás:
       * `cover: { src: '../_images/fajlnev.jpg', ... }`.
       *
       * A `credit` KÖTELEZŐ, ha van kép: nem sajátból dolgozunk, tehát
       * a forrást minden megjelenési helyen kiírjuk. A séma nem enged
       * hitel nélküli képet átmenni a buildon.
       */
      cover: z
        .object({
          src: image(),
          /** Külön 4:3-as kép a lista- és kezdőlapi kártyákhoz. */
          cardSrc: image().optional(),
          /** Mit ábrázol — képernyőolvasóknak és ha nem tölt be a kép. */
          alt: z.string(),
          /**
           * Hova nézzen a kártya, amikor 4:3-ra vágja a képet. CSS
           * `object-position` érték, pl. `'right'`, `'left'`, `'70% center'`.
           * Alapból középre vág. Akkor kell, ha a kép egyik szélén olyasmi van
           * (felirat, márkanév), amit a középre vágás félbevágna.
           * A cikk élén nincs hatása: ott a kép a maga arányában áll.
           */
          focus: z.string().optional(),
          /** Kinek a képe: fotós vagy forrás neve, ahogy ő kéri. */
          credit: z.string(),
          /** Hivatkozás az eredetire (fotós oldala, gyűjtemény, Wikimedia-lap). */
          creditUrl: z.string().url().optional(),
          /** Licenc rövid neve, pl. 'CC BY-SA 4.0' vagy 'engedéllyel'. */
          license: z.string().optional(),
          /** A licenc szövege, ha a licenc megköveteli a linkelését. */
          licenseUrl: z.string().url().optional(),
        })
        .optional(),

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
