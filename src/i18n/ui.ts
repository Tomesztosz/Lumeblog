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

type ColumnCopy = {
  slug: string;
  name: string;
  title: string;
  blurb: string;
  seoTitle: string;
  seoDescription: string;
};

export const COLUMNS: Record<ColumnKey, Record<Lang, ColumnCopy>> = {
  'in-hand': {
    hu: {
      slug: 'kezben',
      name: 'Kézben',
      title: 'A hét microbrandje',
      blurb: 'Egy kis műhely egy órája, kézbe véve és sokáig nézve.',
      seoTitle: 'Microbrand órák kézben',
      seoDescription:
        'Független és microbrand órák részletes bemutatói: modellek, alapítók, formaterv és az élmény, amit az óra valóban a csuklón nyújt.',
    },
    en: {
      slug: 'in-hand',
      name: 'In Hand',
      title: "The week's microbrand",
      blurb: 'One watch from one small maker, taken in hand and looked at for a long time.',
      seoTitle: 'Independent and Microbrand Watches',
      seoDescription:
        'In-depth stories about independent and microbrand watches: their models, founders, design and what the watches are really like on the wrist.',
    },
  },
  origins: {
    hu: {
      slug: 'eredet',
      name: 'Eredet',
      title: 'Márkatörténelem',
      blurb: 'Honnan jött valójában egy ház vagy egy referencia — a legenda mögötti tényekkel.',
      seoTitle: 'Óramárkák és ikonikus modellek története',
      seoDescription:
        'Óramárkák és ikonikus modellek eredete ellenőrizhető forrásokkal: tervezők, mérföldkövek és a legendák mögött álló valódi történetek.',
    },
    en: {
      slug: 'origins',
      name: 'Origins',
      title: 'Brand history',
      blurb: 'Where a house or a reference actually came from — with the facts behind the legend.',
      seoTitle: 'Watch Brand and Model Histories',
      seoDescription:
        'The origins of watch brands and iconic models, researched through verifiable sources: designers, milestones and the facts behind the legends.',
    },
  },
  movement: {
    hu: {
      slug: 'szerkezet',
      name: 'Szerkezet',
      title: 'Mérnöki megközelítés',
      blurb: 'A számlap alatti mechanika, alkatrészenként: gátlómű, kronográf, GMT, spirál.',
      seoTitle: 'Óraszerkezetek: működés és mérnöki megoldások',
      seoDescription:
        'Mechanikus és hibrid óraszerkezetek működése érthetően: kronográf, oszlopkerék, gátlómű, Spring Drive és más mérnöki megoldások.',
    },
    en: {
      slug: 'movement',
      name: 'Movement',
      title: 'The engineering',
      blurb: 'The mechanics under the dial, one piece at a time: escapement, chronograph, GMT, hairspring.',
      seoTitle: 'Watch Movements: Mechanics and Engineering',
      seoDescription:
        'How mechanical and hybrid watch movements work: chronographs, column wheels, escapements, Spring Drive and other engineering solutions explained.',
    },
  },
};

/* a „Rólam" oldal szelete nyelvenként */
export const ABOUT_SLUG: Record<Lang, string> = { hu: 'rolam', en: 'about' };
export const WORKSHOP_SLUG: Record<Lang, string> = { hu: 'muhely', en: 'workshop' };

