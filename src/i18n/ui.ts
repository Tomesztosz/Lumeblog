/* ============================================================
   LUME — kétnyelvűség egy helyen
   Minden felületi szöveg és minden útvonal-szelet itt él.
   Új nyelvi szöveg → ide, ne a sablonokba.
   ============================================================ */

export const LANGS = ['hu', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'hu';

/* ---------- rovatok ---------- */
export const COLUMN_KEYS = ['in-hand', 'origins', 'movement'] as const;
export type ColumnKey = (typeof COLUMN_KEYS)[number];

type ColumnCopy = { slug: string; name: string; title: string; blurb: string };

export const COLUMNS: Record<ColumnKey, Record<Lang, ColumnCopy>> = {
  'in-hand': {
    hu: {
      slug: 'kezben',
      name: 'Kézben',
      title: 'A hét microbrandje',
      blurb: 'Egy kis műhely egy órája, kézbe véve és sokáig nézve.',
    },
    en: {
      slug: 'in-hand',
      name: 'In Hand',
      title: "The week's microbrand",
      blurb: 'One watch from one small maker, taken in hand and looked at for a long time.',
    },
  },
  origins: {
    hu: {
      slug: 'eredet',
      name: 'Eredet',
      title: 'Márkatörténelem',
      blurb: 'Honnan jött valójában egy ház vagy egy referencia — a legenda mögötti tényekkel.',
    },
    en: {
      slug: 'origins',
      name: 'Origins',
      title: 'Brand history',
      blurb: 'Where a house or a reference actually came from — with the facts behind the legend.',
    },
  },
  movement: {
    hu: {
      slug: 'szerkezet',
      name: 'Szerkezet',
      title: 'Mérnöki megközelítés',
      blurb: 'A számlap alatti mechanika, alkatrészenként: gátlómű, kronográf, GMT, spirál.',
    },
    en: {
      slug: 'movement',
      name: 'Movement',
      title: 'The engineering',
      blurb: 'The mechanics under the dial, one piece at a time: escapement, chronograph, GMT, hairspring.',
    },
  },
};

/* a „Rólam" oldal szelete nyelvenként */
export const ABOUT_SLUG: Record<Lang, string> = { hu: 'rolam', en: 'about' };

/* ---------- felületi szövegek ---------- */
export const UI = {
  hu: {
    siteTitle: 'Lume — Órás napló',
    siteDescription:
      'Kétnyelvű órás napló: microbrandek kézben, márkatörténelem a legenda mögötti tényekkel, és a számlap alatti mechanika. Heti három írás.',
    tagline: 'Órás napló. Magyarul és angolul.',

    /* fejléc */
    navAriaLabel: 'Rovatok',
    about: 'Rólam',
    langSwitchLabel: 'Switch to English',
    langSwitchText: 'EN',
    lightsOff: 'Lámpa le',
    lightsOn: 'Lámpa fel',
    skipToContent: 'Ugrás a tartalomra',

    /* hero */
    eyebrow: 'Órás napló',
    heroTitleBefore: 'Tanulj meg ',
    heroTitleEm: 'órát olvasni.',
    heroLede:
      'A lume az a halk fény, amitől a számlap sötétben is olvasható marad. Ez a napló ugyanezt csinálja magukkal az órákkal: olvashatóvá teszi őket — a kis független műhelyeket, a régi házak igazi történetét, és a számlap alatt dolgozó gépezetet.',
    readLatest: 'Olvasd a legfrissebbet',
    heroLightsOff: 'vagy oltsd le a villanyt',
    heroLightsOn: 'vagy kapcsold fel a lámpát',
    dialAlt: 'Vintage számlap világító indexekkel',

    /* rovatok szekció */
    weeklyThree: 'A heti három',
    weeklyDays: 'Hétfő · Szerda · Péntek',

    /* legfrissebb */
    latest: 'Legfrissebb',
    newestFirst: 'Legújabb elöl',
    allInColumn: 'Mind a rovatban',

    /* ethos */
    ethosEyebrow: 'Amiben hiszünk',
    ethosLineBefore: 'Semmi megjelenésnapi hajsza. Semmi hype. Átgondolt írások, ',
    ethosLineBold: 'elfogultan a tárgy felé.',

    /* hírlevél */
    subTitle: 'Új írások hetente, a postaládádba.',
    subNote: 'Semmi más. Bármikor leiratkozhatsz.',
    subPlaceholder: 'te@pelda.hu',
    subButton: 'Feliratkozom',
    subDone: 'Fent vagy a listán.',

    /* lábléc */
    footColumns: 'Rovatok',
    footJournal: 'A napló',
    footNewsletter: 'Hírlevél',
    footArchive: 'Archívum',
    footCopy: '© 2026 Lume',
    footPlace: 'Lassan írva, Budapesten.',

    /* cikk / lista */
    minutes: (n: number) => `${n} perc`,
    backToColumn: 'Vissza a rovathoz',
    sources: 'Források',
    noPostsYet: 'Ebben a rovatban még nincs írás. Hamarosan.',
    noPostsYetHome: 'Az első írás hamarosan.',
    readOn: 'Tovább',
  },

  en: {
    siteTitle: 'Lume — A watch journal',
    siteDescription:
      'A bilingual watch journal: microbrands in hand, brand history with the facts behind the legend, and the machinery under the dial. Three pieces a week.',
    tagline: 'A watch journal. In Hungarian and English.',

    navAriaLabel: 'Columns',
    about: 'About',
    langSwitchLabel: 'Váltás magyarra',
    langSwitchText: 'HU',
    lightsOff: 'Lights off',
    lightsOn: 'Lights on',
    skipToContent: 'Skip to content',

    eyebrow: 'A watch journal',
    heroTitleBefore: 'Learn to ',
    heroTitleEm: 'read a watch.',
    heroLede:
      'Lume is the quiet glow that keeps a dial legible in the dark. This journal does the same for the watches themselves — it makes them legible: the small independent makers, the real histories of the old houses, and the machinery under the dial.',
    readLatest: 'Read the latest',
    heroLightsOff: 'or turn the lights off',
    heroLightsOn: 'or turn the lights on',
    dialAlt: 'Vintage dial with luminous indices',

    weeklyThree: 'The weekly three',
    weeklyDays: 'Mon · Wed · Fri',

    latest: 'Latest',
    newestFirst: 'Newest first',
    allInColumn: 'All in this column',

    ethosEyebrow: 'What this is',
    ethosLineBefore: 'No release-day scramble. No hype. Considered pieces, ',
    ethosLineBold: 'biased toward the object.',

    subTitle: 'New pieces weekly, in your inbox.',
    subNote: 'Nothing else. Unsubscribe whenever.',
    subPlaceholder: 'you@example.com',
    subButton: 'Subscribe',
    subDone: "You're on the list.",

    footColumns: 'Columns',
    footJournal: 'The journal',
    footNewsletter: 'Newsletter',
    footArchive: 'Archive',
    footCopy: '© 2026 Lume',
    footPlace: 'Written slowly, in Budapest.',

    minutes: (n: number) => `${n} min`,
    backToColumn: 'Back to the column',
    sources: 'Sources',
    noPostsYet: 'No pieces in this column yet. Soon.',
    noPostsYetHome: 'The first piece is coming soon.',
    readOn: 'Read on',
  },
} as const;

export type UIStrings = (typeof UI)[Lang];

/* ---------- útvonal-segédek ---------- */

/** `/` HU-nál, `/en/` EN-nél. */
export function langBase(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}/`;
}

/** Rovat-listaoldal URL-je. */
export function columnUrl(lang: Lang, key: ColumnKey): string {
  return `${langBase(lang)}${COLUMNS[key][lang].slug}/`;
}

/** Cikk URL-je. */
export function postUrl(lang: Lang, key: ColumnKey, slug: string): string {
  return `${columnUrl(lang, key)}${slug}/`;
}

/** Rólam oldal URL-je. */
export function aboutUrl(lang: Lang): string {
  return `${langBase(lang)}${ABOUT_SLUG[lang]}/`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'hu' ? 'en' : 'hu';
}

/** Dátum a napló formátumában: HU 2026.07.24 · EN 24 Jul 2026 */
export function formatDate(date: Date, lang: Lang): string {
  if (lang === 'hu') {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Olvasási idő percben, ha a frontmatter nem mondja meg. */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