/* ---------- felületi szövegek ---------- */
export const UI = {
  hu: {
    siteTitle: 'Lume — Órás napló',
    siteDescription:
      'Kétnyelvű órás napló: microbrandek kézben, márkatörténelem a legenda mögötti tényekkel, és a számlap alatti mechanika. Heti három írás.',
    tagline: 'Órás napló. Magyarul és angolul.',

    /* fejléc */
    navAriaLabel: 'Fő navigáció',
    about: 'Rólam',
    workshop: 'Műhely',
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

    /* Lume Műhely */
    workshopEyebrow: 'Interaktív szerkezetek',
    workshopTitle: 'Az óra belülről.',
    workshopLede:
      'Működő modellek a pénteki Szerkezet-cikkekhez. Indítsd el, lassítsd le, kapcsold ki — és nézd meg, mit csinál valójában a számlap alatti gépezet.',
    workshopSeoTitle: 'Lume Műhely: interaktív óraszerkezetek',
    workshopSeoDescription:
      'Interaktív modellek mechanikus és hibrid óraszerkezetekhez: gátlómű, Spring Drive, oszlopkerék és a pénteki Lume-cikkek új modelljei.',
    workshopFriday: 'Új modell minden pénteken',
    workshopBench: 'A műhely asztalán',
    workshopNewest: 'Legújabb modell',
    workshopCount: (n: number) => `${n} működő modell`,
    workshopLoad: 'Modell elindítása',
    workshopClose: 'Modell bezárása',
    workshopLive: 'Működő modell',
    workshopRead: 'A teljes cikk',
    workshopNoModels: 'Az első modell hamarosan elkészül.',
    workshopLevel: {
      foundation: 'Alapok',
      intermediate: 'Középhaladó',
      advanced: 'Haladó',
    },
    homeWorkshopEyebrow: 'Lume Műhely · pénteki modell',
    homeWorkshopTitle: 'Ne csak olvasd. Indítsd el.',
    homeWorkshopText:
      'A pénteki cikkekhez működő modellek készülnek. A teljes gyűjtemény egy helyen, és minden új Szerkezet-cikkel automatikusan bővül.',
    homeWorkshopEnter: 'Belépek a Műhelybe',

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
    subError: 'Most nem sikerült. Próbáld újra kicsit később.',

    /* követés — hírlevél helyett egyelőre csak RSS */
    followVia: 'Az új írásokat itt tudod követni:',

    /* lábléc */
    footColumns: 'Rovatok',
    footJournal: 'A napló',
    /* parkolva: a hírlevél-sáv egyelőre nincs kirakva az oldalra */
    footNewsletter: 'Hírlevél',
    footArchive: 'Archívum',
    footCopy: '© 2026 Lume',
    footPlace: 'Lassan írva, Budapesten.',

    /* cikk / lista */
    minutes: (n: number) => `${n} perc`,
    backToColumn: 'Vissza a rovathoz',
    sources: 'Források',
    articleContents: 'A cikk részei',
    articleProgress: 'Olvasási folyamat',
    copyLink: 'Hivatkozás másolása',
    linkCopied: 'Kimásolva',
    copyLinkError: 'Nem sikerült kimásolni',
    continueReading: 'Olvass tovább',
    continueReadingNote: 'Három történet a naplóból',
    noPostsYet: 'Ebben a rovatban még nincs írás. Hamarosan.',
    noPostsYetHome: 'Az első írás hamarosan.',
    readOn: 'Tovább',
  },

  en: {
    siteTitle: 'Lume — A watch journal',
    siteDescription:
      'A bilingual watch journal: microbrands in hand, brand history with the facts behind the legend, and the machinery under the dial. Three pieces a week.',
    tagline: 'A watch journal. In Hungarian and English.',

    navAriaLabel: 'Main navigation',
    about: 'About',
    workshop: 'Workshop',
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

    workshopEyebrow: 'Interactive movements',
    workshopTitle: 'Inside the watch.',
    workshopLede:
      'Working models made for the Friday Movement pieces. Start them, slow them down, switch things off — and see what the machinery beneath the dial actually does.',
    workshopSeoTitle: 'Lume Workshop: Interactive Watch Movements',
    workshopSeoDescription:
      'Interactive models of mechanical and hybrid watch movements: the escapement, Spring Drive, column wheel and new models from Lume’s Friday pieces.',
    workshopFriday: 'A new model every Friday',
    workshopBench: 'On the workbench',
    workshopNewest: 'Newest model',
    workshopCount: (n: number) => `${n} working ${n === 1 ? 'model' : 'models'}`,
    workshopLoad: 'Start the model',
    workshopClose: 'Close the model',
    workshopLive: 'Working model',
    workshopRead: 'Read the full piece',
    workshopNoModels: 'The first model is coming soon.',
    workshopLevel: {
      foundation: 'Foundations',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    homeWorkshopEyebrow: 'Lume Workshop · Friday model',
    homeWorkshopTitle: 'Do not just read it. Set it in motion.',
    homeWorkshopText:
      'The Friday pieces come with working models. The complete collection lives in one place and grows automatically with every new Movement article.',
    homeWorkshopEnter: 'Enter the Workshop',

    ethosEyebrow: 'What this is',
    ethosLineBefore: 'No release-day scramble. No hype. Considered pieces, ',
    ethosLineBold: 'biased toward the object.',

    subTitle: 'New pieces weekly, in your inbox.',
    subNote: 'Nothing else. Unsubscribe whenever.',
    subPlaceholder: 'you@example.com',
    subButton: 'Subscribe',
    subDone: "You're on the list.",
    subError: "That didn't go through. Please try again in a moment.",

    followVia: 'You can follow new pieces here:',

    footColumns: 'Columns',
    footJournal: 'The journal',
    footNewsletter: 'Newsletter',
    footArchive: 'Archive',
    footCopy: '© 2026 Lume',
    footPlace: 'Written slowly, in Budapest.',

    minutes: (n: number) => `${n} min`,
    backToColumn: 'Back to the column',
    sources: 'Sources',
    articleContents: 'In this piece',
    articleProgress: 'Reading progress',
    copyLink: 'Copy link',
    linkCopied: 'Copied',
    copyLinkError: 'Could not copy',
    continueReading: 'Continue reading',
    continueReadingNote: 'Three stories from the journal',
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

/** Lume Műhely / Lume Workshop URL-je. */
export function workshopUrl(lang: Lang): string {
  return `${langBase(lang)}${WORKSHOP_SLUG[lang]}/`;
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
